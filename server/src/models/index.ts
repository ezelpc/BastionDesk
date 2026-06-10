// ============================================================
// BARREL EXPORT — Models + Types
// Importa todo desde aquí para simplificar los imports en
// controllers, routes y scripts.
// ============================================================

// ── Re-exportar enums desde types (fuente única de verdad) ─
export * from "../types";

// ── Modelos Mongoose ──────────────────────────────────────
export { User }         from "./user";
export { Business }     from "./business";
export { Appointment }  from "./appointment";
export { Quote }        from "./quote";
export { Contract }     from "./contract";
export { Notification } from "./notification";