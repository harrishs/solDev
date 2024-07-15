import "dotenv/config";
import {
	getExplorerLink,
	getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));
const sender = getKeypairFromEnvironment("SECRET_KEY");

console.log("Loaded sender, pubkey is: ", sender.publicKey.toBase58());

const recipient = new PublicKey("6oKvoGLJjcQ85uqyzy4L7UFHvznLw4ngCaYXqPJJ3Yyg");

const tokenMintAccount = new PublicKey(
	"UGSPqxFbUQMq9CVXg874QQ6238nmBf3yxYgagYSb5a7"
);

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

console.log("Sending 1 token to: ", recipient.toBase58());

// Get or create the source and destination token accounts to store this token
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
	connection,
	sender,
	tokenMintAccount,
	sender.publicKey
);

const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
	connection,
	sender,
	tokenMintAccount,
	recipient
);

//Transfer the tokens
const signature = await transfer(
	connection,
	sender,
	sourceTokenAccount.address,
	destinationTokenAccount.address,
	sender,
	1 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink("transaction", signature, "devnet");

console.log("Txn link: ", link);
