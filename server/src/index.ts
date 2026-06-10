import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  // 1. Conectar a MongoDB Atlas
  await connectDB();

  // 2. Arrancar el servidor
  app.listen(PORT, () => {
    console.log(`\x1b[32m[API] ✓ Servidor corriendo → http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36m[API] Health check → http://localhost:${PORT}/api/health\x1b[0m`);
  });
};

startServer();