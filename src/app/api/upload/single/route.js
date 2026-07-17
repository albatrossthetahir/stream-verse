import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// Route segment config
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Path to mock database of movies
const DB_PATH = path.join(process.cwd(), "src", "lib", "db_movies.json");

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, "[]");
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const videoFile = formData.get("video");
    const title = formData.get("title") || "Untitled Media";
    const description = formData.get("description") || "";
    const releaseYear = formData.get("releaseYear") || "2026";
    const genre = formData.get("genre") || "General";
    const duration = formData.get("duration") || "120";
    const directVideoUrl = formData.get("directVideoUrl");
    const directPosterUrl = formData.get("directPosterUrl") || "/placeholder-movie.jpg";

    let finalVideoUrl;

    if (directVideoUrl) {
      // Direct URL mode — no binary upload needed
      finalVideoUrl = directVideoUrl;
    } else if (videoFile && videoFile.size > 0) {
      // File upload mode — write entire file in a single request
      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Sanitize filename
      const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

      // Try writing to public/videos first, fall back to tmp
      let finalDir = path.join(process.cwd(), "public", "videos");
      let useApiRoute = false;

      try {
        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }
        const testFile = path.join(finalDir, `.write_test_${Date.now()}`);
        fs.writeFileSync(testFile, "1");
        fs.unlinkSync(testFile);
      } catch (e) {
        // Read-only filesystem (Vercel) — use tmp
        finalDir = path.join(os.tmpdir(), "luminaea_videos");
        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }
        useApiRoute = true;
      }

      const finalPath = path.join(finalDir, sanitizedName);
      fs.writeFileSync(finalPath, buffer);

      finalVideoUrl = useApiRoute
        ? `/api/videos/${sanitizedName}`
        : `/videos/${sanitizedName}`;
    } else {
      return NextResponse.json({ error: "No video file or URL provided" }, { status: 400 });
    }

    // Build media record
    const genreArray = genre.split(",").map(g => g.trim());
    const newMedia = {
      id: "m-" + Date.now(),
      title,
      description,
      videoUrl: finalVideoUrl,
      poster: directPosterUrl,
      duration: duration ? `${duration}m` : "120m",
      releaseYear: parseInt(releaseYear) || 2026,
      genres: genreArray.length > 0 ? genreArray : ["General"],
      rating: "16+",
      match: "95% Match",
      isTrending: true
    };

    // Try saving to JSON database
    let dbSaved = false;
    try {
      ensureDbExists();
      const currentDbData = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      currentDbData.push(newMedia);
      fs.writeFileSync(DB_PATH, JSON.stringify(currentDbData, null, 2));
      dbSaved = true;
    } catch (dbErr) {
      console.warn("DB write failed (read-only filesystem):", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      videoUrl: finalVideoUrl,
      media: newMedia,
      dbSaved
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
