import { createMint } from "@solana/spl-token";
import "dotenv/config";
import {
	getKeypairFromEnvironment,
	getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log("Loaded user, pubkey is: ", user.publicKey.toBase58());

// This is a shortcut that runs:
// SystemProgram.createAccount
// token.createInitializeMintInstruction
const tokenMint = await createMint(connection, user, user.publicKey, null, 2);

const link = getExplorerLink("address", tokenMint.toString(), "devnet");

console.log("Token mint: ", link);
// https://explorer.solana.com/address/UGSPqxFbUQMq9CVXg874QQ6238nmBf3yxYgagYSb5a7?cluster=devnet
