"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Preset mock episodes list for demo purposes
const MOCK_EPISODES = [
  { id: "ep-1", title: "Pilot - The Beginning", duration: "45m", desc: "Introducing the futuristic grid of StreamVerse where digital fragments start to form their own consensus.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "ep-2", title: "Chapter II - The Network Protocols", duration: "42m", desc: "A deeper dive into the system structures as data packet anomalies trigger core security protocols.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "ep-3", title: "Chapter III - Decryption Key", duration: "50m", desc: "With system alerts triggering everywhere, our characters must decrypt a hidden sector code.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { id: "ep-4", title: "Chapter IV - Synchronization", duration: "48m", desc: "The final synchronization phase begins. The grid prepares for the final convergence.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" }
];

export default function VideoPlayer({
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  title = "StreamVerse Originals: The Grid",
  description = "In a fully connected white-labeled cosmos, digital segments learn to adapt, survive, and build networks beyond human expectation. Experience premium custom layouts in dark aesthetic environments.",
  onBack = null
}) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showEpisodesPanel, setShowEpisodesPanel] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState(videoUrl);
  const [activeTitle, setActiveTitle] = useState(title);

  // Auto-hide controls timer
  useEffect(() => {
    let hideTimer;
    const resetTimer = () => {
      setControlsVisible(true);
      clearTimeout(hideTimer);
      if (isPlaying) {
        hideTimer = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }
    };

    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", resetTimer);
      container.addEventListener("click", resetTimer);
    }

    resetTimer();

    return () => {
      if (container) {
        container.removeEventListener("mousemove", resetTimer);
        container.removeEventListener("click", resetTimer);
      }
      clearTimeout(hideTimer);
    };
  }, [isPlaying]);

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => console.log("Video play failed:", e));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      videoRef.current.muted = value === 0;
      setIsMuted(value === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (nextMuted) {
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume > 0 ? volume : 1;
        if (volume === 0) setVolume(1);
      }
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleFullscreenToggle = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePictureInPicture = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error("PiP error:", err);
      }
    }
  };

  const handleEpisodeSelect = (episode, index) => {
    setCurrentEpisodeIndex(index);
    setActiveVideoUrl(episode.videoUrl);
    setActiveTitle(`${title} - ${episode.title}`);
    setIsPlaying(false);
    
    // Allow React state updates before loading new media
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => console.log("Episode video play fail:", e));
      }
    }, 100);
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center font-sans group select-none text-white"
    >
      {/* HTML5 Video Source */}
      <video
        ref={videoRef}
        src={activeVideoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
      />

      {/* Screen Click Area / Big Play Pause Icon Animation */}
      <div 
        onClick={handlePlayPause}
        className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 pointer-events-auto ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button className="bg-black/60 backdrop-blur-md rounded-full p-6 text-white hover:bg-black/80 hover:scale-110 active:scale-95 transition-all">
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-12 h-12">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-12 h-12 translate-x-0.5">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* TOP HEADER CONTROLS (Back arrow, Info status) */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between transition-transform duration-300 z-20 ${
          controlsVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          onClick={() => {
            if (onBack) onBack();
            else router.back();
          }}
          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="font-semibold text-lg md:text-xl truncate max-w-md">
            {activeTitle}
          </span>
        </button>

        {/* Quick status bar */}
        <span className="hidden sm:inline-block bg-[#e50914] text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
          StreamVerse HD
        </span>
      </div>

      {/* BOTTOM CONTROL OVERLAYS */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-transform duration-300 z-20 ${
          controlsVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Timeline progress slider bar */}
        <div className="flex items-center gap-4 mb-4 group/slider">
          <span className="text-sm font-medium tabular-nums min-w-[45px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#e50914] hover:h-2 transition-all"
            style={{
              background: `linear-gradient(to right, #e50914 0%, #e50914 ${
                (currentTime / (duration || 100)) * 100
              }%, #4b5563 ${(currentTime / (duration || 100)) * 100}%, #4b5563 100%)`
            }}
          />
          <span className="text-sm font-medium tabular-nums min-w-[45px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action icons bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Play Pause button */}
            <button onClick={handlePlayPause} className="text-gray-300 hover:text-white transition-colors" title="Play/Pause">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75H16.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Skip 10s back */}
            <button onClick={() => handleSkip(-10)} className="text-gray-300 hover:text-white transition-colors" title="Rewind 10s">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Skip 10s forward */}
            <button onClick={() => handleSkip(10)} className="text-gray-300 hover:text-white transition-colors" title="Fast Forward 10s">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Volume section */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={handleMuteToggle} className="text-gray-300 hover:text-white transition-colors">
                {isMuted || volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 0 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 0 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06Z" />
                    <path d="M18.57 6.93a.75.75 0 0 1 0 1.06 5.25 5.25 0 0 1 0 7.42.75.75 0 1 1-1.06-1.06 3.75 3.75 0 0 0 0-5.3.75.75 0 0 1 1.06-1.06Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.063.922-2.063 2.063v4.875c0 1.141.922 2.062 2.063 2.062h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06Z" />
                    <path d="M18.57 6.93a.75.75 0 0 1 0 1.06 5.25 5.25 0 0 1 0 7.42.75.75 0 1 1-1.06-1.06 3.75 3.75 0 0 0 0-5.3.75.75 0 0 1 1.06-1.06Z" />
                    <path d="M21.75 3.75a.75.75 0 0 1 0 1.06 9.75 9.75 0 0 1 0 13.78.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.66.75.75 0 0 1 1.06-1.06Z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-gray-500 rounded appearance-none cursor-pointer accent-[#e50914]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Speed Controller */}
            <div className="relative group/speed">
              <button className="text-gray-300 hover:text-white text-sm font-bold border border-gray-600 px-2 py-0.5 rounded hover:border-white transition-all">
                {playbackRate}x
              </button>
              {/* Dropup rate values */}
              <div className="absolute bottom-full right-0 mb-2 bg-[#181818] border border-zinc-800 rounded shadow-xl hidden group-hover/speed:block py-1 min-w-[70px] z-30">
                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-[#e50914] hover:text-white transition-colors ${
                      playbackRate === rate ? "text-[#e50914] font-bold" : "text-gray-400"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes & Info button */}
            <button
              onClick={() => setShowEpisodesPanel(!showEpisodesPanel)}
              className={`flex items-center gap-1.5 text-sm font-semibold border px-3 py-1 rounded transition-colors ${
                showEpisodesPanel
                  ? "bg-[#e50914] border-[#e50914] text-white"
                  : "border-gray-600 text-gray-300 hover:border-white hover:text-white"
              }`}
              title="Episodes & Info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.007 5.25H3.75v.008h.007V12Zm-.007 5.25h.007v.008H3.75v-.008Z" />
              </svg>
              <span className="hidden sm:inline">Episodes</span>
            </button>

            {/* Picture in Picture */}
            <button onClick={handlePictureInPicture} className="text-gray-300 hover:text-white transition-colors" title="Picture-in-Picture">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25M19.5 3h-15A2.25 2.25 0 002.25 5.25v9.75a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.5 3z" />
              </svg>
            </button>

            {/* Fullscreen */}
            <button onClick={handleFullscreenToggle} className="text-gray-300 hover:text-white transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m6 6l6-6m0 6h4.5M15 9V4.5m0 4.5l6 6M9 15v4.5M9 15H4.5m4.5 0l-6 6m6-6l6 6m0-6h4.5m-4.5 0v4.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* "EPISODES & INFO" SLIDING OVERLAY PANEL */}
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-[450px] bg-black/90 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-40 transition-transform duration-500 ease-in-out p-6 overflow-y-auto flex flex-col ${
          showEpisodesPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <h3 className="text-xl font-bold">Episodes & Info</h3>
          <button
            onClick={() => setShowEpisodesPanel(false)}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video metadata description */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2 text-[#e50914]">{title}</h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-300">
            <span className="bg-zinc-800 px-2 py-0.5 rounded">2026</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded">U/A 16+</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded">4 Episodes</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded">Ultra HD 4K</span>
          </div>
        </div>

        {/* Episodes Row List */}
        <div className="flex-1 flex flex-col gap-4">
          <h5 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">
            Season 1
          </h5>

          {MOCK_EPISODES.map((ep, idx) => (
            <div
              key={ep.id}
              onClick={() => handleEpisodeSelect(ep, idx)}
              className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer border transition-all ${
                currentEpisodeIndex === idx
                  ? "bg-[#e50914]/10 border-[#e50914]"
                  : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-4">
                    {idx + 1}
                  </span>
                  <span className={`text-sm font-medium ${
                    currentEpisodeIndex === idx ? "text-[#e50914] font-semibold" : "text-white"
                  }`}>
                    {ep.title}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {ep.duration}
                </span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 pl-7">
                {ep.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Logo tag branding compliance */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase">
            Powered by StreamVerse Engine
          </p>
        </div>
      </div>
    </div>
  );
}
