import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Luminaea - Premium Video Streaming",
  description: "A high-fidelity white-labeled video streaming experience platform clone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#141414] text-white min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
