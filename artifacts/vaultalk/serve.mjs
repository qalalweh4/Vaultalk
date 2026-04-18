import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist", "public");
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".mjs":  "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".webp": "image/webp",
  ".mp4":  "video/mp4",
  ".webm": "video/webm",
};

const server = http.createServer((req, res) => {
  let url = req.url.split("?")[0];

  // Strip base path prefix if needed (deployed under a sub-path)
  const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
  if (base && url.startsWith(base)) {
    url = url.slice(base.length) || "/";
  }

  // Serve index.html for root
  if (url === "/" || url === "") url = "/index.html";

  const filePath = path.join(DIST, url);
  const ext = path.extname(filePath).toLowerCase();

  // Try to serve the file; fall back to index.html for SPA routing
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000",
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback — serve index.html for all unknown routes
      const indexPath = path.join(DIST, "index.html");
      fs.readFile(indexPath, (err2, data) => {
        if (err2) {
          res.writeHead(500);
          res.end("Server error");
          return;
        }
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(data);
      });
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serving ${DIST} on port ${PORT}`);
});
