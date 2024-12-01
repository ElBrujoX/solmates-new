import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

export const authController = {
  async getNonce(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.body;
      
      // Validate Solana address
      try {
        new PublicKey(walletAddress);
      } catch {
        res.status(400).json({ error: 'Invalid wallet address' });
        return;
      }

      let user = await User.findOne({ walletAddress });
      if (!user) {
        user = await User.create({ 
          walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`
        });
      }

      const nonce = user.generateNonce();
      await user.save();

      res.json({ nonce });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async verifyWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress, signature } = req.body;
      
      const user = await User.findOne({ walletAddress });
      if (!user?.nonce) {
        res.status(401).json({ error: 'Invalid wallet or nonce' });
        return;
      }

      // Verify signature
      try {
        const message = `Sign this message for authentication: ${user.nonce}`;
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = new PublicKey(walletAddress).toBytes();

        const isValid = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );

        if (!isValid) {
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }
      } catch (error) {
        res.status(401).json({ error: 'Signature verification failed' });
        return;
      }

      // Clear nonce and update login time
      user.nonce = undefined;
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}; 