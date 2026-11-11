// All site content lives here so copy edits never touch templates.
const site = {
  name: 'Cash-Arc',
  domain: 'https://cash-arc.com',
  tagline: 'Fast business funding up to $250,000',
  logo: 'https://storage.googleapis.com/msgsndr/ia4IJ2mcMhzJ0nKV7ajC/media/68c0464ee7a3ab7957136a0b.png',
  // TODO: confirm with client before launch
  phone: '',          // e.g. '(555) 555-5555'
  email: '',          // e.g. 'apply@cash-arc.com'
  maxFunding: 250000,
};

const products = [
  {
    slug: 'merchant-cash-advance',
    name: 'Merchant Cash Advance',
    short: 'Upfront capital repaid from a share of future sales.',
    range: '$5,000 – $250,000',
    speed: 'As fast as 24 hours',
    intro: 'A merchant cash advance gives your business a lump sum today in exchange for a portion of future receivables. Approval is based mainly on your sales history, not your personal credit score, which makes it one of the most accessible forms of business funding.',
    bestFor: ['Businesses with steady card or deposit volume', 'Owners who need cash this week, not next quarter', 'Seasonal businesses bridging a slow stretch', 'Owners who were turned down by a bank'],
    howItWorks: ['Share basic business info and recent bank statements.', 'We review your deposit history and present an offer.', 'Sign electronically and receive funds, often within one business day.', 'Remittances are collected automatically on a set schedule.'],
    faqs: [
      ['Is a merchant cash advance a loan?', 'No. An MCA is a purchase of future receivables, not a loan. Terms are based on your revenue rather than a fixed interest rate.'],
      ['What credit score do I need?', 'There is no hard minimum. Approval leans heavily on your monthly deposits and time in business.'],
      ['Can I get an MCA if I already have one?', 'Often, yes, depending on your revenue and existing obligations. Tell us what you have open when you apply.'],
    ],
  },
  {
    slug: 'working-capital',
    name: 'Working Capital Funding',
    short: 'Cover payroll, inventory and day-to-day expenses.',
    range: '$10,000 – $250,000',
    speed: '1 – 3 business days',
    intro: 'Working capital funding keeps your operation running smoothly when cash flow is tight. Use it for payroll, inventory, rent, marketing or any short-term need without giving up equity.',
    bestFor: ['Covering payroll during a slow month', 'Stocking up on inventory ahead of a busy season', 'Taking on a large job before the client pays', 'Smoothing out uneven cash flow'],
    howItWorks: ['Apply online in about two minutes.', 'Connect or upload your last few months of bank statements.', 'Review your offer with a funding specialist.', 'Get funded straight to your business account.'],
    faqs: [
      ['What can I use working capital for?', 'Almost any legitimate business purpose: payroll, inventory, equipment repairs, marketing, rent or taking on new contracts.'],
      ['How much can I qualify for?', 'Most offers are sized around your average monthly revenue. Our estimate tool on the homepage gives you a ballpark in seconds.'],
      ['Do I need collateral?', 'Most of our working capital programs do not require specific collateral.'],
    ],
  },
  {
    slug: 'business-line-of-credit',
    name: 'Business Line of Credit',
    short: 'Draw what you need, when you need it.',
    range: '$10,000 – $250,000',
    speed: '1 – 5 business days',
    intro: 'A business line of credit gives you a pool of capital to draw from as needs come up. You only pay on what you use, which makes it a flexible safety net for growing businesses.',
    bestFor: ['Businesses with recurring but unpredictable expenses', 'Owners who want funds ready before an emergency', 'Companies managing slow-paying customers', 'Building a stronger funding history'],
    howItWorks: ['Apply and share recent bank statements.', 'Receive an approved credit limit.', 'Draw funds whenever you need them.', 'Repay and draw again as your balance frees up.'],
    faqs: [
      ['How is a line of credit different from an advance?', 'With a line you draw only what you need and pay on the balance you use. An advance is a single lump sum.'],
      ['Is a line of credit harder to qualify for?', 'Lines usually call for stronger credit and longer time in business than an advance. If you do not qualify, we will show you other options.'],
    ],
  },
  {
    slug: 'equipment-financing',
    name: 'Equipment Financing',
    short: 'Get the machines, vehicles and tools you need now.',
    range: '$10,000 – $250,000',
    speed: '2 – 5 business days',
    intro: 'Equipment financing lets you buy or upgrade the equipment that drives revenue without draining your cash reserves. The equipment itself typically secures the financing.',
    bestFor: ['Trucks, trailers and work vehicles', 'Restaurant and kitchen equipment', 'Construction and landscaping machinery', 'Medical, dental and salon equipment'],
    howItWorks: ['Send us the equipment quote or invoice.', 'We match you with a financing option.', 'Approve terms and we pay the vendor.', 'Put the equipment to work right away.'],
    faqs: [
      ['Can I finance used equipment?', 'In many cases, yes. Share the quote and we will confirm eligibility.'],
      ['Do I need a down payment?', 'It depends on your profile and the equipment. Many programs require little or nothing down.'],
    ],
  },
];

