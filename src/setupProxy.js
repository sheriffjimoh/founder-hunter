const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const openaiKey = process.env.REACT_APP_OPENAI_KEY;
  const perplexityKey = process.env.REACT_APP_PERPLEXITY_KEY;
  const phToken = process.env.REACT_APP_PH_TOKEN;
  const hunterKey = process.env.REACT_APP_HUNTER_KEY;

  console.log('[proxy] OpenAI key:', openaiKey ? `${openaiKey.slice(0, 12)}...` : 'MISSING');
  console.log('[proxy] Perplexity key:', perplexityKey ? `${perplexityKey.slice(0, 10)}...` : 'MISSING');
  console.log('[proxy] Hunter key:', hunterKey ? `${hunterKey.slice(0, 10)}...` : 'MISSING');
  console.log('[proxy] PH token:', phToken ? 'set' : 'not set');

  // OpenAI API
  app.use('/api/openai', createProxyMiddleware({
    target: 'https://api.openai.com',
    changeOrigin: true,
    pathRewrite: { '^/api/openai': '' },
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.setHeader('Authorization', `Bearer ${openaiKey || ''}`);
        console.log('[proxy] Forwarding to OpenAI:', proxyReq.path);
      },
      error: (err, req, res) => {
        console.error('[proxy] OpenAI proxy error:', err.message);
      },
    },
  }));

  // Perplexity API (OpenAI-compatible format)
  app.use('/api/perplexity', createProxyMiddleware({
    target: 'https://api.perplexity.ai',
    changeOrigin: true,
    pathRewrite: { '^/api/perplexity': '' },
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.setHeader('Authorization', `Bearer ${perplexityKey || ''}`);
        console.log('[proxy] Forwarding to Perplexity:', proxyReq.path);
      },
      error: (err, req, res) => {
        console.error('[proxy] Perplexity proxy error:', err.message);
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

  // Hunter.io API — injects api_key as query param
  if (hunterKey) {
    app.use('/api/hunter', createProxyMiddleware({
      target: 'https://api.hunter.io',
      changeOrigin: true,
      pathRewrite: { '^/api/hunter': '' },
      on: {
        proxyReq: (proxyReq) => {
          // Append api_key to the query string
          const separator = proxyReq.path.includes('?') ? '&' : '?';
          proxyReq.path += `${separator}api_key=${hunterKey}`;
          console.log('[proxy] Forwarding to Hunter:', proxyReq.path.replace(hunterKey, '***'));
        },
        error: (err, req, res) => {
          console.error('[proxy] Hunter proxy error:', err.message);
        },
      },
    }));
  }
};

