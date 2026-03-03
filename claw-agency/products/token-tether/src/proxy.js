// ============================================================================
// TokenTether - WebSocket Proxy Server
// ============================================================================
//
// This is the core proxy that sits between OpenClaw clients and the gateway.
// It intercepts all WebSocket traffic, inspects messages for token usage data,
// and reports usage to the tracker.
//
// Architecture:
//   Client --[ws]--> TokenTether:18788 --[ws]--> OpenClaw Gateway:18789
//
// TokenTether acts as a transparent proxy. It forwards all messages in both
// directions without modification UNLESS the tracker says a session should be
// killed, in which case it closes the client connection with an error.
//
// Message inspection:
//   - OpenClaw gateway messages are JSON-based WebSocket frames
//   - We look for "usage" objects in API responses that contain token counts
//   - We also look for model identifiers in requests to track per-model costs
//   - Messages we cannot parse are forwarded unchanged (fail-safe)
// ============================================================================

'use strict';

const WebSocket = require('ws');
const http = require('http');
const { logger } = require('./logger');

class ProxyServer {
  /**
   * @param {object} config - Loaded configuration
   * @param {UsageTracker} tracker - The usage tracker instance
   */
  constructor(config, tracker) {
    this.config = config;
    this.tracker = tracker;

    // Track active connections for cleanup
    // Map<clientWs, { gatewayWs, sessionId, model }>
    this.connections = new Map();

    this.server = null;
    this.wss = null;
  }

  /**
   * Start the proxy server.
   */
  async start() {
    return new Promise((resolve, reject) => {
      // Create an HTTP server that the WebSocket server will attach to.
      // This also lets us serve a health check endpoint.
      this.server = http.createServer((req, res) => {
        if (req.url === '/health') {
          const snapshot = this.tracker.getSnapshot();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'ok',
            version: '1.0.0',
            uptime: process.uptime(),
            connections: this.connections.size,
            totalCostUsd: snapshot.totalCostUsd,
            limitReached: snapshot.limitReached,
          }));
          return;
        }

        if (req.url === '/stats') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(this.tracker.getSnapshot()));
          return;
        }

