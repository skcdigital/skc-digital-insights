-- =========================================
-- DIGITAL PRODUCTS
-- =========================================

CREATE TYPE public.product_type AS ENUM (
  'pdf_guide',
  'course',
  'software_tool',
  'done_for_you',
  'newsletter',
  'other'
);

CREATE TABLE public.products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  type        public.product_type NOT NULL,
  price_zar   NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency    TEXT        NOT NULL DEFAULT 'ZAR',
  stripe_price_id TEXT,
  cover_url   TEXT,
  preview_url TEXT,
  is_published BOOLEAN   NOT NULL DEFAULT false,
  is_free     BOOLEAN    NOT NULL DEFAULT false,
  sort_order  INT        NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products visible when published"
  ON public.products FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Product files (downloadable assets linked to a product)
CREATE TABLE public.product_files (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID  NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label       TEXT  NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order  INT   NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage product files"
  ON public.product_files FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- MEMBERSHIP PLANS
-- =========================================

CREATE TYPE public.billing_interval AS ENUM ('monthly', 'annual', 'once');

CREATE TABLE public.membership_plans (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT    NOT NULL UNIQUE,
  name             TEXT    NOT NULL,
  tagline          TEXT,
  price_monthly    NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_annual     NUMERIC(10,2),
  currency         TEXT    NOT NULL DEFAULT 'ZAR',
  stripe_price_monthly TEXT,
  stripe_price_annual  TEXT,
  features         JSONB   NOT NULL DEFAULT '[]',
  is_popular       BOOLEAN NOT NULL DEFAULT false,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  sort_order       INT     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans always visible"
  ON public.membership_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins manage plans"
  ON public.membership_plans FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_plans_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 3 tiers to match the existing pricing page
INSERT INTO public.membership_plans (slug, name, tagline, price_monthly, price_annual, features, is_popular, sort_order)
VALUES
  (
    'starter',
    'Starter',
    'For small businesses just getting online',
    499,
    4490,
    '["Professional website (up to 5 pages)", "Basic SEO setup", "Contact form & WhatsApp integration", "1 month free support", "SSL & hosting included"]',
    false,
    1
  ),
  (
    'growth',
    'Growth',
    'For businesses ready to scale their digital presence',
    999,
    8990,
    '["Everything in Starter", "Up to 10 pages", "Google Ads setup & management", "Social media integration", "Monthly performance report", "Priority support"]',
    true,
    2
  ),
  (
    'scale',
    'Scale',
    'Full-service digital partner for ambitious brands',
    1999,
    17990,
    '["Everything in Growth", "Custom design & branding", "E-commerce or booking integration", "Advanced SEO & content strategy", "Dedicated account manager", "Quarterly strategy session"]',
    false,
    3
  );

-- =========================================
-- USER MEMBERSHIPS (subscriptions)
-- =========================================

CREATE TYPE public.membership_status AS ENUM (
  'active', 'past_due', 'cancelled', 'trialing', 'paused'
);

CREATE TABLE public.user_memberships (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id           UUID    NOT NULL REFERENCES public.membership_plans(id),
  status            public.membership_status NOT NULL DEFAULT 'active',
  billing_interval  public.billing_interval  NOT NULL DEFAULT 'monthly',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own memberships"
  ON public.user_memberships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage all memberships"
  ON public.user_memberships FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_user_memberships_updated_at
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- PURCHASES (one-time product orders)
-- =========================================

CREATE TYPE public.purchase_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

CREATE TABLE public.purchases (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id          UUID    NOT NULL REFERENCES public.products(id),
  email               TEXT    NOT NULL,
  amount_zar          NUMERIC(10,2) NOT NULL,
  status              public.purchase_status NOT NULL DEFAULT 'pending',
  stripe_session_id   TEXT    UNIQUE,
  stripe_payment_intent TEXT,
  download_token      TEXT    UNIQUE DEFAULT gen_random_uuid()::text,
  download_expires_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own purchases"
  ON public.purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage purchases"
  ON public.purchases FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- NEWSLETTER SUBSCRIBERS
-- =========================================

CREATE TABLE public.newsletter_subscribers (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT  NOT NULL UNIQUE,
  name        TEXT,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subscribers"
  ON public.newsletter_subscribers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
