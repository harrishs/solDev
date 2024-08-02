import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import {
	MINT_SIZE,
	TOKEN_PROGRAM_ID,
	getMinimumBalanceForRentExemptMint,
	createInitializeMintInstruction,
	getAssociatedTokenAddress,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	createMintToInstruction,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const Layout = () => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();
	const [balance, setBalance] = useState(0);
	const [txnSig, setTxnSig] = useState("");
	const [mintKey, setMintKey] = useState("");
	const [tokenAccount, setTokenAccount] = useState("");
	const [name, setName] = useState("");
	const [symbol, setSymbol] = useState("");
	const [uri, setUri] = useState("https://arweave.net/1234");

	useEffect(() => {
		const getInfo = () => {
			if (connection && publicKey) {
				connection.getAccountInfo(publicKey).then((info) => {
					setBalance(!info ? 0 : info.lamports / web3.LAMPORTS_PER_SOL);
				});
			} else {
				setBalance(0);
			}
		};
		getInfo();
	}, [connection, publicKey, balance]);

	const createMint = async () => {
		if (!connection || !publicKey) {
			return;
		}
		const mint: web3.Keypair = web3.Keypair.generate();
		const lamports: number = await getMinimumBalanceForRentExemptMint(
			connection
		);
		const transaction: web3.Transaction = new web3.Transaction();

		transaction.add(
			web3.SystemProgram.createAccount({
				fromPubkey: publicKey,
				newAccountPubkey: mint.publicKey,
				space: MINT_SIZE,
				lamports,
				programId: TOKEN_PROGRAM_ID,
			}),
			createInitializeMintInstruction(
				mint.publicKey,
				0,
				publicKey,
				publicKey,
				TOKEN_PROGRAM_ID
			)
		);

		sendTransaction(transaction, connection, {
			signers: [mint],
		}).then((sig) => {
			setTxnSig(sig);
			setMintKey(mint.publicKey.toString());
		});
	};

	const createTokenAccount = () => {
		if (!connection || !publicKey) {
			return;
		}

		const mint = new web3.PublicKey(mintKey);
		const transaction = new web3.Transaction();

		getAssociatedTokenAddress(
			mint,
			publicKey,
			false,
			TOKEN_PROGRAM_ID,
			ASSOCIATED_TOKEN_PROGRAM_ID
		).then((associatedToken) => {
			transaction.add(
				createAssociatedTokenAccountInstruction(
					publicKey,
					associatedToken,
					publicKey,
					mint,
					TOKEN_PROGRAM_ID,
					ASSOCIATED_TOKEN_PROGRAM_ID
				)
			);

			sendTransaction(transaction, connection).then((sig) => {
				setTokenAccount(associatedToken.toString());
			});
		});
	};

	const mintTokens = async (event: any) => {
		event.preventDefault();
		if (!connection || !publicKey) {
			return;
		}

		const mint = new web3.PublicKey(mintKey);
		const associatedTokenAccount = new web3.PublicKey(tokenAccount);
		const transaction = new web3.Transaction();
		const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
			"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
		);

		const metaData = {
			name: name,
			symbol: symbol,
			uri: uri,
			sellerFeeBasisPoints: 0,
			creators: null,
			collection: null,
			uses: null,
		};

		const metadataPDAAndBump = web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
		);

		const metadataPDA = metadataPDAAndBump[0];

		transaction.add(
			createCreateMetadataAccountV3Instruction(
				{
					metadata: metadataPDA,
					mint: mint,
					mintAuthority: publicKey,
					payer: publicKey,
					updateAuthority: publicKey,
				},
				{
					createMetadataAccountArgsV3: {
						collectionDetails: null,
						data: metaData,
						isMutable: true,
					},
				}
			)
		);

		transaction.add(
			createMintToInstruction(
				mint,
				associatedTokenAccount,
				publicKey,
				1000000000
			)
		);

		sendTransaction(transaction, connection).then((sig) => console.log(sig));
	};

	return (
		<>
			<h3>SOL Balance: {balance}</h3>
			<button onClick={createMint}>Create Token Mint</button>
			{mintKey !== "" && txnSig !== "" ? (
				<>
					{" "}
					<p>Token Mint: {mintKey} </p>
					<p>
						Txn Link:
						{`https://explorer.solana.com/tx/${txnSig}?cluster=devnet`}
					</p>
				</>
			) : null}
			<button onClick={createTokenAccount}>Create Token Account</button>
			{tokenAccount !== "" ? <p>Token Account: {tokenAccount}</p> : null}
			{tokenAccount !== "" && mintKey !== "" && txnSig !== "" ? (
				<form onSubmit={mintTokens}>
					<label>Token Name: </label>
					<input type="text" onChange={(e) => setName(e.target.value)} />
					<label>Token Symbol: </label>
					<input type="text" onChange={(e) => setSymbol(e.target.value)} />
					<label>Token Image URI: </label>
					<input
						type="text"
						onChange={(e) => setUri(e.target.value)}
						defaultValue="https://arweave.net/1234"
					/>
					<button type="submit">Mint 1,000,000,000 Tokens</button>
				</form>
			) : null}
		</>
	);
};

export default Layout;
