import mongoose, { Schema, Document } from 'mongoose';

interface IPin extends Document {
  proyecto: string;
  modelo: string;
  nombre: string;
  cedula: number;
  telefono: number;
  correo: string;
  pin: string;
  expiresAt: Date;
  used: boolean;
}

const pinSchema = new Schema<IPin>({
    proyecto: { type: String, required: true },
    modelo: { type: String, required: true },
    nombre: { type: String, required: true },
    cedula: { type: Number, required: true },
    telefono: { type: Number, required: true },
    correo: { type: String, required: true },
    pin: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }, // Indica si el PIN ya fue usado
  });
  
  pinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
  export default mongoose.model<IPin>('Pin', pinSchema);
