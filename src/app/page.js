"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("streamverse_user");
    const activeProfile = localStorage.getItem("streamverse_active_profile");

    if (!user) {
      router.push("/login");
    } else if (!activeProfile) {
      router.push("/profiles");
    } else {
      router.push("/browse");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-t-[#e50914] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          Loading StreamVerse...
        </p>
      </div>
    </div>
  );
}
