'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const CONFIG_DIR = path.resolve(__dirname, '..', 'config', 'tenants');
const DEFAULT_TENANT_ID = 'default';
const FILE_PREFIX = 'tenant-';
const FILE_EXT = '.json';

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------
let tenantCache = new Map();   // tenantId -> parsed config object
let watcher = null;            // fs.FSWatcher instance (if watching)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive a tenant ID from a filename.
 *   "tenant-good-luggage.json" -> "good-luggage"
 *   "tenant-default.json"      -> "default"
 * Returns null if the filename does not match the expected pattern.
 */
function filenameToId(filename) {
  if (!filename.startsWith(FILE_PREFIX) || !filename.endsWith(FILE_EXT)) {
    return null;
  }
  return filename.slice(FILE_PREFIX.length, -FILE_EXT.length);
}

/**
 * Derive a filename from a tenant ID.
 *   "good-luggage" -> "tenant-good-luggage.json"
 */
function idToFilename(tenantId) {
  return `${FILE_PREFIX}${tenantId}${FILE_EXT}`;
}

/**
 * Full path on disk for a given tenant ID.
 */
function idToFilepath(tenantId) {
  return path.join(CONFIG_DIR, idToFilename(tenantId));
}

/**
 * Read and parse a single tenant file. Returns the parsed object or null on
 * any error (missing file, bad JSON, etc.).
 */
function readTenantFile(filepath) {
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // Log but do not throw -- callers handle null gracefully
    if (err.code !== 'ENOENT') {
      console.error(`[tenant-manager] Failed to read ${filepath}: ${err.message}`);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Core: load all tenants into cache
// ---------------------------------------------------------------------------

function loadAll() {
  tenantCache.clear();

  if (!fs.existsSync(CONFIG_DIR)) {
    console.warn(`[tenant-manager] Config directory does not exist: ${CONFIG_DIR}`);
    return;
  }

  const files = fs.readdirSync(CONFIG_DIR);
  for (const file of files) {
    const id = filenameToId(file);
    if (id === null) continue;

    const config = readTenantFile(path.join(CONFIG_DIR, file));
    if (config) {
      tenantCache.set(id, config);
    }
  }

  console.log(`[tenant-manager] Loaded ${tenantCache.size} tenant(s): ${[...tenantCache.keys()].join(', ')}`);
}

// ---------------------------------------------------------------------------
// Hot-reload via fs.watch
// ---------------------------------------------------------------------------

function startWatching() {
  if (watcher) return; // already watching

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  watcher = fs.watch(CONFIG_DIR, { persistent: false }, (eventType, filename) => {
    if (!filename || !filename.endsWith(FILE_EXT)) return;

    const id = filenameToId(filename);
    if (id === null) return;

    const filepath = path.join(CONFIG_DIR, filename);

    if (fs.existsSync(filepath)) {
      const config = readTenantFile(filepath);
      if (config) {
        tenantCache.set(id, config);
        console.log(`[tenant-manager] Reloaded tenant: ${id}`);
      }
    } else {
      // File was deleted
      tenantCache.delete(id);
      console.log(`[tenant-manager] Removed tenant from cache: ${id}`);
    }
  });

  console.log('[tenant-manager] Watching for config changes');
}

function stopWatching() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log('[tenant-manager] Stopped watching for config changes');
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the config for a tenant. Falls back to the default tenant config if the
 * requested tenant is not found.
 *
 * @param {string} tenantId
 * @returns {object|null} The tenant config, or null if even the default is missing.
 */
function getTenantConfig(tenantId) {
  if (tenantCache.size === 0) {
    loadAll();
    startWatching();
  }

  const config = tenantCache.get(tenantId);
  if (config) return config;

  if (tenantId !== DEFAULT_TENANT_ID) {
    console.warn(`[tenant-manager] Tenant "${tenantId}" not found, falling back to default`);
    return tenantCache.get(DEFAULT_TENANT_ID) || null;
  }

  return null;
}

/**
 * List all loaded tenant IDs.
 *
 * @returns {string[]}
 */
function listTenants() {
  if (tenantCache.size === 0) {
    loadAll();
    startWatching();
  }
  return [...tenantCache.keys()];
}

/**
 * Add (or overwrite) a tenant config. Writes to disk and updates the cache.
 *
 * @param {string} tenantId
 * @param {object} config
 * @returns {string} The file path that was written.
 */
function addTenant(tenantId, config) {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('tenantId must be a non-empty string');
  }
  if (!config || typeof config !== 'object') {
    throw new Error('config must be a non-null object');
  }

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const filepath = idToFilepath(tenantId);
  fs.writeFileSync(filepath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  tenantCache.set(tenantId, config);
  console.log(`[tenant-manager] Added tenant: ${tenantId} -> ${filepath}`);
  return filepath;
}

/**
 * Remove a tenant config from disk and cache.
 *
 * @param {string} tenantId
 * @returns {boolean} True if the tenant existed and was removed.
 */
function removeTenant(tenantId) {
  if (tenantId === DEFAULT_TENANT_ID) {
    throw new Error('Cannot remove the default tenant');
  }

  const filepath = idToFilepath(tenantId);
  const existed = tenantCache.delete(tenantId);

  try {
    fs.unlinkSync(filepath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  if (existed) {
    console.log(`[tenant-manager] Removed tenant: ${tenantId}`);
  }
  return existed;
}

// ---------------------------------------------------------------------------
// Bootstrap: load on first require
// ---------------------------------------------------------------------------
loadAll();
startWatching();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  getTenantConfig,
  listTenants,
  addTenant,
  removeTenant,
  // Exposed for testing / manual control
  reload: loadAll,
  stopWatching,
};
