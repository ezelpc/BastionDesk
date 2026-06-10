import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

const app: Application = express();

// ── Seguridad ─────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                  // máximo 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas solicitudes, intenta más tarde." },
});
app.use("/api", limiter);

// ── Body parsers ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logger ────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "BastionBook API running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas (se agregan aquí conforme se construyen) ────────
// app.use("/api/auth",         authRoutes);
// app.use("/api/users",        userRoutes);
// app.use("/api/businesses",   businessRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/quotes",       quoteRoutes);
// app.use("/api/contracts",    contractRoutes);

// ── 404 ───────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// ── Error handler global ──────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;