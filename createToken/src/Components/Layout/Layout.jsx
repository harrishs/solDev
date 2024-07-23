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
} from "@solana/spl-token";

const Layout = (props) => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();
	const [balance, setBalance] = useState(0);
	const [txnSig, setTxnSig] = useState("");
	const [mintKey, setMintKey] = useState("");
	const [tokenAccount, setTokenAccount] = useState("");

	useEffect(() => {
		const getInfo = () => {
			if (connection && publicKey) {
				connection.getAccountInfo(publicKey).then((info) => {
					setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
				});
			} else {
				setBalance(null);
			}
		};
		getInfo();
	}, [connection, publicKey, balance]);

	const createMint = async () => {
		if (!connection || !publicKey) {
			return;
		}
		const mint = web3.Keypair.generate();
		const lamports = await getMinimumBalanceForRentExemptMint(connection);
		const transaction = new web3.Transaction();

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
		</>
	);
};

export default Layout;
