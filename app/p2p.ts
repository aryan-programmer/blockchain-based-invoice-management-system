import bodyParser from "body-parser";
import crypto from "crypto";
import express from "express";
import {Request, Response} from "express-serve-static-core";
import fs from "fs";
import {promisify} from "util";
import {BlockChain} from "../BlockChain";
import {passwordPrompt} from "../utils";
import {InvoicePool, Wallet} from "../Wallet";
import InvalidPhoneNumberError from "../Wallet/InvalidPhoneNumberError";
import {Miner} from "./Miner";
import P2PServer from "./P2PServer";

fs.readFile.__promisify__ = promisify(fs.readFile);

export default async function (args: any): Promise<void> {
	let httpPort: number,
	    p2pPort: number,
	    peers: string[],
	    password: string,
	    publicKeyFilePath: string,
	    privateKeyFilePath: string;
	({port: httpPort, p2pPort, peers, password, publicKeyFilePath, privateKeyFilePath} = args);

	function verifyNumber (val: number, optionName: string) {
		if (val == null || isNaN(val)) {
			console.error(`error: option '${optionName}' invalid argument`);
			process.exit(1);
		} else if (val < 1000) {
			console.error(`error: option '${optionName}' must be more than 1000`);
			process.exit(1);
		}
	}

	verifyNumber(httpPort, "--port <number>");
	verifyNumber(p2pPort, "--p2p-port <number>");

	while (password == null || password === "") {
		password = await passwordPrompt("Please enter a passphrase to encrypt the private key:")
	}

	const publicKeyTextPromise  = fs.readFile.__promisify__(publicKeyFilePath);
	const privateKeyTextPromise = fs.readFile.__promisify__(privateKeyFilePath);

	const publicKey  = crypto.createPublicKey({
		key: await publicKeyTextPromise,
		format: "pem",
	});
	const privateKey = crypto.createPrivateKey({
		key: await privateKeyTextPromise,
		format: "pem",
		passphrase: password
	});

	const app    = express();
	const chain  = new BlockChain();
	const wallet = new Wallet(publicKey, privateKey);
	const pool   = new InvoicePool();
	const p2p    = new P2PServer(chain, pool);
	const miner  = new Miner(wallet, p2p);

	app.use(bodyParser.json());

	app.get('/blocks', (req: Request, res: Response) => {
		res.json(chain.chain);
	});

	app.get('/pendingInvoices', (req: Request, res: Response) => {
		res.json(pool.invoices);
	});

	app.get('/publicKey', (req: Request, res: Response) => {
		res.send(wallet.publicKeyPem);
	});

	app.post('/mine', (req: Request, res: Response) => {
		miner.mine();
		res.redirect("/blocks");
	});

	app.post('/addInvoice', (req: Request, res: Response) => {
		try {
			p2p.broadcastInvoice(wallet.addInvoiceToPool(pool, req.body.data));
			res.redirect("/pendingInvoices");
		} catch (e) {
			if (e instanceof InvalidPhoneNumberError) {
				res.send("Invalid Phone Number");
			} else {
				throw e;
			}
		}
	});

	app.listen(httpPort, () => {
		console.log(`Listening on port ${httpPort}`);
	});

	p2p.listen(p2pPort, peers);
}
