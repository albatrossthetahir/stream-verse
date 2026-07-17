"use client";
import React, { useRef, useState } from "react";

export default function MovieCarousel({
  title = "Trending Now",
  movies = [
    { id: "m-1", title: "The Cyberverse Conspiracy", poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", duration: "1h 45m", rating: "16+", match: "98% Match", genres: ["Sci-Fi", "Action"] },
    { id: "m-2", title: "Synthesized Mind", poster: "https://images.unsplash.com/photo-1539683255143-73a6b838b106?w=600&auto=format&fit=crop&q=80", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", duration: "2h 10m", rating: "18+", match: "95% Match", genres: ["Thriller", "Mystery"] },
    { id: "m-3", title: "Digital Eclipse", poster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", duration: "1h 32m", rating: "PG-13", match: "92% Match", genres: ["Adventure", "Fantasy"] },
    { id: "m-4", title: "The Network Protocols", poster: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", duration: "48m", rating: "16+", match: "89% Match", genres: ["Sci-Fi", "Drama"] },
    { id: "m-5", title: "Quantum Paradox", poster: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", duration: "1h 58m", rating: "16+", match: "96% Match", genres: ["Action", "Suspense"] },
    { id: "m-6", title: "Data Stream", poster: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", duration: "2h 02m", rating: "PG", match: "90% Match", genres: ["Drama", "Indie"] }
  ],
  onSelectMovie = null
}) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollOffset = direction === "left" 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      rowRef.current.scrollTo({
        left: scrollOffset,
        behavior: "smooth"
      });

      // Show/hide left arrow based on scroll coordinate
      setShowLeftArrow(scrollOffset > 10);
    }
  };

  const handleScrollDetect = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 10);
    }
  };

  return (
    <div className="relative flex flex-col space-y-2 px-4 md:px-12 select-none font-sans text-white group/carousel">
      {/* Category Title Header */}
      <h2 className="text-sm md:text-xl font-bold tracking-wide text-gray-200 hover:text-white transition-colors duration-200 cursor-pointer">
        {title}
      </h2>

      {/* Row Wrapper */}
      <div className="relative group">
        {/* Navigation Left Arrow Trigger */}
        <button
          onClick={() => handleScroll("left")}
          className={`absolute top-0 bottom-0 left-0 z-30 flex items-center justify-center bg-black/50 hover:bg-black/70 w-10 md:w-12 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            showLeftArrow ? "pointer-events-auto" : "pointer-events-none opacity-0"
          }`}
          title="Scroll Left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Horizontal Card Container Slider Track */}
        <div
          ref={rowRef}
          onScroll={handleScrollDetect}
          className="flex items-center space-x-2.5 overflow-x-scroll scrollbar-hide py-4 px-1"
          style={{ scrollbarWidth: "none" }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie && onSelectMovie(movie)}
              className="relative flex-none w-[160px] sm:w-[220px] md:w-[280px] aspect-video bg-black rounded-md overflow-hidden cursor-pointer shadow-lg transform transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl border border-zinc-900 hover:border-[#e50914] group/card"
            >
              {/* Cover Poster Image */}
              <img
                src={movie.poster}
                alt={movie.title}
                loading="lazy"
                className="w-full h-full object-cover rounded-md group-hover/card:rounded-t-md group-hover/card:rounded-b-none transition-all duration-300"
              />

              {/* Hover Metadata Information Popover Panel (Scales In) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                {/* Micro Action Buttons */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Play Circular Indicator */}
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-black shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="w-8 h-8 rounded-full bg-black border border-zinc-800 flex items-center justify-center hover:border-[#e50914] transition-colors text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </div>
                  
                  {/* Match percentage */}
                  <span className="text-xs font-bold text-[#e50914]">
                    {movie.match}
                  </span>
                </div>

                {/* Movie Title */}
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1 truncate">
                  {movie.title}
                </h3>

                {/* Mini details tags */}
                <div className="flex items-center gap-1.5 text-[9px] sm:text-xs text-gray-300 font-medium mb-1">
                  <span className="border border-zinc-800 px-1 rounded-sm text-[8px] sm:text-[10px]">
                    {movie.rating}
                  </span>
                  <span>{movie.duration}</span>
                  <span className="bg-black border border-zinc-800 px-1.5 py-0.2 rounded text-[8px]">HD</span>
                </div>

                {/* Genre chips */}
                <div className="flex flex-wrap gap-1">
                  {movie.genres.map((g, idx) => (
                    <span key={idx} className="text-[8px] sm:text-[9px] font-semibold text-gray-400">
                      {g}{idx < movie.genres.length - 1 ? "  •" : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Right Arrow Trigger */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute top-0 bottom-0 right-0 z-30 flex items-center justify-center bg-black/50 hover:bg-black/70 w-10 md:w-12 text-white border-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          title="Scroll Right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
