export const SITE = {
  name: "SKC Digital",
  shortName: "SKC.Digital",
  domain: "skcdigital.co.za",
  url: "https://skcdigital.co.za",
  email: "info@skcdigital.co.za",
  phone: "+27 67 379 3503",
  phoneRaw: "27673793503",
  location: "Pretoria, South Africa",
  tagline: "IT solutions built to scale your business",
} as const;

export const waLink = (text: string) =>
  `https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(text)}`;

export const NAV: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/", label: "Home", exact: true },
  { to: "/products", label: "Shop" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];