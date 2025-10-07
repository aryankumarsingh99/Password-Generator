import mongoose from "mongoose";

const VaultSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true, unique: true },
  blob: { type: String, required: true }, // encrypted vault JSON blob
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // optional metadata (user, notes, etc.)
}, { timestamps: true });

const Vault = mongoose.models.Vault || mongoose.model("Vault", VaultSchema);
export default Vault;