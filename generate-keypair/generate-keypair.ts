// import { Keypair } from "@solana/web3.js";
// const keypair = Keypair.generate();

import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");

console.log("pub key is: ", keypair.publicKey.toBase58());
console.log("secret key is: ", keypair.secretKey);
