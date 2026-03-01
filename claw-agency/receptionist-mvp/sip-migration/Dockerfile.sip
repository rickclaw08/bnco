FROM node:22-slim

WORKDIR /app

# Copy package files from parent (shared dependencies)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy shared lib
COPY lib/ ./lib/

# Copy tenant configs
COPY config/ ./config/

# Copy the SIP migration server
COPY sip-migration/server-sip.js ./server-sip.js

EXPOSE 8080

CMD ["node", "server-sip.js"]
