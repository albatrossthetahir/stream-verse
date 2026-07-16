import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "lib", "db_movies.json");

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
        description: "A rogue packets specialist discovers a backdoor in the decentralized consensus layer, sparking an electronic cold war. Standard protocols will be shattered. StreamVerse original series.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
        duration: "105m",
        releaseYear: 2026,
        genres: ["Sci-Fi", "Action", "Suspense"],
        rating: "16+",
        match: "98% Match",
        isTrending: true,
        isTopRated: false
      },
      {
        id: "m-2",
        title: "Synthesized Mind",
        description: "A neurologist bridges the gap between digital structures and biological memories, unlocking a new frontier of virtual existence.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        poster: "https://images.unsplash.com/photo-1539683255143-73a6b838b106?w=600&auto=format&fit=crop&q=80",
        duration: "130m",
        releaseYear: 2025,
        genres: ["Thriller", "Mystery"],
        rating: "18+",
        match: "95% Match",
        isTrending: true,
        isTopRated: false
      },
      {
        id: "m-3",
        title: "Digital Eclipse",
        description: "As networks fail across the planet, a group of astronauts on a remote space station watch the lights go out on Earth.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        poster: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        duration: "92m",
        releaseYear: 2026,
        genres: ["Adventure", "Fantasy"],
        rating: "PG-13",
        match: "92% Match",
        isTrending: false,
        isTopRated: true
      },
      {
        id: "m-4",
        title: "The Network Protocols",
        description: "A hacker collective designs an autonomous script that goes rogue, taking down major internet backbones while negotiating directly with the UN.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        poster: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
        duration: "48m",
        releaseYear: 2025,
        genres: ["Sci-Fi", "Drama"],
        rating: "16+",
        match: "89% Match",
        isTrending: true,
        isTopRated: true
      },
      {
        id: "m-5",
        title: "Quantum Paradox",
        description: "An experimental time machine breaches a rift into alternate temporal streams, forcing the inventors to outrun echo versions of themselves.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        poster: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80",
        duration: "118m",
        releaseYear: 2026,
        genres: ["Action", "Suspense"],
        rating: "16+",
        match: "96% Match",
        isTrending: false,
        isTopRated: true
      }
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(initialMovies, null, 2));
  }
}

export async function GET() {
  try {
    ensureDbExists();
    const data = fs.readFileSync(DB_PATH, "utf8");
    const movies = JSON.parse(data);
    return NextResponse.json(movies);
  } catch (err) {
    console.error("GET media error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
