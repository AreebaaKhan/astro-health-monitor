import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astronaut Health Monitor | NASA Space Apps 2026",
  description:
    "Autonomous biometric telemetry and baseline anomaly detection for long-duration spaceflight.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F6F8FB] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
