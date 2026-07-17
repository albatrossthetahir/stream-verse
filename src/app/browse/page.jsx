"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import HeroSlider from "../../components/HeroSlider";
import MovieCarousel from "../../components/MovieCarousel";
import VideoPlayer from "../../components/VideoPlayer";
import ChunkedUploader from "../../components/admin/ChunkedUploader";

export default function BrowsePage() {
  const { user, activeProfile, logout, selectProfile, avatars } = useAuth();
  const router = useRouter();

  // Component UI States
  const [movies, setMovies] = useState([]);
  const [activeMovieForPlayer, setActiveMovieForPlayer] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Fetch media items from API
  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (err) {
      console.error("Failed to fetch movies catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Session checks
    const savedUser = localStorage.getItem("streamverse_user");
    const savedProfile = localStorage.getItem("streamverse_active_profile");

    if (!savedUser) {
      router.push("/login");
      return;
    }
    if (!savedProfile) {
      router.push("/profiles");
      return;
    }

    fetchMovies();

    // Scroll listener for sticky transparent header transition
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  // Retrieve active avatar class
  const getProfileAvatarClass = () => {
    if (!activeProfile || !avatars) return "bg-gray-600";
    const av = avatars.find((a) => a.id === activeProfile.avatarId);
    return av ? av.class : "bg-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-[#e50914] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter movies for specific carousel strips
  const trendingMovies = movies.filter((m) => m.isTrending);
  const topRatedMovies = movies.filter((m) => m.isTopRated || m.releaseYear >= 2026);
  const sciFiMovies = movies.filter((m) => m.genres && m.genres.some(g => g.toLowerCase().includes("sci-fi") || g.toLowerCase().includes("cyberpunk")));
  const actionMovies = movies.filter((m) => m.genres && m.genres.some(g => g.toLowerCase().includes("action") || g.toLowerCase().includes("thriller")));

  // Hero movie (defaults to the first movie in database)
  const heroMovie = movies[0] || {
    title: "The Cyberverse Conspiracy",
    description: "A rogue packets specialist discovers a backdoor in the decentralized consensus layer, sparking an electronic cold war. Standard protocols will be shattered. Luminaea original series.",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  };

  return (
    <div className="relative min-h-screen bg-[#141414] text-white font-sans overflow-x-hidden">
      {/* 1. NAVIGATION BAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-500 py-4 px-6 md:px-12 flex items-center justify-between ${
          scrolled ? "bg-[#141414] shadow-md border-b border-zinc-900" : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="flex items-center gap-8">
          {/* Logo Branding constraint check */}
          <h1
            onClick={() => router.push("/")}
            className="text-2xl md:text-3xl font-black tracking-widest text-[#e50914] uppercase cursor-pointer select-none"
          >
            Luminaea
          </h1>

          {/* Nav Categories links */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <li className="text-white font-semibold cursor-pointer hover:text-white transition-colors">Home</li>
            <li className="cursor-pointer hover:text-white transition-colors">TV Shows</li>
            <li className="cursor-pointer hover:text-white transition-colors">Movies</li>
            <li className="cursor-pointer hover:text-white transition-colors">New & Popular</li>
            <li className="cursor-pointer hover:text-white transition-colors">My List</li>
          </ul>
        </div>

        {/* Navigation actions right side */}
        <div className="flex items-center gap-6 relative">
          {/* Admin panel trigger (restricted to admin emails) */}
          {user && user.role === "ADMIN" && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/40 hover:border-red-500 font-semibold text-xs tracking-wider uppercase px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upload Console
            </button>
          )}

          {/* Profile Switcher & Menu */}
          {activeProfile && (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded ${getProfileAvatarClass()} flex items-center justify-center font-bold text-sm text-white select-none`}>
                  {activeProfile.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium hover:text-gray-300 transition-colors">
                  {activeProfile.name}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className={`w-3 h-3 text-gray-400 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Profile dropdown drawer */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-[#181818] border border-zinc-800 rounded-md shadow-2xl py-1 z-50 text-left">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="text-xs text-gray-500">Account Session</p>
                    <p className="text-xs font-semibold truncate text-gray-300">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      router.push("/profiles");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Manage Profiles
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-zinc-800 hover:text-red-400 transition-colors border-t border-zinc-800/80"
                  >
                    Sign Out of Luminaea
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* 2. HERO TRAILER SLIDER BANNER */}
      <HeroSlider
        title={heroMovie.title}
        desc={heroMovie.description}
        videoUrl={heroMovie.videoUrl}
        posterUrl={heroMovie.poster}
        onPlay={() => setActiveMovieForPlayer(heroMovie)}
        onMoreInfo={() => setActiveMovieForPlayer(heroMovie)}
      />

      {/* 3. ROW CATEGORY CAROUSELS */}
      <div className="relative pb-24 space-y-8 md:space-y-12 z-20 bg-gradient-to-b from-transparent via-[#141414] to-[#141414] mt-[-5vw] sm:mt-[-10vw]">
        {/* Row 1: Trending */}
        {trendingMovies.length > 0 && (
          <MovieCarousel
            title="Trending Now"
            movies={trendingMovies}
            onSelectMovie={(movie) => setActiveMovieForPlayer(movie)}
          />
        )}

        {/* Row 2: Sci-Fi */}
        {sciFiMovies.length > 0 && (
          <MovieCarousel
            title="Sci-Fi & Cyberpunk Originals"
            movies={sciFiMovies}
            onSelectMovie={(movie) => setActiveMovieForPlayer(movie)}
          />
        )}

        {/* Row 3: Action */}
        {actionMovies.length > 0 && (
          <MovieCarousel
            title="Action-Packed Thrillers"
            movies={actionMovies}
            onSelectMovie={(movie) => setActiveMovieForPlayer(movie)}
          />
        )}

        {/* Row 4: Top Rated */}
        {topRatedMovies.length > 0 && (
          <MovieCarousel
            title="High Rated & Blockbusters"
            movies={topRatedMovies}
            onSelectMovie={(movie) => setActiveMovieForPlayer(movie)}
          />
        )}
      </div>

      {/* 4. FULL-SCREEN VIDEO PLAYER OVERLAY */}
      {activeMovieForPlayer && (
        <div className="fixed inset-0 w-screen h-screen z-50 bg-black animate-fade-in">
          <VideoPlayer
            videoUrl={activeMovieForPlayer.videoUrl}
            title={activeMovieForPlayer.title}
            description={activeMovieForPlayer.description}
            onBack={() => {
              setActiveMovieForPlayer(null);
              // Refetch movies list to catch new additions upon returning to dashboard
              fetchMovies();
            }}
          />
        </div>
      )}

      {/* 5. ADMINISTRATIVE CONTENT UPLOAD CONSOLE MODAL */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            {/* Close floating button */}
            <button
              onClick={() => {
                setShowAdminPanel(false);
                fetchMovies(); // Reload catalog to display newly uploaded files
              }}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black text-gray-400 hover:text-white rounded-full p-2.5 transition-colors border border-zinc-800"
              title="Close Panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ChunkedUploader />
          </div>
        </div>
      )}
    </div>
  );
}
