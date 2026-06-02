import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { resellerApi } from "./apps/api/server";

async function startGateway() {
  const app = express();
  const PORT = 3000;

  // Mount the API sub-application
  app.use("/api", resellerApi);

  // Vite middleware for the web sub-application
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
      },
      root: path.join(process.cwd(), "apps/web"),
      appType: "spa",
      configFile: path.join(process.cwd(), "vite.config.ts")
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GATEWAY] SOREPCO Monorepo active on port ${PORT}`);
    console.log(`[GATEWAY] API: http://localhost:${PORT}/api`);
    console.log(`[GATEWAY] WEB: http://localhost:${PORT}/`);
  });
}

startGateway();
