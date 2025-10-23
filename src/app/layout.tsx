import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientBody from "./ClientBody";

export const metadata: Metadata = {
  title: "Montfort - Global Commodity Trading and Asset Investment",
  description: "We are a global commodity trading company and asset investment company that trade in physical commodity, small commodity, downstream oil in UAE, Singapore, Switzerland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientBody>
        <Header />
        <main>{children}</main>
        <Footer />
      </ClientBody>
    </html>
  );
}
