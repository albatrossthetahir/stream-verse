import { Inter, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk" 
});

export const metadata = {
  title: "Luminaea - Premium Video Streaming",
  description: "A high-fidelity white-labeled video streaming experience platform clone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={`${inter.className} bg-[#000000] text-white min-h-screen overflow-x-hidden`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
