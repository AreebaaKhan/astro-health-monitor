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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
