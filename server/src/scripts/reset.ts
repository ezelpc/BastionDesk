import "dotenv/config";
import { connectDB } from "../config/database";
import mongoose from "mongoose";

const reset = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "development") {
    console.error("[reset] ❌ Solo se puede ejecutar en development");
    process.exit(1);
  }

  await connectDB();

  const collections = await mongoose.connection.db!.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
    console.log(`[reset] ✓ Limpiada colección: ${collection.collectionName}`);
  }

  console.log("[reset] ✓ Base de datos limpia");
  await mongoose.connection.close();
  process.exit(0);
};

reset().catch((err) => {
  console.error("[reset] Error:", err);
  process.exit(1);
});