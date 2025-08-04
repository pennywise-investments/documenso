/**
 * Vercel serverless function that imports and runs the built Hono server
 * This file bridges the gap between Vercel's expected API structure
 * and our Hono + React Router hybrid architecture.
 */
// Import the pre-built handler from main.js which already combines
// the Hono server and React Router app
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import handle from 'hono-react-router-adapter/node';

import server from '../build/server/hono/server/router.js';
import * as build from '../build/server/index.js';

// Add static file serving middleware (same as main.js)
server.use(
  serveStatic({
    root: 'build/client',
    onFound: (path, c) => {
      if (path.startsWith('./build/client/assets')) {
        // Hard cache assets with hashed file names.
        c.header('Cache-Control', 'public, immutable, max-age=31536000');
      } else {
        // Cache with revalidation for rest of static files.
        c.header('Cache-Control', 'public, max-age=0, stale-while-revalidate=86400');
      }
    },
  }),
);

// Create the hybrid handler
const handler = handle(build, server);

// Export for Vercel
export default handler.fetch;
