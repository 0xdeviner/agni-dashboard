const express = require('express');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/stats
router.get('/stats', async (req, res) => {
  const { Domain, Subdomain } = req.app.locals.models;
  const [domains, subdomains, live, takeovers] = await Promise.all([
    Domain.countAll(),
    Subdomain.countAll(),
    Subdomain.countLive(),
    Subdomain.countTakeovers()
  ]);
  res.json({ domains, subdomains, live_subdomains: live, takeovers });
});

// GET /api/recent
router.get('/recent', async (req, res) => {
  const { Subdomain } = req.app.locals.models;
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 200);
  const items = await Subdomain.listRecent(limit);
  res.json(items);
});

// GET /api/domains
router.get('/domains', async (req, res) => {
  const { Domain } = req.app.locals.models;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 200);
  const result = await Domain.listPaginated(page, limit);
  res.json(result);
});

// GET /api/domains/:domain/subdomains
router.get('/domains/:domain/subdomains', async (req, res) => {
  const { Subdomain } = req.app.locals.models;
  const domain = req.params.domain;

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 1000);

  const filters = {
    is_alive: req.query.is_alive === 'true',
    has_takeover: req.query.has_takeover === 'true'
  };

  const result = await Subdomain.listByDomain(domain, filters, page, limit);
  res.json(result);
});

// GET /api/subdomains (search)
router.get('/subdomains', async (req, res) => {
  const { Subdomain } = req.app.locals.models;

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 1000);

  const result = await Subdomain.search(
    {
      domain: req.query.domain,
      subdomain: req.query.subdomain,
      is_alive: req.query.is_alive === 'true',
      has_takeover: req.query.has_takeover === 'true',
      status_code: req.query.status_code,
      q: req.query.q
    },
    page,
    limit
  );

  res.json(result);
});

// GET /api/takeovers
router.get('/takeovers', async (req, res) => {
  const { Subdomain } = req.app.locals.models;

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 1000);

  const result = await Subdomain.listTakeovers(page, limit);
  res.json(result);
});

// GET /api/export/subdomains (TXT)
router.get('/export/subdomains', async (req, res) => {
  const { Subdomain } = req.app.locals.models;

  const lines = await Subdomain.exportSubdomains({
    domain: req.query.domain,
    is_alive: req.query.is_alive === 'true',
    has_takeover: req.query.has_takeover === 'true'
  });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=subdomains.txt');
  res.send(lines.join('\n'));
});

// GET /api/export/takeovers (TXT)
router.get('/export/takeovers', async (req, res) => {
  const { Subdomain } = req.app.locals.models;

  const lines = await Subdomain.exportTakeovers();

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=takeovers.txt');
  res.send(lines.join('\n'));
});

module.exports = router;