const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const { site, products, industries, faqs } = require('./data/site');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE = (process.env.SITE_URL || site.domain).replace(/\/$/, '');
// Same Zapier hook the old site used. Override in Railway with ZAPIER_WEBHOOK_URL (or point it at a GHL inbound webhook).
const WEBHOOK = process.env.ZAPIER_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/21865673/udwwmy5/';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'img-src': ["'self'", 'data:', 'https://storage.googleapis.com'],
      'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://connect.facebook.net'],
      'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://www.facebook.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    },
  },
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '30d', etag: true }));

// Redirect www -> apex and strip trailing slashes for clean canonicals
app.use((req, res, next) => {
  if (req.hostname && req.hostname.startsWith('www.')) {
    return res.redirect(301, `https://${req.hostname.slice(4)}${req.originalUrl}`);
  }
  if (req.path.length > 1 && req.path.endsWith('/')) {
    return res.redirect(301, req.path.slice(0, -1) + (req.url.slice(req.path.length) || ''));
  }
  next();
});

app.locals.site = site;
app.locals.products = products;
app.locals.industries = industries;
app.locals.year = new Date().getFullYear();
app.locals.ga = process.env.GA_MEASUREMENT_ID || '';
app.locals.fbPixel = process.env.FB_PIXEL_ID || '';

const render = (res, view, opts) => res.render(view, { canonical: BASE + (opts.path || '/'), base: BASE, ...opts });

app.get('/', (req, res) => render(res, 'home', {
  path: '/',
  title: 'Fast Business Funding up to $250K | Cash-Arc',
  description: 'Get business funding up to $250,000 with Cash-Arc. Apply in 2 minutes, get a decision same day and funds in as little as 24 hours. No hard credit pull to apply.',
  faqs,
}));

app.get('/apply', (req, res) => render(res, 'apply', {
  path: '/apply',
  title: 'Apply for Business Funding | Cash-Arc',
  description: 'Apply for up to $250,000 in business funding in about two minutes. No hard credit pull to apply and decisions as fast as same day.',
  prefill: { amount: req.query.amount || '', revenue: req.query.revenue || '' },
}));

app.get('/funding', (req, res) => render(res, 'products', {
  path: '/funding',
  title: 'Business Funding Options | Cash-Arc',
  description: 'Merchant cash advances, working capital, business lines of credit and equipment financing up to $250,000 for small businesses nationwide.',
}));

app.get('/funding/:slug', (req, res, next) => {
  const p = products.find(x => x.slug === req.params.slug);
  if (!p) return next();
  render(res, 'product', {
    path: `/funding/${p.slug}`,
    title: `${p.name} up to $250K | Cash-Arc`,
    description: `${p.short} ${p.range}, funded ${p.speed.toLowerCase()}. Apply online with Cash-Arc in about two minutes.`,
    p,
  });
});

app.get('/industries', (req, res) => render(res, 'industries', {
  path: '/industries',
  title: 'Industries We Fund | Cash-Arc',
  description: 'Cash-Arc funds restaurants, trucking companies, contractors, retailers, medical practices, auto shops, salons and e-commerce brands nationwide.',
}));

app.get('/industries/:slug', (req, res, next) => {
  const i = industries.find(x => x.slug === req.params.slug);
  if (!i) return next();
  render(res, 'industry', {
    path: `/industries/${i.slug}`,
    title: `${i.name} Business Funding | Cash-Arc`,
    description: `Fast funding for ${i.name.toLowerCase()} to cover ${i.need}. Up to $250,000, decisions same day. Apply with Cash-Arc.`,
    i,
  });
});

app.get('/how-it-works', (req, res) => render(res, 'how', {
  path: '/how-it-works',
  title: 'How Business Funding Works | Cash-Arc',
  description: 'Apply in two minutes, share your bank statements, review your offer and get funded in as little as 24 hours. Here is exactly how Cash-Arc works.',
  faqs,
}));

app.get('/about', (req, res) => render(res, 'about', {
  path: '/about',
  title: 'About Cash-Arc | Business Funding Made Simple',
  description: 'Cash-Arc helps small and mid-sized businesses across America get fast, simple funding up to $250,000.',
}));

