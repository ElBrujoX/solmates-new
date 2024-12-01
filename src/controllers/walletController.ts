import { Request, Response } from 'express';
import { Connection, PublicKey, ParsedTransactionWithMeta, TokenAccountsFilter } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection(process.env.SOLANA_RPC_HOST || 'https://api.mainnet-beta.solana.com');

export const walletController = {
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const pubKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(pubKey);
      res.json({ balance: balance / 1e9 }); // Convert lamports to SOL
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTokens(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const pubKey = new PublicKey(walletAddress);
      const tokens = await connection.getParsedTokenAccountsByOwner(pubKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
      res.json(tokens.value);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const { limit = '20', before = '' } = req.query;
      const pubKey = new PublicKey(walletAddress);

      const signatures = await connection.getSignaturesForAddress(pubKey, {
        limit: parseInt(limit as string),
        before: before ? before as string : undefined
      });

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          return {
            signature: sig.signature,
            timestamp: sig.blockTime,
            status: sig.err ? 'failed' : 'success',
            details: tx?.meta,
            type: getTransactionType(tx)
          };
        })
      );

      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSPLTokens(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const pubKey = new PublicKey(walletAddress);

      const filter: TokenAccountsFilter = {
        programId: TOKEN_PROGRAM_ID
      };

      const { value: tokenAccounts } = await connection.getParsedTokenAccountsByOwner(
        pubKey,
        filter
      );

      const tokens = tokenAccounts.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        tokenAccount: account.pubkey.toString()
      }));

      res.json(tokens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getNFTs(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = req.params;
      const pubKey = new PublicKey(walletAddress);

      const nfts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
        filters: [
          { dataSize: 165 },
          { memcmp: { offset: 32, bytes: pubKey.toBase58() } }
        ]
      });

      const nftData = nfts
        .map(nft => nft.account.data)
        .filter(data => {
          const parsed = (data as any).parsed;
          return parsed?.info.tokenAmount?.uiAmount === 1;
        });

      res.json(nftData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};

function getTransactionType(tx: ParsedTransactionWithMeta | null): string {
  if (!tx?.meta) return 'unknown';
  
  const instructions = tx.transaction.message.instructions;
  if (instructions.length === 0) return 'unknown';

  const programId = instructions[0].programId.toString();
  
  // Map common program IDs to transaction types
  const programTypes: Record<string, string> = {
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'token',
    '11111111111111111111111111111111': 'system',
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr': 'memo'
  };

  return programTypes[programId] || 'unknown';
} 