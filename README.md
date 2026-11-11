# Cash-Arc website

Server-rendered rebuild of cash-arc.com (replaces the bolt.new single-page app).
Node 20+ / Express / EJS. No build step.

## Deploy on Railway
1. Create a GitHub repo (e.g. `ZacLamb/cash-arc`) and upload every file in this folder.
2. Railway → New Project → Deploy from GitHub repo → pick the repo. Railway detects Node and runs `npm start`.
3. Settings → Networking → add custom domain `cash-arc.com` (and `www.cash-arc.com`, which 301s to the apex). Update DNS at the registrar.

## Environment variables (all optional)
| Variable | Purpose |
|---|---|
| `ZAPIER_WEBHOOK_URL` | Where leads are POSTed as JSON. Defaults to the same Zapier hook the old site used. Swap to a GHL inbound webhook to cut Zapier out. |
| `SITE_URL` | Canonical base URL. Default `https://cash-arc.com`. |
| `GA_MEASUREMENT_ID` | Google Analytics 4 ID (G-XXXX). Fires `generate_lead` on the thank-you page. |
| `FB_PIXEL_ID` | Meta Pixel ID. Fires `Lead` on the thank-you page. |

## Lead payload
`firstName, lastName, email, phone (+1E164), message, businessName, amountRequested, monthlyRevenue, timeInBusiness, industry, useOfFunds, formType (application|contact), smsConsent, pageUrl, utm_*, gclid, fbclid, submittedAt, ip, source`

The original field names (`firstName, lastName, email, phone, message`) are unchanged, so the existing Zap keeps working. Map the new fields in Zapier/GHL when ready.
If the webhook ever fails, the full lead is written to Railway logs ("Lead webhook failed").

## Edit content
All copy (products, industries, FAQs, phone, email) lives in `data/site.js`.

## Before launch — confirm with the client
- [ ] Phone number and email (`data/site.js` → `phone`, `email`; shown in header/footer when set)
- [ ] Which products they actually offer (line of credit and equipment financing were added — delete from `data/site.js` if not offered)
- [ ] Qualification minimums on the homepage (6 months / $15K per month)
- [ ] Privacy Policy and Terms are placeholders — have them reviewed
