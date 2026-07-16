import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const chunkFile = formData.get("chunk");
    const uploadId = formData.get("uploadId");
    const partNumber = formData.get("partNumber");
    const fileKey = formData.get("fileKey");

    if (!chunkFile || !uploadId || !partNumber) {
      return NextResponse.json({ error: "Missing required upload parameters" }, { status: 400 });
    }

    // Convert file slice data to buffer
    const arrayBuffer = await chunkFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save part slice
    const partPath = path.join(process.cwd(), "public", "temp_uploads", uploadId, `part-${partNumber}`);
    fs.writeFileSync(partPath, buffer);

    // Return a mock ETag for the part
    const mockETag = `etag-${uploadId}-${partNumber}`;

    return NextResponse.json({
      success: true,
      partNumber: parseInt(partNumber),
      ETag: mockETag
    });
  } catch (err) {
    console.error("Upload part route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
