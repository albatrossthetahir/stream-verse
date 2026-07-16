"use client";
import React, { useState } from "react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB standard multipart chunk size

export default function ChunkedUploader() {
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

    const startTime = Date.now();

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

        // Calculate upload speed
        const partStart = Date.now();

        // Create form payload to hold binary data
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

        // Calculate stats
        const partEnd = Date.now();
        const durationSec = (partEnd - partStart) / 1000;
        const sizeMB = chunkBlob.size / (1024 * 1024);
        if (durationSec > 0) {
          setSpeedMB(parseFloat((sizeMB / durationSec).toFixed(2)));
        }

        // Update progress hook
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
    <div className="bg-[#181818] border border-zinc-800 text-white rounded-xl p-6 sm:p-8 max-w-2xl w-full mx-auto shadow-2xl font-sans relative">
      <h2 className="text-2xl font-bold mb-2 tracking-wide text-white">
        Media Catalog Admin Panel
      </h2>
      <p className="text-sm text-gray-400 mb-8 border-b border-zinc-800 pb-4">
        Add new titles to StreamVerse. Support high-speed chunked uploads for large video assets.
      </p>

      <form onSubmit={startUpload} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Media Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cyberverse Conspiracy"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
            required
            disabled={isUploading}
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Description / Synopsis
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a brief overview of the plot, characters, and settings."
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors resize-none"
            required
            disabled={isUploading}
          />
        </div>

        {/* Year, Genre, Duration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Release Year
            </label>
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(parseInt(e.target.value))}
              min={1900}
              max={2099}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
              required
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Genre Tag
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Sci-Fi, Drama"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
              required
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 105"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-4 outline-none focus:border-[#e50914] text-white text-base transition-colors"
              required
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Thumbnail & Video File Upload Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Thumbnail Image Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Thumbnail / Poster (JPG/PNG)
            </label>
            <div className="relative border border-dashed border-zinc-800 rounded-lg bg-zinc-900 py-6 px-4 text-center cursor-pointer hover:border-zinc-600 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "poster")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-500 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
              </svg>
              <span className="text-xs text-gray-400 block truncate">
                {posterFile ? posterFile.name : "Choose thumbnail file"}
              </span>
            </div>
          </div>

          {/* Large Video File Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Video File (MP4/MKV)
            </label>
            <div className="relative border border-dashed border-[#e50914]/40 rounded-lg bg-zinc-900 py-6 px-4 text-center cursor-pointer hover:border-[#e50914] transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, "video")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
                disabled={isUploading}
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-[#e50914]/60 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <span className="text-xs text-[#e50914]/80 block truncate">
                {videoFile ? `${videoFile.name} (${(videoFile.size / (1024*1024)).toFixed(1)} MB)` : "Choose video file"}
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS METRICS BOX (Rendered during active uploads) */}
        {(isUploading || uploadStatus) && uploadStatus !== "" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400 capitalize">
                Status: <strong className="text-white">{uploadStatus}</strong>
              </span>
              {uploadStatus === "uploading" && (
                <span className="text-green-400">{speedMB} MB/s</span>
              )}
            </div>

            {/* Slider bar progress indicator */}
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-[#e50914] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>{uploadProgress}% completed</span>
              {uploadStatus === "initing" && <span>Initiating secure session...</span>}
              {uploadStatus === "completing" && <span>Merging binary chunks on cloud storage...</span>}
              {uploadStatus === "success" && <span className="text-green-500 font-semibold">Upload completed successfully!</span>}
              {uploadStatus === "error" && <span className="text-red-500 font-semibold truncate max-w-xs">{errorMessage}</span>}
            </div>
          </div>
        )}

        {/* Form Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-[#e50914] hover:bg-red-700 disabled:bg-zinc-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-lg tracking-wider text-base transition-colors"
        >
          {isUploading ? "Uploading Chunks..." : "Upload & Deploy Media"}
        </button>
      </form>
    </div>
  );
}
