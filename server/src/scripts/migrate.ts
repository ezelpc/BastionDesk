import "dotenv/config";
import { connectDB } from "../config/database";
import mongoose from "mongoose";

// ── Importar todos los modelos desde el barrel ────────────
import {
  User,
  Business,
  Appointment,
  Quote,
  Contract,
  Notification,
} from "../models";

// ── Colores consola ───────────────────────────────────────
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const RESET  = "\x1b[0m";

const log = (msg: string) => console.log(`${CYAN}[migrate]${RESET} ${msg}`);
const ok  = (msg: string) => console.log(`${GREEN}[migrate] ✓${RESET} ${msg}`);
const warn = (msg: string) => console.log(`${YELLOW}[migrate] !${RESET} ${msg}`);

// ═══════════════════════════════════════════════════════════
// MIGRACIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════
const migrate = async (): Promise<void> => {
  await connectDB();

  log("Iniciando migraciones...");
  log("─".repeat(50));

  // ── 1. Crear colecciones e índices mediante syncIndexes ──
  // syncIndexes() crea la colección si no existe, aplica los
  // índices definidos en el Schema y elimina los obsoletos.

  log("Sincronizando colección: users");
  await User.syncIndexes();
  ok("users — índices sincronizados");

  log("Sincronizando colección: businesses");
  await Business.syncIndexes();
  ok("businesses — índices sincronizados");

  log("Sincronizando colección: appointments");
  await Appointment.syncIndexes();
  ok("appointments — índices sincronizados");

  log("Sincronizando colección: quotes");
  await Quote.syncIndexes();
  ok("quotes — índices sincronizados");

  log("Sincronizando colección: contracts");
  await Contract.syncIndexes();
  ok("contracts — índices sincronizados");

  log("Sincronizando colección: notifications");
  await Notification.syncIndexes();
  ok("notifications — índices sincronizados");

  // ── 2. Verificar colecciones creadas ─────────────────────
  log("─".repeat(50));
  const db = mongoose.connection.db!;
  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name).sort();

  log(`Colecciones en la DB (${names.length}):`);
  names.forEach((name) => console.log(`   • ${name}`));

  // ── 3. Migraciones de datos (futuras) ────────────────────
  log("─".repeat(50));
  log("Migraciones de datos pendientes: ninguna");

  // ── PLANTILLA para migraciones futuras ───────────────────
  // Cuando necesites agregar un campo nuevo, descomenta y adapta:
  //
  // log("Migrando: agregar campo 'isVerified' a usuarios sin el campo...");
  // const result = await User.updateMany(
  //   { isVerified: { $exists: false } },
  //   { $set: { isVerified: false } }
  // );
  // ok(`isVerified agregado a ${result.modifiedCount} documentos`);

  log("─".repeat(50));
  ok("Todas las migraciones completadas exitosamente");

  await mongoose.connection.close();
  ok("Conexión cerrada");
  process.exit(0);
};

migrate().catch((err) => {
  console.error("\x1b[31m[migrate] Error fatal:\x1b[0m", err);
  process.exit(1);
});