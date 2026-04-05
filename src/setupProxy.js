const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const anthropicKey = process.env.REACT_APP_ANTHROPIC_KEY;
  const phToken = process.env.REACT_APP_PH_TOKEN;

  console.log('[proxy] Anthropic key:', anthropicKey ? `${anthropicKey.slice(0, 10)}...` : 'MISSING');
  console.log('[proxy] PH token:', phToken ? 'set' : 'not set');

  // Anthropic Claude API
  app.use('/api/claude', createProxyMiddleware({
    target: 'https://api.anthropic.com',
    changeOrigin: true,
    pathRewrite: { '^/api/claude': '' },
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.setHeader('x-api-key', anthropicKey || '');
        proxyReq.setHeader('anthropic-version', '2023-06-01');
        console.log('[proxy] Forwarding to Anthropic:', proxyReq.path);
      },
      error: (err, req, res) => {
        console.error('[proxy] Anthropic proxy error:', err.message);
      },
    },
  }));

  // Product Hunt GraphQL API
  if (phToken) {
    app.use('/api/producthunt', createProxyMiddleware({
      target: 'https://api.producthunt.com',
      changeOrigin: true,
      pathRewrite: { '^/api/producthunt': '/v2/api/graphql' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('Authorization', `Bearer ${phToken}`);
        },
      },
    }));
  }
};

