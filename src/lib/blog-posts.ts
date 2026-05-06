export type BlogPost = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  body: { heading?: string; paragraphs: string[] }[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "google-maps-7-steps",
    tag: "Get Found Online",
    title: "Get Your Business On Google Maps in 7 Simple Steps",
    excerpt:
      "The exact free setup most local SA businesses skip — and why it brings in more customers than Facebook ads.",
    readTime: "10 min",
    date: "Free guide",
    body: [
      {
        paragraphs: [
          "Most South African small businesses spend money on Facebook ads before they've claimed the one free listing that brings in real walk-in customers: Google Business Profile. Here's the 7-step setup we use for every client.",
        ],
      },
      {
        heading: "1. Create your Google Business Profile",
        paragraphs: [
          "Go to google.com/business and sign in with the Gmail you want associated with the business. Use your real trading name — exactly as it appears on your signage.",
        ],
      },
      {
        heading: "2. Pick the right primary category",
        paragraphs: [
          "Your category drives 80% of who finds you. \"Hair salon\" beats \"Beauty salon\" if hair is your main service. You can add up to 9 secondary categories afterwards.",
        ],
      },
      {
        heading: "3. Add your service area",
        paragraphs: [
          "If customers come to you, set a physical address. If you travel to them (cleaners, mechanics, mobile beauticians), set a service area covering the suburbs you serve.",
        ],
      },
      {
        heading: "4. Verify by postcard, phone or video",
        paragraphs: [
          "Verification is the gate — until you complete it, you don't appear on Maps. Postcard takes 5–14 days in SA. Video verification is faster if available.",
        ],
      },
      {
        heading: "5. Upload 10+ real photos",
        paragraphs: [
          "Storefront, inside, products/services, team. Profiles with 10+ photos get 2.7× more direction requests than empty ones.",
        ],
      },
      {
        heading: "6. Add your services and prices",
        paragraphs: [
          "List every service with a short description and a starting price. This is what Google shows in the side panel and what customers compare you on.",
        ],
      },
      {
        heading: "7. Ask 5 happy customers for reviews",
        paragraphs: [
          "Send a WhatsApp with your review link. Five 5-star reviews moves you ahead of competitors who've been around for years but never asked.",
        ],
      },
      {
        paragraphs: [
          "Want us to do this for you? It's part of our Care Plan — message us on WhatsApp and we'll have you live in 7–10 days.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-catalog-vs-website",
    tag: "Get Found Online",
    title: "Why Your WhatsApp Catalog Is Costing You Sales",
    excerpt:
      "How a R1,500 one-page website outperforms scrolling through 47 WhatsApp images — with real before/after numbers.",
    readTime: "6 min",
    date: "By Suzan",
    body: [
      {
        paragraphs: [
          "WhatsApp Catalog is great — until your customer has to scroll past 47 product photos to find the one thing they want. Here's what we see when clients move from a catalog-only setup to a one-page site.",
        ],
      },
      {
        heading: "The friction problem",
        paragraphs: [
          "On WhatsApp, customers can't search, filter, or share a single product link with a friend. They get tired and close the chat. We tracked one beauty client who was losing 3 out of every 5 enquiries to abandoned scrolling.",
        ],
      },
      {
        heading: "What changed with a one-page site",
        paragraphs: [
          "We built a R1,500 single-page site with categories, prices, and a \"WhatsApp this product\" button on each item. Enquiries went from 12/week to 31/week in the first month — same traffic source, less drop-off.",
        ],
      },
      {
        heading: "When to keep the catalog",
        paragraphs: [
          "If you sell <10 SKUs and your customers are repeat buyers who already know your range, a catalog is fine. Above that, a website pays for itself fast.",
        ],
      },
    ],
  },
  {
    slug: "excel-tricks-spaza-salon",
    tag: "Run Your Business Better",
    title: "5 Excel Tricks That Save SA Spaza & Salon Owners 4 Hours a Week",
    excerpt:
      "Simple formulas and templates for stock, sales, and daily takings — no accountant needed.",
    readTime: "7 min",
    date: "By Suzan",
    body: [
      {
        paragraphs: [
          "You don't need accounting software. You need 5 Excel tricks that turn the spreadsheet you already have into a daily decision tool. Here they are, in plain English.",
        ],
      },
      {
        heading: "1. SUMIF for daily takings by category",
        paragraphs: [
          "=SUMIF(B:B, \"Hair\", C:C) totals every \"Hair\" row in column B. Now you know which service actually pays the rent.",
        ],
      },
      {
        heading: "2. Conditional formatting for low stock",
        paragraphs: [
          "Highlight any cell below 5 units in red. One glance tells you what to reorder — no more running out of relaxer on a Saturday morning.",
        ],
      },
      {
        heading: "3. VLOOKUP for instant prices",
        paragraphs: [
          "Type a product code, get the price. =VLOOKUP(A2, PriceList!A:B, 2, FALSE). Stops mistakes when staff are on the till.",
        ],
      },
      {
        heading: "4. A simple pivot table for monthly trends",
        paragraphs: [
          "Highlight your sales sheet → Insert → PivotTable → drag Date to Rows, Amount to Values. You now have monthly totals in 5 clicks.",
        ],
      },
      {
        heading: "5. Data validation for clean data",
        paragraphs: [
          "Force a dropdown so staff can only pick from your service list. No more \"Hairr\" vs \"Hair\" totals that don't add up.",
        ],
      },
      {
        paragraphs: [
          "We can build any of these as a ready-to-use template for R350. WhatsApp us your current sheet and we'll quote.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}