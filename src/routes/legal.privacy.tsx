import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, L, LI, Callout } from "@/components/legal-layout";
import { SITE } from "@/lib/site";

const TITLE = "Privacy Policy | SKC Digital";
const DESC =
  "How SKC Digital collects, uses and protects your personal information — POPIA-aligned, no third-party data sales, full client rights.";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE.url}/legal/privacy` },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={
        <p>
          We do not sell, rent, or trade your personal information to any third
          party. Ever. Below is exactly what we collect and why.
        </p>
      }
      sections={[
        {
          id: "who",
          title: "Who We Are",
          body: (
            <>
              <p>SKC Digital is a South African digital services business based in Pretoria, Gauteng. We provide IT solutions, Excel automation, website development, and bookkeeping services to small and medium businesses.</p>
              <p>We are committed to protecting your personal information in line with the Protection of Personal Information Act (POPIA) of South Africa.</p>
            </>
          ),
        },
        {
          id: "collect",
          title: "Information We Collect",
          body: (
            <>
              <p>We only collect information that is necessary to provide our services. This may include:</p>
              <h3 className="font-semibold text-foreground">Information you give us directly</h3>
              <L>
                <LI>Your name and business name</LI>
                <LI>WhatsApp number and email address</LI>
                <LI>Business financial data you share for bookkeeping services</LI>
                <LI>Content you provide for website or template projects (logos, text, images)</LI>
                <LI>Payment-related information (for EFT confirmation)</LI>
              </L>
              <h3 className="font-semibold text-foreground">Information collected automatically</h3>
              <L>
                <LI>Basic website analytics (page visits, general location) via Vercel</LI>
                <LI>No personal identifiers are collected without your knowledge</LI>
              </L>
              <p>We do not collect sensitive personal information such as ID numbers, medical data, or biometric data.</p>
            </>
          ),
        },
        {
          id: "use",
          title: "How We Use Your Information",
          body: (
            <>
              <p>Your information is used solely for the following purposes:</p>
              <L>
                <LI>To deliver the service you have requested</LI>
                <LI>To communicate with you about your project via WhatsApp or email</LI>
                <LI>To send invoices and payment confirmations</LI>
                <LI>To provide after-delivery support</LI>
                <LI>To improve our services based on general feedback</LI>
              </L>
              <p>We will never use your information for unsolicited marketing without your consent.</p>
            </>
          ),
        },
        {
          id: "store",
          title: "How We Store Your Information",
          body: (
            <>
              <L>
                <LI>Project files and communications are stored on secure personal devices and Google Drive with two-factor authentication enabled</LI>
                <LI>WhatsApp conversations are stored within the WhatsApp platform, subject to WhatsApp&apos;s own privacy policy</LI>
                <LI>Email communications are stored in a secured email account</LI>
              </L>
              <p>We retain your information for as long as necessary to complete your project and for a reasonable period thereafter for record-keeping purposes (typically 1 year). You may request deletion at any time.</p>
              <Callout tone="warn">While we take reasonable precautions, no method of digital storage is 100% secure. We cannot guarantee absolute security of information transmitted to us online.</Callout>
            </>
          ),
        },
        {
          id: "share",
          title: "Sharing Your Information",
          body: (
            <>
              <p>We do not share your personal information with third parties except in the following limited circumstances:</p>
              <L>
                <LI><strong>Service delivery:</strong> If a project requires use of a third-party platform (e.g. Vercel for hosting), only the minimum necessary information is used</LI>
                <LI><strong>Legal requirement:</strong> If we are legally required to disclose information by a South African court or authority</LI>
                <LI><strong>Your consent:</strong> If you explicitly give us permission to share specific information</LI>
              </L>
              <p>We never sell your data to advertisers, data brokers, or marketing companies.</p>
            </>
          ),
        },
        {
          id: "rights",
          title: "Your Rights (POPIA)",
          body: (
            <>
              <p>Under the Protection of Personal Information Act (POPIA), you have the right to:</p>
              <L>
                <LI>Know what personal information we hold about you</LI>
                <LI>Request access to your personal information</LI>
                <LI>Request correction of inaccurate information</LI>
                <LI>Request deletion of your information</LI>
                <LI>Object to the processing of your information</LI>
                <LI>Lodge a complaint with the Information Regulator of South Africa</LI>
              </L>
              <p>To exercise any of these rights, contact us at info@skcdigital.co.za. We will respond within 10 business days.</p>
              <Callout>Information Regulator (South Africa): inforeg.org.za · complaints.IR@justice.gov.za</Callout>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <>
              <p>Our website (skcdigital.co.za) is a static site hosted on Vercel. We do not use tracking cookies or advertising cookies. Vercel may collect basic anonymous analytics data such as page views and general geographic region.</p>
              <p>No cookies are used to identify you personally or track your behaviour across other websites.</p>
            </>
          ),
        },
        {
          id: "third-party",
          title: "Third-Party Links",
          body: (
            <p>Our website may contain links to third-party websites (e.g. WhatsApp, Google). We are not responsible for the privacy practices of those websites. We encourage you to read their privacy policies before providing any personal information.</p>
          ),
        },
        {
          id: "changes",
          title: "Changes to This Policy",
          body: (
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <>
              <p>For privacy-related queries or to exercise your POPIA rights:</p>
              <L>
                <LI>Email: info@skcdigital.co.za</LI>
                <LI>WhatsApp: +27 67 379 3503</LI>
                <LI>Location: Pretoria, Gauteng, South Africa</LI>
              </L>
            </>
          ),
        },
      ]}
    />
  );
}