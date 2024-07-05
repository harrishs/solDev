import {
	Connection,
	LAMPORTS_PER_SOL,
	PublicKey,
	clusterApiUrl,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const publicKey = new PublicKey("3wK7eg3472qEaqLB4TEyRat5emKcG6n1UnhceaX8FUZV");
const balanceInLamports = await connection.getBalance(publicKey);
const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

console.log(`Balance for wallet ${publicKey} is ${balanceInSol} SOL`);
