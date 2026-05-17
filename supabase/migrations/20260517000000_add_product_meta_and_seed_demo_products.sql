-- Add meta JSONB column to products for gallery, includes, demo config
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}';

-- Seed 5 demo products (one per category)
INSERT INTO public.products (slug, title, description, type, price_zar, is_published, is_free, sort_order, meta)
VALUES
(
  'google-business-guide',
  'Google Business Profile: Complete Setup Guide',
  'Step-by-step PDF guide to claim, verify and optimise your Google Business Profile so customers find you on Maps and Search. Includes checklists, templates and monthly maintenance tips — written for South African small businesses.',
  'pdf_guide',
  149,
  true,
  false,
  1,
  '{"highlights":["Get found on Google Maps by local customers","Stand out with a fully optimised listing","Works for any South African business"],"includes":["32-page PDF guide","Google Maps optimisation checklist","Photo guidelines & upload templates","Review response scripts (positive & negative)","Monthly maintenance checklist","Bonus: Q&A post templates"],"gallery_urls":["https://picsum.photos/seed/gbp-cover/800/500","https://picsum.photos/seed/gbp-checklist/800/500","https://picsum.photos/seed/gbp-review/800/500"]}'
),
(
  'quote-invoice-excel-tool',
  'Quote & Invoice Excel Tool',
  'Professional Excel spreadsheet that generates branded quotes and invoices in seconds. Auto-numbers your documents, calculates VAT, tracks payment status and keeps your client records organised — all without any software subscription.',
  'software_tool',
  299,
  true,
  false,
  2,
  '{"highlights":["Works offline — no internet or subscription needed","One-click PDF export with your logo & colours","Auto-numbers every quote and invoice"],"includes":["Excel workbook (.xlsx)","Auto-numbering for quotes & invoices","VAT-inclusive & exclusive calculations","Client database sheet","Payment status tracker","1-page setup guide","Free updates for 12 months"],"gallery_urls":["https://picsum.photos/seed/excel-dash/800/500","https://picsum.photos/seed/excel-invoice/800/500","https://picsum.photos/seed/excel-client/800/500"],"demo_type":"calculator"}'
),
(
  'digital-marketing-mini-course',
  'Digital Marketing for SA Businesses — Mini Course',
  'Five practical video lessons + downloadable workbook covering Google Business Profile, WhatsApp marketing, Facebook basics, Instagram for small business, and how to track results — all without a big budget. Designed specifically for South African entrepreneurs.',
  'course',
  499,
  true,
  false,
  3,
  '{"highlights":["Designed specifically for South African businesses","No marketing experience needed","Practical, not theory — see results in 2 weeks"],"includes":["5 video lessons (total 3h 20min)","Downloadable workbook & templates","Lifetime access","Private community access","Certificate of completion","Bonus lesson: AI tools for free marketing"],"gallery_urls":["https://picsum.photos/seed/course-intro/800/500","https://picsum.photos/seed/course-module/800/500","https://picsum.photos/seed/course-workbook/800/500"]}'
),
(
  'website-starter-pack',
  'Website Starter Pack — Done For You',
  'We design and build your 3-page business website, set up your domain, connect your WhatsApp button and Google Analytics, and hand you the login. Ready to launch in 5 working days. No tech knowledge required.',
  'done_for_you',
  1999,
  true,
  false,
  4,
  '{"highlights":["Live in 5 working days","No tech knowledge needed","Fully owned by you — no lock-in"],"includes":["3-page website (Home, About, Contact)","Mobile-responsive design","WhatsApp chat button","Google Analytics setup","Contact form connected to your email","1 month free support after launch","Domain & hosting setup guide"],"gallery_urls":["https://picsum.photos/seed/web-design/800/500","https://picsum.photos/seed/web-mobile/800/500","https://picsum.photos/seed/web-analytics/800/500"]}'
),
(
  'social-media-caption-pack',
  '30-Day Social Media Caption Pack',
  'Ready-to-post captions for 30 days across Instagram, Facebook and WhatsApp Status. Includes engagement hooks, call-to-action templates and a monthly content calendar so you never stare at a blank screen again.',
  'pdf_guide',
  99,
  true,
  false,
  5,
  '{"highlights":["Saves 4+ hours of content writing per month","Designed for South African brands & audiences","Works for any industry — just fill in your business name"],"includes":["30 ready-to-use captions","Monthly content calendar template","10 call-to-action variations","Hashtag research guide","Canva template links"],"gallery_urls":["https://picsum.photos/seed/social-calendar/800/500","https://picsum.photos/seed/social-captions/800/500"]}'
)
ON CONFLICT (slug) DO NOTHING;
