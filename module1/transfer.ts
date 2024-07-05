import {
	Keypair,
	Connection,
	Transaction,
	SystemProgram,
	sendAndConfirmTransaction,
	clusterApiUrl,
	LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const connection = new Connection(clusterApiUrl("devnet"));

const recieverPair = Keypair.generate();
const senderPair = getKeypairFromEnvironment("SECRET_KEY");

console.log("Sender Pub: ", senderPair.publicKey.toBase58());
console.log("Reciever Pub: ", recieverPair.publicKey.toBase58());

const transaction = new Transaction();
const LAMPORTS_TO_SEND = 1250000;

const sendSolInstruction = SystemProgram.transfer({
	fromPubkey: senderPair.publicKey,
	toPubkey: recieverPair.publicKey,
	lamports: LAMPORTS_TO_SEND,
});

transaction.add(sendSolInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
	senderPair,
]);

const recieverBalanceInLamports = await connection.getBalance(
	recieverPair.publicKey
);
const recieverBalanceInSol = recieverBalanceInLamports / LAMPORTS_PER_SOL;

console.log(
	`Transfer to ${recieverPair.publicKey.toBase58()} succeeded. Balance is ${recieverBalanceInSol}`
);
