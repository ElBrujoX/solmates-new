import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://solmates-new-production.up.railway.app/api';

async function testWalletFeatures() {
  // 1. Create test wallet
  const testWallet = Keypair.generate();
  console.log('Test wallet:', testWallet.publicKey.toString());

  // 2. Get nonce and authenticate
  const { token } = await authenticate(testWallet);
  console.log('JWT Token:', token);

  // 3. Test wallet features
  await testBalance(testWallet.publicKey.toString());
  await testTokens(testWallet.publicKey.toString());
  await testProtectedEndpoints(token);
  await testTransactionHistory(testWallet.publicKey.toString());
  await testSPLTokens(testWallet.publicKey.toString());
  await testNFTs(testWallet.publicKey.toString());
}

async function authenticate(wallet: Keypair) {
  // Get nonce
  const nonceRes = await fetch(`${BASE_URL}/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: wallet.publicKey.toString() })
  });
  const { nonce } = await nonceRes.json();

  // Sign message
  const message = `Sign this message for authentication: ${nonce}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, wallet.secretKey);
  const signatureBase58 = bs58.encode(signature);

  // Verify and get token
  const verifyRes = await fetch(`${BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: wallet.publicKey.toString(),
      signature: signatureBase58
    })
  });
  return verifyRes.json();
}

async function testBalance(walletAddress: string) {
  const res = await fetch(`${BASE_URL}/wallet/${walletAddress}/balance`, {
    headers: { 'X-API-KEY': API_KEY as string }
  });
  console.log('Balance:', await res.json());
}

async function testTokens(walletAddress: string) {
  const res = await fetch(`${BASE_URL}/wallet/${walletAddress}/tokens`, {
    headers: { 'X-API-KEY': API_KEY as string }
  });
  console.log('Tokens:', await res.json());
}

async function testProtectedEndpoints(token: string) {
  // Test creating a report
  const reportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Test Report',
      description: 'Test Description',
      risk_level: 'high'
    })
  });
  console.log('Create Report:', await reportRes.json());

  // Test getting reports
  const getReportsRes = await fetch(`${BASE_URL}/reports`, {
    headers: { 'X-API-KEY': API_KEY as string }
  });
  console.log('Get Reports:', await getReportsRes.json());
}

async function testTransactionHistory(walletAddress: string) {
  const res = await fetch(`${BASE_URL}/wallet/${walletAddress}/transactions`, {
    headers: { 'X-API-KEY': API_KEY as string }
  });
  console.log('Transaction History:', await res.json());
}

async function testSPLTokens(walletAddress: string) {
  const res = await fetch(`${BASE_URL}/wallet/${walletAddress}/spl-tokens`, {
    headers: { 'X-API-KEY': API_KEY as string }
  });
  console.log('SPL Tokens:', await res.json());
}

async function testNFTs(walletAddress: string) {
  const res = await fetch(`${BASE_URL}/wallet/${walletAddress}/nfts`, {
    headers: { 'X-API-KEY': API_KEY as string }
  });
  console.log('NFTs:', await res.json());
}

testWalletFeatures().catch(console.error); 