const industries = [
  { slug: 'restaurants', name: 'Restaurants', icon: 'utensils', need: 'kitchen equipment, renovations, payroll and slow-season cash flow', detail: 'Restaurants run on thin margins and unpredictable traffic. Funding based on your card sales lets you replace a walk-in cooler, staff up for the holidays or get through a slow month without waiting on a bank.' },
  { slug: 'trucking', name: 'Trucking & Transportation', icon: 'truck', need: 'fuel, repairs, insurance and new trucks', detail: 'Brokers and shippers can take 30 to 90 days to pay. Funding fills the gap so you can keep trucks moving, cover fuel and repairs, and take on more loads.' },
  { slug: 'construction', name: 'Construction & Contractors', icon: 'hardhat', need: 'materials, crew payroll and new equipment', detail: 'Big jobs mean big upfront costs long before the final draw comes in. Working capital lets contractors buy materials, cover crews and bid on larger projects with confidence.' },
  { slug: 'retail', name: 'Retail Stores', icon: 'bag', need: 'inventory, store upgrades and seasonal stock', detail: 'Stock up ahead of your busiest season, refresh your storefront or open a second location. Funding is based on your sales, not just your credit.' },
  { slug: 'medical-practices', name: 'Medical & Dental Practices', icon: 'medical', need: 'equipment, expansion and insurance reimbursement gaps', detail: 'Insurance reimbursements can lag for weeks. Practices use fast funding for new equipment, added staff and expansion while claims are processed.' },
  { slug: 'auto-repair', name: 'Auto Repair Shops', icon: 'wrench', need: 'lifts, diagnostic tools, parts and payroll', detail: 'Upgrade bays, buy diagnostic equipment or keep parts in stock so jobs never stall. Fast approvals keep your shop turning cars around.' },
  { slug: 'salons-and-spas', name: 'Salons & Spas', icon: 'sparkle', need: 'renovations, equipment, product inventory and marketing', detail: 'Refresh your space, add treatment rooms or launch a marketing push. Funding is sized around your monthly bookings and card volume.' },
  { slug: 'ecommerce', name: 'E-commerce Brands', icon: 'cart', need: 'inventory, ad spend and fulfillment', detail: 'Scale ad spend and buy inventory in bulk without waiting on payouts. Revenue-based funding grows with your store.' },
];

const faqs = [
  ['How fast can I get funded?', 'Many businesses are approved the same day they apply and funded within 24 hours of signing. Timing depends on how quickly we receive your bank statements.'],
  ['How much can I qualify for?', 'Funding ranges up to $250,000. The amount is driven mostly by your average monthly revenue and time in business.'],
  ['Will applying affect my credit score?', 'Starting an application does not require a hard credit pull. If a program needs one, we will tell you before it happens.'],
  ['What do I need to apply?', 'Basic business details, your contact information and your most recent business bank statements, typically the last three to four months.'],
  ['What are the minimum requirements?', 'Most programs look for at least 6 months in business and $15,000 or more in monthly revenue. If you fall short, apply anyway and we will look at options.'],
  ['Do you fund businesses in every state?', 'Yes. We work with businesses across the United States.'],
];

module.exports = { site, products, industries, faqs };
