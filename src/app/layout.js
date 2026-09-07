import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MantraCare Notifications",
  description: "Notification dashboard prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="bottom-right" toastOptions={{ style: { fontSize: "0.9rem", fontWeight: 500 } }} />
      </body>
    </html>
  );
}