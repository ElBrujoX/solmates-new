import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Test wallet
const testWallet = Keypair.generate();

// Test functions
async function testAuth() {
  // 1. Get nonce
  const nonceResponse = await fetch('https://solmates-new-production.up.railway.app/api/auth/nonce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: testWallet.publicKey.toString() })
  });
  const { nonce } = await nonceResponse.json();

  // 2. Sign message
  const message = `Sign this message for authentication: ${nonce}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, testWallet.secretKey);
  const signatureBase58 = bs58.encode(signature);

  // 3. Verify signature
  const verifyResponse = await fetch('https://solmates-new-production.up.railway.app/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: testWallet.publicKey.toString(),
      signature: signatureBase58
    })
  });
  const { token } = await verifyResponse.json();

  // 4. Test protected endpoint
  const reportResponse = await fetch('https://solmates-new-production.up.railway.app/api/reports', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  console.log(await reportResponse.json());
}

testAuth().catch(console.error); 