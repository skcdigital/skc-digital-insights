export type Service = {
  id: string;
  num: string;
  icon: string;
  title: string;
  desc: string;
  price: string;
  details?: string[];
};

export const SERVICES: Service[] = [
  {
    id: "excel",
    num: "01",
    icon: "📊",
    title: "Excel & Data Automation",
    desc: "Custom spreadsheets, automated reports, cash flow trackers, inventory systems and invoice templates. Turn hours of manual work into seconds.",
    price: "From R300",
    details: [
      "Cash flow & expense trackers",
      "Inventory and stock management",
      "Invoice & quote templates",
      "Auto-calculating dashboards",
      "Macros & VBA where needed",
    ],
  },
  {
    id: "web",
    num: "02",
    icon: "🌐",
    title: "Web Development",
    desc: "Professional websites for your business — clean, fast, mobile-friendly and built to convert visitors into clients. No templates, custom built.",
    price: "From R800",
    details: [
      "Custom landing pages",
      "Multi-page business sites",
      "Mobile-first responsive design",
      "Basic SEO setup",
      "WhatsApp & contact integration",
    ],
  },
  {
    id: "books",
    num: "03",
    icon: "🗂️",
    title: "Bookkeeping & Records",
    desc: "Monthly financial cleanup, income and expense tracking and organised records sent back via WhatsApp or email. No accounting software needed.",
    price: "From R400/month",
    details: [
      "Monthly income & expense capture",
      "Receipt and invoice organisation",
      "Simple monthly summary reports",
      "Submission via WhatsApp or email",
    ],
  },
  {
    id: "automation",
    num: "04",
    icon: "⚙️",
    title: "Business Process Automation",
    desc: "Automate repetitive tasks — invoice generation, stock alerts, report scheduling and email workflows. Save time and reduce human error.",
    price: "From R600",
    details: [
      "Auto invoice generation",
      "Stock-level alerts",
      "Scheduled reports",
      "Email & WhatsApp workflows",
      "Data sync between tools",
    ],
  },
  {
    id: "consult",
    num: "05",
    icon: "📱",
    title: "Digital Setup & Consulting",
    desc: "Help setting up your business online — Google Business profile, WhatsApp Business, email, cloud storage and general digital strategy.",
    price: "From R250",
    details: [
      "Google Business profile setup",
      "WhatsApp Business configuration",
      "Branded email setup",
      "Cloud storage & file structure",
      "Digital strategy session",
    ],
  },
];