app.get('/contact', (req, res) => render(res, 'contact', {
  path: '/contact',
  title: 'Contact Cash-Arc | Talk to a Funding Specialist',
  description: 'Questions about business funding? Send Cash-Arc a message and a funding specialist will get back to you quickly.',
}));

app.get('/privacy', (req, res) => render(res, 'legal', { path: '/privacy', title: 'Privacy Policy | Cash-Arc', description: 'Cash-Arc privacy policy.', doc: 'privacy' }));
app.get('/terms', (req, res) => render(res, 'legal', { path: '/terms', title: 'Terms of Use | Cash-Arc', description: 'Cash-Arc terms of use.', doc: 'terms' }));

app.get('/thank-you', (req, res) => render(res, 'thanks', {
  path: '/thank-you', title: 'Application Received | Cash-Arc', description: 'Thank you for applying with Cash-Arc.', noindex: true,
}));

// ---- Lead intake: browser -> our server -> webhook (keeps the hook URL out of the page source)
app.post('/api/lead', async (req, res) => {
  const b = req.body || {};
  // Plain HTML form post (JS disabled) gets redirects instead of JSON
  const html = req.is('application/x-www-form-urlencoded');
  const fail = (code, error) => html ? res.redirect(303, (req.get('referer') || '/apply')) : res.status(code).json({ ok: false, error });
  if (b.company_website) return html ? res.redirect(303, '/thank-you') : res.json({ ok: true }); // honeypot
  const required = ['firstName', 'lastName', 'email', 'phone'];
  const missing = required.filter(k => !String(b[k] || '').trim());
  if (missing.length) return fail(400, 'Please fill in all required fields.');
  if (!/^\S+@\S+\.\S+$/.test(b.email)) return fail(400, 'Please enter a valid email.');
  const digits = String(b.phone).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (digits.length < 10) return fail(400, 'Please enter a valid phone number.');

  const clean = v => String(v || '').trim().slice(0, 2000);
  const payload = {
    firstName: clean(b.firstName),
    lastName: clean(b.lastName),
    email: clean(b.email).toLowerCase(),
    phone: digits.length === 10 ? `+1${digits}` : `+${digits}`,
    message: clean(b.message),
    businessName: clean(b.businessName),
    amountRequested: clean(b.amount),
    monthlyRevenue: clean(b.revenue),
    timeInBusiness: clean(b.tib),
    industry: clean(b.industry),
    useOfFunds: clean(b.use),
    formType: clean(b.formType) || 'application',
    smsConsent: b.consent === 'on' || b.consent === true || b.consent === 'true',
    pageUrl: clean(b.pageUrl),
    utm_source: clean(b.utm_source), utm_medium: clean(b.utm_medium), utm_campaign: clean(b.utm_campaign),
    utm_term: clean(b.utm_term), utm_content: clean(b.utm_content), gclid: clean(b.gclid), fbclid: clean(b.fbclid),
    submittedAt: new Date().toISOString(),
    ip: req.ip,
    source: 'cash-arc.com',
  };

  try {
    const r = await fetch(WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`Webhook ${r.status}`);
    html ? res.redirect(303, '/thank-you') : res.json({ ok: true });
  } catch (e) {
    // Log the full lead so nothing is lost if the webhook is down — recoverable from Railway logs
    console.error('Lead webhook failed:', e.message, JSON.stringify(payload));
    fail(502, 'Something went wrong. Please try again or call us.');
  }
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /thank-you\nDisallow: /api/\n\nSitemap: ${BASE}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const urls = ['/', '/apply', '/funding', '/industries', '/how-it-works', '/about', '/contact', '/privacy', '/terms',
    ...products.map(p => `/funding/${p.slug}`), ...industries.map(i => `/industries/${i.slug}`)];
  const today = new Date().toISOString().slice(0, 10);
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${BASE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>`);
});

app.get('/healthz', (req, res) => res.send('ok'));

app.use((req, res) => res.status(404).render('404', {
  canonical: BASE + req.path, base: BASE, title: 'Page Not Found | Cash-Arc', description: 'Page not found.', noindex: true,
}));

app.listen(PORT, () => console.log(`Cash-Arc running on :${PORT}`));
