import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import {
	MINT_SIZE,
	TOKEN_PROGRAM_ID,
	getMinimumBalanceForRentExemptMint,
	createInitializeMintInstruction,
} from "@solana/spl-token";

const Layout = (props) => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();
	const [balance, setBalance] = useState(0);
	const [txnSig, setTxnSig] = useState("");
	const [mint, setMint] = useState("");

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
			setMint(mint.publicKey.toString());
		});
	};

	return (
		<>
			<h3>SOL Balance: {balance}</h3>
			<button onClick={createMint}>Create Token Mint</button>
			{mint !== "" && txnSig !== "" ? (
				<p>
					Token Mint: {mint}
					<n></n>Txn Link:{" "}
					{`https://explorer.solana.com/tx/${txnSig}?cluster=devnet`}
				</p>
			) : null}
		</>
	);
};

export default Layout;