        res.writeHead(404);
        res.end('TokenTether proxy - use WebSocket');
      });

      // Create the WebSocket server
      this.wss = new WebSocket.Server({ server: this.server });

      this.wss.on('connection', (clientWs, req) => {
        this._handleNewConnection(clientWs, req);
      });

      this.wss.on('error', (err) => {
        logger.error('WebSocket server error:', err.message);
      });

      this.server.listen(this.config.proxyPort, () => {
        logger.info(`Proxy listening on port ${this.config.proxyPort}`);
        logger.info(`Forwarding to gateway at ${this.config.gatewayHost}:${this.config.gatewayPort}`);
        resolve();
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.error(`Port ${this.config.proxyPort} is already in use. Is another instance running?`);
        }
        reject(err);
      });
    });
  }

  /**
   * Stop the proxy server and clean up all connections.
   */
  async stop() {
    logger.info('Stopping proxy server...');

    // Close all active connections
    for (const [clientWs, conn] of this.connections) {
      try {
        if (conn.gatewayWs && conn.gatewayWs.readyState === WebSocket.OPEN) {
          conn.gatewayWs.close(1000, 'TokenTether shutting down');
        }
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.close(1000, 'TokenTether shutting down');
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    this.connections.clear();

    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          if (this.server) {
            this.server.close(() => resolve());
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // =========================================================================
  // Private methods
  // =========================================================================

  /**
   * Handle a new incoming WebSocket connection from a client.
   * We open a corresponding connection to the OpenClaw gateway and
   * bidirectionally proxy all messages.
   */
  _handleNewConnection(clientWs, req) {
    const clientIp = req.socket.remoteAddress || 'unknown';
    const sessionId = this._extractSessionId(req) || `anon-${Date.now()}`;

    logger.info(`New connection: session=${sessionId} from=${clientIp}`);

    // Check if new sessions are allowed
    const check = this.tracker.canStartSession();
    if (!check.allowed) {
      logger.warn(`Blocking new session ${sessionId}: ${check.reason}`);
      // WebSocket close reason must be max 123 bytes
      clientWs.close(4029, check.reason.substring(0, 123));
      return;
    }

    // Open connection to the real OpenClaw gateway
    const gatewayUrl = `ws://${this.config.gatewayHost}:${this.config.gatewayPort}${req.url || ''}`;

    let gatewayWs;
    try {
      gatewayWs = new WebSocket(gatewayUrl, {
        headers: this._forwardHeaders(req),
      });
    } catch (err) {
      logger.error(`Failed to connect to gateway: ${err.message}`);
      clientWs.close(1011, 'Gateway connection failed');
      return;
    }

    // Store connection info
    const connInfo = {
      gatewayWs,
      sessionId,
      model: null,
      connectedAt: Date.now(),
    };
    this.connections.set(clientWs, connInfo);

    // -- Gateway connection events --

    gatewayWs.on('open', () => {
      logger.debug(`Gateway connection established for session ${sessionId}`);
    });

    gatewayWs.on('message', (data, isBinary) => {
      // Inspect the message from gateway (contains API responses with usage)
      this._inspectGatewayMessage(data, connInfo);

      // Forward to client unchanged
      try {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(data, { binary: isBinary });
        }
      } catch (err) {
        logger.error(`Error forwarding to client: ${err.message}`);
      }
    });

    gatewayWs.on('close', (code, reason) => {
      logger.debug(`Gateway closed for session ${sessionId}: ${code} ${reason}`);
      this.tracker.removeSession(sessionId);
      this.connections.delete(clientWs);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(code, reason.toString());
      }
    });

    gatewayWs.on('error', (err) => {
      logger.error(`Gateway WebSocket error for session ${sessionId}: ${err.message}`);
      this.connections.delete(clientWs);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1011, 'Gateway error');
      }
    });

    // -- Client connection events --

    clientWs.on('message', (data, isBinary) => {
      // Inspect client messages (contains model selection, etc.)
      this._inspectClientMessage(data, connInfo);

      // Forward to gateway unchanged
      try {
        if (gatewayWs.readyState === WebSocket.OPEN) {
          gatewayWs.send(data, { binary: isBinary });
        }
      } catch (err) {
        logger.error(`Error forwarding to gateway: ${err.message}`);
      }
    });

    clientWs.on('close', (code, reason) => {
      logger.debug(`Client disconnected: session=${sessionId}`);
      this.tracker.removeSession(sessionId);
      this.connections.delete(clientWs);
      if (gatewayWs.readyState === WebSocket.OPEN) {
        // reason is a Buffer in ws@8+, convert to string for forwarding
        gatewayWs.close(code, reason.toString());
      }
    });

    clientWs.on('error', (err) => {
      logger.error(`Client WebSocket error for session ${sessionId}: ${err.message}`);
      this.connections.delete(clientWs);
      if (gatewayWs.readyState === WebSocket.OPEN) {
        gatewayWs.close(1011, 'Client error');
      }
    });
  }

  /**
   * Inspect a message coming FROM the OpenClaw gateway (API responses).
   * We look for token usage data in the response payload.
   */
  _inspectGatewayMessage(data, connInfo) {
    try {
      const text = data.toString('utf-8');

      // Skip binary or non-JSON messages
      if (!text.startsWith('{') && !text.startsWith('[')) return;

      const msg = JSON.parse(text);

      // ===================================================================
      // Pattern 1: Standard LLM API response with usage object
      // Common in OpenAI-compatible responses:
      // { "usage": { "prompt_tokens": N, "completion_tokens": N, "total_tokens": N } }
      // ===================================================================
      if (msg.usage) {
        const inputTokens = msg.usage.prompt_tokens || msg.usage.input_tokens || 0;
        const outputTokens = msg.usage.completion_tokens || msg.usage.output_tokens || 0;
        const model = msg.model || connInfo.model || '_default';

        if (inputTokens > 0 || outputTokens > 0) {
          connInfo.model = model;
          const result = this.tracker.recordUsage(connInfo.sessionId, model, inputTokens, outputTokens);

          if (!result.allowed) {
            this._killSession(connInfo, result.reason);
          }
        }
      }

      // ===================================================================
      // Pattern 2: Anthropic-style response
      // { "type": "message", "usage": { "input_tokens": N, "output_tokens": N } }
      // ===================================================================
      if (msg.type === 'message' && msg.usage) {
        const inputTokens = msg.usage.input_tokens || 0;
        const outputTokens = msg.usage.output_tokens || 0;
        const model = msg.model || connInfo.model || '_default';

        if (inputTokens > 0 || outputTokens > 0) {
          connInfo.model = model;
          const result = this.tracker.recordUsage(connInfo.sessionId, model, inputTokens, outputTokens);

          if (!result.allowed) {
            this._killSession(connInfo, result.reason);
          }
        }
      }

      // ===================================================================
      // Pattern 3: Streaming delta with usage at the end
      // Some streaming responses include usage only in the final chunk
      // ===================================================================
      if (msg.choices && msg.choices[0] && msg.choices[0].finish_reason && msg.usage) {
        // Already handled by Pattern 1 above
      }

      // ===================================================================
      // Pattern 4: OpenClaw gateway envelope format
      // The gateway may wrap API responses in its own message format.
      // Look for nested usage data.
      // ===================================================================
      if (msg.data && msg.data.usage) {
        const usage = msg.data.usage;
        const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
        const outputTokens = usage.completion_tokens || usage.output_tokens || 0;
        const model = msg.data.model || msg.model || connInfo.model || '_default';

        if (inputTokens > 0 || outputTokens > 0) {
          connInfo.model = model;
          const result = this.tracker.recordUsage(connInfo.sessionId, model, inputTokens, outputTokens);

          if (!result.allowed) {
            this._killSession(connInfo, result.reason);
          }
        }
      }

    } catch (err) {
      // Failed to parse - that's fine, just forward the message unchanged.
      // Never crash because of a weird message format.
      logger.debug(`Could not inspect gateway message: ${err.message}`);
    }
  }

  /**
   * Inspect a message coming FROM the client (API requests).
   * We look for model selection to aid per-model tracking.
   */
  _inspectClientMessage(data, connInfo) {
    try {
      const text = data.toString('utf-8');
      if (!text.startsWith('{') && !text.startsWith('[')) return;

      const msg = JSON.parse(text);

      // Extract model from request
      if (msg.model) {
        connInfo.model = msg.model;
      }
      if (msg.data && msg.data.model) {
        connInfo.model = msg.data.model;
      }

    } catch (err) {
      // Non-JSON or unparseable - ignore
    }
  }

  /**
   * Kill a session by closing both sides of the connection.
   */
  _killSession(connInfo, reason) {
    logger.warn(`Killing session ${connInfo.sessionId}: ${reason}`);

    // Find the client WebSocket for this connection
    for (const [clientWs, conn] of this.connections) {
      if (conn === connInfo) {
        // Send a close frame with the reason
        try {
          if (clientWs.readyState === WebSocket.OPEN) {
            // Send an error message before closing so the client knows why
            clientWs.send(JSON.stringify({
              type: 'error',
              source: 'token-tether',
              message: reason,
              code: 'SPENDING_LIMIT_REACHED',
            }));
            clientWs.close(4029, reason.substring(0, 123)); // WebSocket reason max 123 bytes
          }
        } catch (e) {
          logger.error(`Error killing session: ${e.message}`);
        }

        // Close the gateway side too
        try {
          if (connInfo.gatewayWs && connInfo.gatewayWs.readyState === WebSocket.OPEN) {
            connInfo.gatewayWs.close(1000, 'Session terminated by TokenTether');
          }
        } catch (e) {
          // Ignore
        }

        this.connections.delete(clientWs);
        break;
      }
    }

    // Persist state immediately after killing a session
    this.tracker.persistState();
  }

  /**
   * Extract session ID from the incoming WebSocket request.
   * OpenClaw typically passes session info in the URL path or query params.
   */
  _extractSessionId(req) {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      // Check query params
      if (url.searchParams.has('session')) {
        return url.searchParams.get('session');
      }
      if (url.searchParams.has('sessionId')) {
        return url.searchParams.get('sessionId');
      }

      // Check URL path segments
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }

      // Check headers
      if (req.headers['x-session-id']) {
        return req.headers['x-session-id'];
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Forward relevant headers from the client to the gateway.
   * We strip hop-by-hop headers but preserve auth and custom headers.
   */
  _forwardHeaders(req) {
    const headers = {};
    const skipHeaders = new Set([
      'host', 'connection', 'upgrade', 'sec-websocket-key',
      'sec-websocket-version', 'sec-websocket-extensions',
      'sec-websocket-protocol',
    ]);

    for (const [key, value] of Object.entries(req.headers)) {
      if (!skipHeaders.has(key.toLowerCase())) {
        headers[key] = value;
      }
    }

    return headers;
  }
}

module.exports = { ProxyServer };
