import mongoose, { Schema, Document } from 'mongoose';

interface IPin extends Document {
  proyecto: string;
  modelo: string;
  nombre: string;
  finca: string; // Cambiado de 'finca'
  cedula: string; // Cambiado a string para manejar posibles formatos
  telefono: string; // Cambiado a string para incluir códigos de área, etc.
  correo: string;
  pin: string;
  expiresAt: Date;
  used: boolean;
}

const pinSchema = new Schema<IPin>({
  proyecto: { type: String, required: true },
  modelo: { type: String, required: true },
  nombre: { type: String, required: true },
  finca: { type: String, required: true }, // Cambiado de 'finca'
  cedula: { type: String, required: true }, // Cambiado a string
  telefono: { type: String, required: true }, // Cambiado a string
  correo: { type: String, required: true },
  pin: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

// Agregar un índice TTL (Time To Live) para la expiración
pinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IPin>('Pin', pinSchema);
