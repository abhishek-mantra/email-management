import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "MantraCare Notifications",
  description: "Notification dashboard prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster position="bottom-right" toastOptions={{ style: { fontSize: "0.9rem", fontWeight: 500 } }} />
      </body>
    </html>
  );
}
