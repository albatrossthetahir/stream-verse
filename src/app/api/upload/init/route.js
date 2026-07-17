import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import os from "os";

export async function POST(req) {
  try {
    const { filename, contentType, title } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Generate unique session ID
    const uploadId = "up-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    
    // Sanitize filename to avoid folder traversals
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileKey = sanitizedName;

    // Create temp directory for chunks
    const tempDir = path.join(os.tmpdir(), "luminaea_uploads", uploadId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    return NextResponse.json({
      success: true,
      uploadId,
      fileKey,
      tempDir: path.join(os.tmpdir(), "luminaea_uploads", uploadId)
    });
  } catch (err) {
    try {
      fs.writeFileSync(path.join(process.cwd(), "error_log.txt"), `Upload init error: ${err.stack || err.message}`);
    } catch (e) {}
    console.error("Upload init route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
