"use client";
import React, { useRef, useState, useEffect } from "react";

export default function HeroSlider({
  title = "The Cyberverse Conspiracy",
  desc = "A rogue packets specialist discovers a backdoor in the decentralized consensus layer, sparking an electronic cold war. Standard protocols will be shattered. StreamVerse original series.",
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  posterUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80",
  metadata = {
    year: "2026",
    rating: "16+",
    duration: "4 Seasons",
    quality: "Ultra HD 4K",
    genres: ["Sci-Fi", "Cyberpunk", "Action Thriller"]
  },
  onPlay = null,
  onMoreInfo = null
}) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Attempt auto-play when component mounts
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay blocked or failed, fallback to poster
        console.log("Background video autoplay failed or was blocked. Playing on mute fallback.");
      });
    }
  }, [videoUrl]);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  return (
    <div className="relative w-full h-[56.25vw] sm:h-[85vh] min-h-[400px] max-h-[900px] bg-black overflow-hidden select-none font-sans text-white">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {!videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover transition-opacity duration-1000 scale-[1.03]"
          />
        ) : (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        {/* Sleek radial and linear dark gradients for cinema contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/30 to-transparent z-10" />
      </div>

      {/* Hero Metadata Panel & Action Layer */}
      <div className="absolute inset-0 z-15 flex flex-col justify-end p-6 sm:p-12 md:p-16 max-w-7xl mx-auto w-full pb-16 sm:pb-24">
        <div className="max-w-2xl">
          {/* Tagline category */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#e50914] text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md">
              S-ORIGINAL
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-gray-300">
              SERIES
            </span>
          </div>

          {/* Main Title Banner */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg text-white">
            {title}
          </h1>

          {/* Inline metadata details */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300 mb-4 sm:mb-6">
            <span className="text-[#e50914]">{metadata.year}</span>
            <span className="border border-gray-500 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">
              {metadata.rating}
            </span>
            <span>{metadata.duration}</span>
            <span className="border border-zinc-600 bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] sm:text-xs tracking-wider">
              {metadata.quality}
            </span>
          </div>

          {/* Plot description */}
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 sm:mb-8 line-clamp-3 leading-relaxed drop-shadow-md">
            {desc}
          </p>

          {/* Control Actions Row */}
          <div className="flex items-center gap-4">
            {/* Play trigger button */}
            <button
              onClick={onPlay}
              className="flex items-center justify-center gap-2 bg-white text-black hover:bg-white/80 active:scale-95 font-bold py-2.5 px-6 sm:px-8 rounded-md transition-all shadow-lg text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
              Play
            </button>

            {/* Info Trigger Button */}
            <button
              onClick={onMoreInfo}
              className="flex items-center justify-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border border-gray-600/50 backdrop-blur-md text-white font-bold py-2.5 px-6 sm:px-8 rounded-md transition-all text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.985l-.04.02v2.24l-.04.02a.75.75 0 11-1.084-.985l.04-.02v-2.24zm0-3a.75.75 0 111.5 0 .75.75 0 0 1-1.5 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Floating Sound Toggle Button right side */}
      <div className="absolute right-6 bottom-16 sm:bottom-24 z-20 flex items-center gap-4">
        {/* Dynamic Genre Tag Indicator */}
        <div className="hidden md:flex border-l-4 border-gray-400 bg-black/45 backdrop-blur-sm pl-4 pr-12 py-1.5 items-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-300">
            {metadata.genres.join("  •  ")}
          </span>
        </div>

        <button
          onClick={handleMuteToggle}
          className="bg-black/40 backdrop-blur-sm border border-gray-600 rounded-full p-2.5 hover:bg-black/60 hover:scale-105 active:scale-95 transition-all"
          title={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V3.75z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
