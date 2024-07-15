import { mintTo } from "@solana/spl-token";
import "dotenv/config";
import {
	getExplorerLink,
	getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

//Since token has 2 decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const user = getKeypairFromEnvironment("SECRET_KEY");

const tokenMintAccount = new PublicKey(
	"UGSPqxFbUQMq9CVXg874QQ6238nmBf3yxYgagYSb5a7"
);

const recipientAssociatedTokenAccount = new PublicKey(
	"Gc2w9hB1rNoEJL7HQWcH9HHL1r69cN7Zpi8iuYyXkMky"
);

const transactionSignature = await mintTo(
	connection,
	user,
	tokenMintAccount,
	recipientAssociatedTokenAccount,
	user,
	10 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log("Mint Token Txn: ", link);
