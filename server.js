const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "movies.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readMovies() {
  const content = await fs.readFile(DATA_FILE, "utf8");
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : [];
}

async function writeMovies(movies) {
  await fs.writeFile(DATA_FILE, JSON.stringify(movies, null, 2), "utf8");
}

function getRequestBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
}

function normalizeMovie(req, movie) {
  const imagePath = String(movie.imageUrl || "");
  if (/^https?:\/\//i.test(imagePath)) {
    return movie;
  }

  if (!imagePath.startsWith("/")) {
    return movie;
  }

  return {
    ...movie,
    imageUrl: `${getRequestBaseUrl(req)}${imagePath}`
  };
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  }
});

app.set("trust proxy", true);
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.static(__dirname));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/movies", async (req, res) => {
  try {
    const movies = await readMovies();
    movies.sort((a, b) => (b.id || 0) - (a.id || 0));
    res.json(movies.map((movie) => normalizeMovie(req, movie)));
  } catch (error) {
    res.status(500).json({ message: "Failed to load movies", error: error.message });
  }
});

app.post("/api/movies", upload.single("image"), async (req, res) => {
  try {
    const { title, time } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    if (!time || !/^\d{4}-\d{2}-\d{2}$/.test(time)) {
      return res.status(400).json({ message: "time must be YYYY-MM-DD" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "image file is required" });
    }

    const movies = await readMovies();
    const nextId = movies.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

    const newMovie = {
      id: nextId,
      title: title.trim(),
      time,
      imageUrl: `/uploads/${req.file.filename}`
    };

    movies.push(newMovie);
    await writeMovies(movies);

    return res.status(201).json(normalizeMovie(req, newMovie));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create movie", error: error.message });
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message || "Bad request" });
  }

  return res.status(500).json({ message: "Unknown error" });
});

ensureStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize storage", error);
    process.exit(1);
  });
