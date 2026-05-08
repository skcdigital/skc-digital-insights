export type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Thandi Mokoena",
    role: "Hair Salon Owner",
    location: "Soweto, GP",
    quote:
      "Suzan built my one-page website in two days. Now customers WhatsApp me directly from the site and I stopped losing people who couldn't find my prices on the catalog.",
    initials: "TM",
  },
  {
    name: "Sipho Dlamini",
    role: "Spaza & Tuck Shop",
    location: "Mamelodi, Pretoria",
    quote:
      "The Excel stock sheet she set up saves me two hours every Monday. I know exactly what to reorder before I run out — no more guessing on a busy weekend.",
    initials: "SD",
  },
  {
    name: "Priya Naidoo",
    role: "Freelance Bookkeeper",
    location: "Centurion, GP",
    quote:
      "I needed a professional online presence fast. Got a clean site with my services, a contact form, and Google Business Profile sorted in one week. Worth every rand.",
    initials: "PN",
  },
  {
    name: "Blessing Moyo",
    role: "Cleaning Services Owner",
    location: "Tshwane, GP",
    quote:
      "Fixed my broken Google Maps listing and added 5 photos. Within a month I started getting calls from areas I never reached before. Simple change, big difference.",
    initials: "BM",
  },
];
