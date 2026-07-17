import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    const { uploadId, fileKey, parts, metadata } = await req.json();

    if (!uploadId || !fileKey || !parts) {
      return NextResponse.json({ error: "Missing required complete parameters" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), ".temp_uploads", uploadId);
    const finalDir = path.join(process.cwd(), "public", "videos");

    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
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

    // 4. Save metadata details to JSON Database
    ensureDbExists();
    const currentDbData = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    
    // Parse tags/genres
    const genreArray = metadata.genre 
      ? metadata.genre.split(",").map(g => g.trim()) 
      : ["General"];

    const newMedia = {
      id: "m-" + Date.now(),
      title: metadata.title || "Untitled Media",
      description: metadata.description || "",
      videoUrl: `/videos/${fileKey}`,
      poster: "/placeholder-movie.jpg", // default fallback poster
      duration: metadata.duration ? `${metadata.duration}m` : "120m",
      releaseYear: parseInt(metadata.releaseYear) || 2026,
      genres: genreArray,
      rating: "16+",
      match: "95% Match",
      isTrending: true
    };

    currentDbData.push(newMedia);
    fs.writeFileSync(DB_PATH, JSON.stringify(currentDbData, null, 2));

    return NextResponse.json({
      success: true,
      videoUrl: `/videos/${fileKey}`,
      media: newMedia
    });
  } catch (err) {
    console.error("Upload complete route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
