import mongoose from "mongoose";

// ── Colores para la consola ───────────────────────────────
const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";

// ── Opciones de conexión ──────────────────────────────────
const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,  // Tiempo máximo buscando servidor
  socketTimeoutMS: 45000,          // Tiempo máximo de inactividad
  maxPoolSize: 10,                 // Máximo de conexiones simultáneas
};

// ── Función principal de conexión ─────────────────────────
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(`${RED}[DB] MONGODB_URI no definida en .env${RESET}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, MONGOOSE_OPTIONS);
  } catch (error) {
    console.error(`${RED}[DB] Error al conectar con MongoDB:${RESET}`, error);
    process.exit(1);
  }
};

// ── Eventos de conexión ───────────────────────────────────
mongoose.connection.on("connected", () => {
  const db = mongoose.connection.db?.databaseName ?? "unknown";
  console.log(`${GREEN}[DB] ✓ Conectado a MongoDB Atlas — ${CYAN}${db}${RESET}`);
});

mongoose.connection.on("error", (error) => {
  console.error(`${RED}[DB] Error de conexión:${RESET}`, error);
});

mongoose.connection.on("disconnected", () => {
  console.warn(`${YELLOW}[DB] Desconectado de MongoDB${RESET}`);
});

// ── Cierre limpio al terminar el proceso ──────────────────
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(`${YELLOW}[DB] Conexión cerrada por SIGINT${RESET}`);
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log(`${YELLOW}[DB] Conexión cerrada por SIGTERM${RESET}`);
  process.exit(0);
});