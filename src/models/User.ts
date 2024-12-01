import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  walletAddress: string;
  role: 'admin' | 'moderator' | 'user';
  profile: {
    displayName?: string;
    bio?: string;
    avatar?: string;
  };
  lastLogin?: Date;
  isActive: boolean;
  created_at: Date;
  nonce?: string;
  generateNonce: () => string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'moderator', 'user'], default: 'user' },
  profile: {
    displayName: String,
    bio: String,
    avatar: String
  },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  nonce: String
});

UserSchema.methods.generateNonce = function(): string {
  const nonce = Math.floor(Math.random() * 1000000).toString();
  this.nonce = nonce;
  return nonce;
};

export const User = model<IUser>('User', UserSchema); 