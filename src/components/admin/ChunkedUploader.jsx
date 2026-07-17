"use client";
import React, { useState, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB standard multipart chunk size

export default function OwnerDashboard() {
  const { logout } = useAuth();
  // Navigation State
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "upload"

  // Analytics Dynamic Fluctuating States
  const [liveUsers, setLiveUsers] = useState(247);
  const [activeStreams, setActiveStreams] = useState(89);
  const [bandwidthGbps, setBandwidthGbps] = useState(4.2);
  const [cpuLoad, setCpuLoad] = useState(14);
  const [eventLogs, setEventLogs] = useState([
    { id: 1, time: "22:05:14", type: "system", msg: "Platform initialization successful. All nodes green." },
    { id: 2, time: "22:06:21", type: "auth", msg: "Owner account kalaiwalatahir@gmail.com connected." },
    { id: 3, time: "22:08:45", type: "stream", msg: "User in Berlin initiated stream: Sintel (1080p)." },
    { id: 4, time: "22:09:12", type: "upload", msg: "Cleaned up temporary buffer chunks for session up-9482." },
    { id: 5, time: "22:10:02", type: "system", msg: "Uptime verified at 99.98% - Ping latency 12ms." }
  ]);

  // Media Metadata form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // Upload progress tracking states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); // "initing", "uploading", "completing", "success", "error"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [speedMB, setSpeedMB] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Ticking effect to simulate real-time metrics fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate live users between 235 and 265
      setLiveUsers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        return Math.max(235, Math.min(265, prev + delta));
      });
      // Fluctuate active streams
      setActiveStreams(prev => {
        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        return Math.max(75, Math.min(105, prev + delta));
      });
      // Fluctuate bandwidth
      setBandwidthGbps(prev => {
        const delta = (Math.random() * 0.4) - 0.2;
        return parseFloat(Math.max(3.5, Math.min(5.5, prev + delta)).toFixed(2));
      });
      // Fluctuate CPU load
      setCpuLoad(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(8, Math.min(22, prev + delta));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Ticking effect to feed live activity logs
  useEffect(() => {
    const logPool = [
      { type: "stream", msg: "User in London loaded media: Sintel (4K HDR)." },
      { type: "auth", msg: "Anonymous session started via Singapore node." },
      { type: "system", msg: "Cloud edge sync completed across 14 regions." },
      { type: "stream", msg: "User in Tokyo buffer hit: Cyberverse Conspiracy (720p)." },
      { type: "auth", msg: "Guest token refreshed successfully." },
      { type: "system", msg: "Garbage collector released 412 MB of chunk buffers." },
      { type: "stream", msg: "User in Paris ended stream session." }
    ];

    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setEventLogs(prev => {
        const newLog = {
          id: Date.now(),
          time: timeStr,
          type: randomLog.type,
          msg: randomLog.msg
        };
        // Keep only last 8 logs
        return [newLog, ...prev.slice(0, 7)];
      });
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "poster") {
      setPosterFile(file);
    } else if (type === "video") {
      setVideoFile(file);
    }
  };

  const startUpload = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Please select a video file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("initing");
    setUploadProgress(0);
    setErrorMessage("");

    try {
      // 1. Initialize Multipart Upload Session
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: videoFile.name,
          contentType: videoFile.type,
          title
        })
      });

      if (!initRes.ok) throw new Error("Failed to initialize upload session.");
      const { uploadId, fileKey } = await initRes.json();

      // 2. Slice file and upload parts sequentially
      const totalSize = videoFile.size;
      const totalPartsCount = Math.ceil(totalSize / CHUNK_SIZE);
      const uploadedParts = [];

      setUploadStatus("uploading");

      for (let partNumber = 1; partNumber <= totalPartsCount; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalSize);
        const chunkBlob = videoFile.slice(start, end);

        const partStart = Date.now();

        const formData = new FormData();
        formData.append("chunk", chunkBlob);
        formData.append("uploadId", uploadId);
        formData.append("partNumber", partNumber.toString());
        formData.append("fileKey", fileKey);

        const partRes = await fetch("/api/upload/part", {
          method: "POST",
          body: formData
        });

        if (!partRes.ok) {
          throw new Error(`Failed uploading chunk #${partNumber}`);
        }

        const { ETag } = await partRes.json();
        uploadedParts.push({ partNumber, ETag });

        const partEnd = Date.now();
        const durationSec = (partEnd - partStart) / 1000;
        const sizeMB = chunkBlob.size / (1024 * 1024);
        if (durationSec > 0) {
          setSpeedMB(parseFloat((sizeMB / durationSec).toFixed(2)));
        }

        const percent = Math.round((partNumber / totalPartsCount) * 100);
        setUploadProgress(percent);
      }

      // 3. Finalize upload session
      setUploadStatus("completing");
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          fileKey,
          parts: uploadedParts,
          metadata: {
            title,
            description,
            releaseYear,
            genre,
            duration
          }
        })
      });

      if (!completeRes.ok) throw new Error("Failed to finalize upload parts merger.");
      const finalData = await completeRes.json();

      setUploadStatus("success");
      setUploadProgress(100);
      
      // Clear inputs
      setTitle("");
      setDescription("");
      setGenre("");
      setDuration("");
      setVideoFile(null);
      setPosterFile(null);

    } catch (err) {
      console.error("Chunked upload failed:", err);
      setUploadStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during chunk transfer.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-black text-white font-sans relative flex flex-col min-h-screen w-full select-none">
      {/* Dashboard Top Header */}
      <div className="bg-black border-b border-zinc-900 px-6 md:px-12 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[#e50914] font-black text-2xl md:text-3xl tracking-widest uppercase select-none font-sans">
            Luminaea
          </span>
          <span className="bg-red-950/40 text-[#e50914] border border-red-900/30 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded">
            Control Room
          </span>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-all duration-200 ${
                activeTab === "analytics"
                  ? "bg-[#e50914] text-white shadow-lg shadow-red-900/10"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm3-4H6v-2h9v2zm3-4H6V7h12v2z"/>
              </svg>
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded transition-all duration-200 ${
                activeTab === "upload"
                  ? "bg-[#e50914] text-white shadow-lg shadow-red-900/10"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add New Media
            </button>
          </div>

          <button
            onClick={logout}
            className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-950/20 px-3.5 py-2.5 rounded-lg border border-red-900/30 hover:bg-red-950/40 transition-colors uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Body Content based on active tab */}
      <div className="p-6 flex-grow overflow-y-auto">
        {activeTab === "analytics" ? (
          <div className="space-y-6">
            {/* Grid of 6 glowing KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Card 1: Live Users */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Live Connections</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">{liveUsers}</span>
                <div className="absolute top-4 right-4 bg-red-950/40 text-red-500 rounded px-1.5 py-0.5 text-[8px] uppercase font-black tracking-widest flex items-center gap-1 border border-red-900/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Live
                </div>
              </div>

              {/* Card 2: Active Streams */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Active Streams</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">{activeStreams}</span>
                <span className="text-[9px] text-red-500 mt-1 font-semibold flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>
                  +4.2% streams
                </span>
              </div>

              {/* Card 3: Monthly Recurring Revenue */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">MRR (Revenue)</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">$12,840</span>
                <span className="text-[9px] text-[#e50914] mt-1 font-semibold flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>
                  +8.2% MoM
                </span>
              </div>

              {/* Card 4: Paid Subscribers */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Subscribers</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">1,284</span>
                <span className="text-[9px] text-[#e50914] mt-1 font-semibold flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>
                  +5.1% growth
                </span>
              </div>

              {/* Card 5: Network Throughput */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Uplink Speed</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">{bandwidthGbps} <span className="text-xs font-semibold text-zinc-500">Gb/s</span></span>
                <span className="text-[9px] text-zinc-500 mt-1 font-medium font-mono">Peak Capacity: 10 Gbps</span>
              </div>

              {/* Card 6: Platform Health */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-zinc-800 transition-colors duration-200">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Nodes CPU</span>
                <span className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">{cpuLoad}%</span>
                <div className="w-full bg-zinc-900 rounded-full h-1 mt-2.5 overflow-hidden">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      cpuLoad > 18 ? 'bg-[#e50914]' : 'bg-white'
                    }`} 
                    style={{ width: `${cpuLoad * 4}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Graphs Grid: SVG charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line graph card */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 lg:col-span-2 flex flex-col text-left">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-300">Daily Viewers Metrics</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Consolidated traffic trend in streaming minutes.</p>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 bg-black border border-zinc-900 px-2 py-1 rounded">7D History</span>
                </div>
                {/* SVG Line Graph */}
                <div className="w-full h-[180px] relative">
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e50914" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#e50914" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="3,3" />
                    {/* Area under the line */}
                    <path
                      d="M 0 140 Q 80 110 160 120 T 320 60 T 420 50 L 500 20 L 500 150 L 0 150 Z"
                      fill="url(#lineGrad)"
                    />
                    {/* Line path */}
                    <path
                      d="M 0 140 Q 80 110 160 120 T 320 60 T 420 50 L 500 20"
                      fill="none"
                      stroke="#e50914"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Dots at key points */}
                    <circle cx="160" cy="120" r="4" fill="#e50914" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="320" cy="60" r="4" fill="#e50914" stroke="#000000" strokeWidth="1.5" />
                    <circle cx="500" cy="20" r="4" fill="#e50914" stroke="#000000" strokeWidth="1.5" />
                  </svg>
                  {/* Axis labels */}
                  <div className="flex justify-between items-center text-[9px] font-semibold text-zinc-500 mt-2 font-mono px-1">
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue growth bar chart */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 flex flex-col text-left justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-300">Revenue Growth Trend</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Monthly Recurring Revenue progression (USD).</p>
                </div>
                
                <div className="w-full h-[150px] relative mt-4">
                  <svg className="w-full h-full" viewBox="0 0 240 120" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="240" y2="30" stroke="#1f1f1f" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="0" y1="60" x2="240" y2="60" stroke="#1f1f1f" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="0" y1="90" x2="240" y2="90" stroke="#1f1f1f" strokeWidth="1" strokeDasharray="2,2" />
                    
                    <rect x="15" y="72" width="16" height="48" fill="#3f3f46" rx="2" />
                    <rect x="47" y="58" width="16" height="62" fill="#52525b" rx="2" />
                    <rect x="79" y="42" width="16" height="78" fill="#a1a1aa" rx="2" />
                    <rect x="111" y="30" width="16" height="90" fill="#d4d4d8" rx="2" />
                    <rect x="143" y="22" width="16" height="98" fill="#e50914" rx="2" opacity="0.6" />
                    <rect x="175" y="14" width="16" height="106" fill="#e50914" rx="2" opacity="0.8" />
                    <rect x="207" y="5" width="16" height="115" fill="#e50914" rx="2" />
                  </svg>
                  
                  {/* Axis labels */}
                  <div className="flex justify-between items-center text-[9px] font-semibold text-zinc-500 mt-2 font-mono px-1">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Hourly traffic bars + Live Log + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Device distribution & Platform details */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 flex flex-col text-left justify-between gap-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-300 mb-4">Device Distribution</h3>
                  <div className="space-y-3.5">
                    {/* Chrome/Web */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                        <span>Desktop / Web</span>
                        <span className="text-zinc-200">54%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#e50914] h-1.5 rounded-full" style={{ width: "54%" }}></div>
                      </div>
                    </div>
                    {/* Mobile App */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                        <span>Smart TV / Cast</span>
                        <span className="text-zinc-200">31%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-white h-1.5 rounded-full" style={{ width: "31%" }}></div>
                      </div>
                    </div>
                    {/* Mobile */}
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                        <span>Mobile / Tablet</span>
                        <span className="text-zinc-200">15%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-700 h-1.5 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Uptime SLA</span>
                    <span className="text-base font-extrabold text-[#e50914] font-mono mt-0.5 block">99.98%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Platform Health</span>
                    <span className="text-xs font-bold text-zinc-200 bg-black border border-zinc-900 py-0.5 px-2 rounded mt-0.5 block">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Event Logging System */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 flex flex-col text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-300">Live Gateway activity logs</h3>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e50914] animate-pulse"></span>
                </div>

                {/* Log display */}
                <div className="flex-grow bg-black border border-zinc-900 rounded p-3 font-mono text-[10px] leading-relaxed text-zinc-400 overflow-y-auto space-y-2 max-h-[140px] scrollbar-hide">
                  {eventLogs.map((log) => {
                    const tagColor = {
                      system: "text-white bg-black border-zinc-800",
                      auth: "text-red-500 bg-red-950/20 border-red-900/30",
                      stream: "text-[#e50914] bg-black border-red-950",
                      upload: "text-white bg-red-950/40 border-red-900/40"
                    }[log.type] || "text-white bg-black border-zinc-900";

                    return (
                      <div key={log.id} className="flex items-start gap-2 border-b border-zinc-900 pb-1.5 last:border-b-0 last:pb-0">
                        <span className="text-zinc-650 shrink-0">{log.time}</span>
                        <span className={`px-1 rounded border text-[8px] uppercase font-bold tracking-wider shrink-0 ${tagColor}`}>
                          {log.type}
                        </span>
                        <span className="text-zinc-350 font-medium break-all">{log.msg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Business Insights Card */}
              <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 flex flex-col text-left justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-300 mb-4">Business Insights</h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 bg-[#e50914] rounded-full mt-1.5 shrink-0" />
                      <div>
                        <strong className="text-white block font-medium">Conversion Performance</strong>
                        <span className="text-zinc-400 text-[11px] leading-relaxed">Free trial codes converting to active paid plans at 78.4%. Premium yearly subscriptions are the highest growth category.</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 shrink-0" />
                      <div>
                        <strong className="text-white block font-medium">Bandwidth Capacity Spikes</strong>
                        <span className="text-zinc-400 text-[11px] leading-relaxed">Traffic spikes peak between 20:00 - 22:00. CDN cache hit ratio remains stable at 98.4% without node latency.</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <strong className="text-white block font-medium">Mobile Expansion</strong>
                        <span className="text-zinc-400 text-[11px] leading-relaxed">Smart TV apps and Mobile viewers account for 46% of total streams. Promotional marketing targeted for iOS/Android apps is recommended.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Uploading screen */
          <div className="max-w-2xl w-full mx-auto bg-black border border-zinc-900 rounded-xl p-6 sm:p-8 shadow-xl text-left">
            <h3 className="text-xl font-bold mb-2 tracking-wide text-white">
              Media Catalog Deploy Tool
            </h3>
            <p className="text-xs text-zinc-400 mb-6 border-b border-zinc-900 pb-4">
              Add new titles to Luminaea. Support high-speed chunked uploads for large video assets.
            </p>

            <form onSubmit={startUpload} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Media Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberverse Conspiracy"
                  className="w-full bg-black border border-zinc-900 rounded py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
                  required
                  disabled={isUploading}
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Description / Synopsis
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a brief overview of the plot, characters, and settings."
                  rows={3}
                  className="w-full bg-black border border-zinc-900 rounded py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors resize-none"
                  required
                  disabled={isUploading}
                />
              </div>

              {/* Year, Genre, Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Release Year
                  </label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(parseInt(e.target.value))}
                    min={1900}
                    max={2099}
                    className="w-full bg-black border border-zinc-900 rounded py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Genre Tag
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. Sci-Fi, Drama"
                    className="w-full bg-black border border-zinc-900 rounded py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 105"
                    className="w-full bg-black border border-zinc-900 rounded py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
                    required
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Thumbnail & Video File Upload Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Thumbnail Image Picker */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Thumbnail / Poster (JPG/PNG)
                  </label>
                  <div className="relative border border-dashed border-zinc-900 rounded bg-black py-6 px-4 text-center cursor-pointer hover:border-zinc-800 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "poster")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mx-auto text-zinc-600 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                    </svg>
                    <span className="text-xs text-zinc-500 block truncate">
                      {posterFile ? posterFile.name : "Choose thumbnail file"}
                    </span>
                  </div>
                </div>

                {/* Large Video File Picker */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Video File (MP4/MKV)
                  </label>
                  <div className="relative border border-dashed border-[#e50914]/30 rounded bg-black py-6 px-4 text-center cursor-pointer hover:border-[#e50914] transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, "video")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                      disabled={isUploading}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 mx-auto text-[#e50914]/50 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <span className="text-xs text-[#e50914]/70 block truncate">
                      {videoFile ? `${videoFile.name} (${(videoFile.size / (1024*1024)).toFixed(1)} MB)` : "Choose video file"}
                    </span>
                  </div>
                </div>
              </div>

              {/* PROGRESS METRICS BOX (Rendered during active uploads) */}
              {(isUploading || uploadStatus) && uploadStatus !== "" && (
                <div className="bg-black border border-zinc-900 rounded p-4 space-y-3 font-sans">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-400 capitalize">
                      Status: <strong className="text-white">{uploadStatus}</strong>
                    </span>
                    {uploadStatus === "uploading" && (
                      <span className="text-white font-mono">{speedMB} MB/s</span>
                    )}
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-1.5">
                    <div
                      className="bg-[#e50914] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span>{uploadProgress}% completed</span>
                    {uploadStatus === "initing" && <span>Initiating secure session...</span>}
                    {uploadStatus === "completing" && <span>Merging binary chunks on cloud storage...</span>}
                    {uploadStatus === "success" && <span className="text-[#e50914] font-semibold">Upload completed successfully!</span>}
                    {uploadStatus === "error" && <span className="text-red-500 font-semibold truncate max-w-xs">{errorMessage}</span>}
                  </div>
                </div>
              )}

              {/* Form Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-[#e50914] hover:bg-red-700 disabled:bg-black disabled:border disabled:border-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded tracking-wider text-sm transition-colors uppercase"
              >
                {isUploading ? "Uploading Chunks..." : "Upload & Deploy Media"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
