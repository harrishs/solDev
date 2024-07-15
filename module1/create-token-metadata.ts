import "dotenv/config";
import {
	getKeypairFromEnvironment,
	getExplorerLink,
} from "@solana-developers/helpers";
import {
	Connection,
	clusterApiUrl,
	PublicKey,
	Transaction,
	sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const user = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log("Loaded user, pubkey is: ", user.publicKey.toBase58());

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const tokenMintAccount = new PublicKey(
	"UGSPqxFbUQMq9CVXg874QQ6238nmBf3yxYgagYSb5a7"
);

const metadataData = {
	name: "Sol Learning Token",
	symbol: "SLT",
	// Arweave / IPFS / Pinata etc link using metaplex standard for off-chain dats
	uri: "https://arweave.net/1234",
	sellerFeeBasisPoints: 0,
	creators: null,
	collection: null,
	uses: null,
};

const metadataPDAAndBump = PublicKey.findProgramAddressSync(
	[
		Buffer.from("metadata"),
		TOKEN_METADATA_PROGRAM_ID.toBuffer(),
		tokenMintAccount.toBuffer(),
	],
	TOKEN_METADATA_PROGRAM_ID
);

const metadataPDA = metadataPDAAndBump[0];

const transaction = new Transaction();

const createMetaDataAccountInstruction =
	createCreateMetadataAccountV3Instruction(
		{
			metadata: metadataPDA,
			mint: tokenMintAccount,
			mintAuthority: user.publicKey,
			payer: user.publicKey,
			updateAuthority: user.publicKey,
		},
		{
			createMetadataAccountArgsV3: {
				collectionDetails: null,
				data: metadataData,
				isMutable: true,
			},
		}
	);

transaction.add(createMetaDataAccountInstruction);

const transactionSignature = await sendAndConfirmTransaction(
	connection,
	transaction,
	[user]
);

const transactionLink = getExplorerLink(
	"transaction",
	transactionSignature,
	"devnet"
);

console.log("Txn: ", transactionLink);

const tokenMintLink = getExplorerLink(
	"address",
	tokenMintAccount.toString(),
	"devnet"
);

console.log("Token mint: ", tokenMintLink);
