import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// Path to mock database of movies
const DB_PATH = path.join(process.cwd(), "src", "lib", "db_movies.json");

// Ensure the JSON DB has initial seed data
function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialMovies = [
      {
        id: "m-1",
        title: "The Cyberverse Conspiracy",
        description: "A rogue packets specialist discovers a backdoor in the decentralized consensus layer, sparking an electronic cold war. Standard protocols will be shattered. Luminaea original series.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
        duration: "105",
        releaseYear: 2026,
        genres: ["Sci-Fi", "Action", "Suspense"],
        rating: "16+",
        match: "98% Match",
        isTrending: true
      },
      {
        id: "m-2",
        title: "Synthesized Mind",
        description: "A neurologist bridges the gap between digital structures and biological memories, unlocking a new frontier of virtual existence.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        poster: "https://images.unsplash.com/photo-1539683255143-73a6b838b106?w=600&auto=format&fit=crop&q=80",
        duration: "130",
        releaseYear: 2025,
        genres: ["Thriller", "Mystery"],
        rating: "18+",
        match: "95% Match",
        isTrending: true
      },
      {
        id: "m-3",
        title: "Digital Eclipse",
        description: "As networks fail across the planet, a group of astronauts on a remote space station watch the lights go out on Earth.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        poster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        duration: "92",
        releaseYear: 2026,
        genres: ["Adventure", "Fantasy"],
        rating: "PG-13",
        match: "92% Match",
        isTopRated: true
      }
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(initialMovies, null, 2));
  }
}

export async function POST(req) {
  try {
    const { uploadId, fileKey, parts, metadata, directVideoUrl, directPosterUrl } = await req.json();

    let finalVideoUrl = directVideoUrl;
    let finalPosterUrl = directPosterUrl || "/placeholder-movie.jpg";

    if (!directVideoUrl) {
      if (!uploadId || !fileKey || !parts) {
        return NextResponse.json({ error: "Missing required complete parameters" }, { status: 400 });
      }

      const tempDir = path.join(os.tmpdir(), "luminaea_uploads", uploadId);
      let finalDir = path.join(process.cwd(), "public", "videos");
      let isServerlessFallback = false;

      try {
        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }
        // Test write permissions
        const testFile = path.join(finalDir, `.write_test_${Date.now()}`);
        fs.writeFileSync(testFile, "1");
        fs.unlinkSync(testFile);
      } catch (e) {
        isServerlessFallback = true;
        finalDir = path.join(os.tmpdir(), "luminaea_videos");
        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }
      }

      const finalPath = path.join(finalDir, fileKey);

      // 1. Sort parts by part number to guarantee chunk order
      const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

      // 2. Open write stream for final output
      const writeStream = fs.createWriteStream(finalPath);

      for (const part of sortedParts) {
        const partPath = path.join(tempDir, `part-${part.partNumber}`);
        if (!fs.existsSync(partPath)) {
          throw new Error(`Part ${part.partNumber} is missing from server storage.`);
        }

        // Read chunk sync and write to stream
        const chunkBuffer = fs.readFileSync(partPath);
        writeStream.write(chunkBuffer);
      }

      writeStream.end();

      // 3. Clean up parts and temporary directories
      for (const part of sortedParts) {
        const partPath = path.join(tempDir, `part-${part.partNumber}`);
        fs.unlinkSync(partPath);
      }
      fs.rmdirSync(tempDir);
      
      finalVideoUrl = `/api/videos/${fileKey}`;
    }

    // 4. Save metadata details to JSON Database
    let dbSaved = false;
    const genreArray = metadata.genre 
      ? metadata.genre.split(",").map(g => g.trim()) 
      : ["General"];

    const newMedia = {
      id: "m-" + Date.now(),
      title: metadata.title || "Untitled Media",
      description: metadata.description || "",
      videoUrl: finalVideoUrl,
      poster: finalPosterUrl,
      duration: metadata.duration ? `${metadata.duration}m` : "120m",
      releaseYear: parseInt(metadata.releaseYear) || 2026,
      genres: genreArray,
      rating: "16+",
      match: "95% Match",
      isTrending: true
    };

    try {
      ensureDbExists();
      const currentDbData = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      currentDbData.push(newMedia);
      fs.writeFileSync(DB_PATH, JSON.stringify(currentDbData, null, 2));
      dbSaved = true;
    } catch (dbErr) {
      console.warn("Unable to write metadata to server JSON database (typical for serverless read-only hosts like Vercel). Falling back to client-side localStorage sync.", dbErr);
    }

    return NextResponse.json({
      success: true,
      videoUrl: `/api/videos/${fileKey}`,
      media: newMedia,
      dbSaved
    });
  } catch (err) {
    console.error("Upload complete route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
