import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(req, { params }) {
  try {
    const { filename } = params;

    if (!filename) {
      return NextResponse.json({ error: "Filename parameter is required" }, { status: 400 });
    }

    // 1. Check in static videos directory
    let filePath = path.join(process.cwd(), "public", "videos", filename);

    // 2. Fall back to writeable tmp directory
    if (!fs.existsSync(filePath)) {
      filePath = path.join(os.tmpdir(), "luminaea_videos", filename);
    }

    // If still doesn't exist, return 404
    if (!fs.existsSync(filePath)) {
      return new Response("Video file not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    // Standard HTML5 range streaming support
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const fileStream = fs.createReadStream(filePath, { start, end });
      
      return new Response(fileStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        }
      });
    } else {
      const fileStream = fs.createReadStream(filePath);
      return new Response(fileStream, {
        headers: {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
          "Accept-Ranges": "bytes",
        }
      });
    }
  } catch (err) {
    console.error("Video streaming endpoint error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
