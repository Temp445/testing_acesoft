
import "../globals.css";
import BackToTop from "@/components/BackToTop";
import { AuthProvider } from '@/context/AuthContext';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import CallbackCard from "@/components/CallbackCard";
import GTM from '@/components/analytics/GTM';
import { GTMTracker } from '@/components/analytics/GTMTracker';
import { GTM_ID } from '@/lib/gtm';

export const metadata = {
  title: "ACE Software Solutions Pvt. Ltd",
  description: "ACE Software Solutions Pvt. Ltd",
  keywords: "ACE Software Solution,ACE,CRM, Sales CRM, CRM software, Customer relationship management, CRM for small business, CRM solution, Cloud-based CRM, ACE CRM system, Lead management software, Best CRM tool, HRMS software, Human resource management system, HR software, Employee management software, Cloud HRMS, HR solution, Workforce management software, Payroll software, Payroll management system, HR and payroll software, Online payroll software, Payroll processing tool, Salary management software, Employee payroll system, Project management software, Project planning tool, Task tracking software, Team collaboration tool, Project scheduling software, Agile project management, Cloud project management, Task management software, Task tracking tool, Team task manager, Task collaboration software, Daily task management, Employee task management, PPAP software, Production part approval process, Automotive PPAP software, Quality documentation software, PPAP submission tool, Manufacturing PPAP software, Supplier PPAP solution, Digital PPAP process, Compliance documentation tool, Supplier documentation software, PPAP tracking system, Quality control software, Electronic PPAP system, Document control software, Calibration management software, Equipment calibration tracking, Instrument calibration tool, Calibration scheduling system, Calibration report software, Lab equipment management, Maintenance tracking tool, Production management software, Manufacturing PMS, Production scheduling tool, Factory management system, Manufacturing workflow software, Shop floor tracking system, Real-time production monitoring, Manufacturing execution system, Balloon drawing software, Drawing annotation tool, Engineering ballooning tool, Balloon numbering software, Quality control drawing tool, Digital drawing annotator, PDF ballooning software, CAD ballooning software, Engineering documentation tool, Fixed asset management software, Asset tracking software, Asset depreciation tool, Financial asset tracking, Enterprise asset management, Asset lifecycle management, Asset audit software, Fixed asset reporting tool, ERP software, Business ERP system, Enterprise resource planning, All-in-one ERP software, ERP for SMEs, Cloud-based ERP, Manufacturing ERP software, Accounting and inventory ERP, End-to-end ERP system"
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Ensure Google Tag Manager ID is set
  if (!GTM_ID) {
    console.error(
      "❌ Missing Google Tag Manager ID. Please set NEXT_PUBLIC_GTM_ID in .env."
    );
  }

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/AceLogo.png" />
        <GTM />
      </head>
      <body>
        {/* Google Tag Manager Fallback Script */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        {/* Google Tag Manager Tracker */}
        <GTMTracker />

        <AuthProvider>
          <NextIntlClientProvider>
            {children}
            <CallbackCard />
            <BackToTop />
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
