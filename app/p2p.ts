import bodyParser from "body-parser";
import express from "express";
import {Request, Response} from "express-serve-static-core";
import fs from "fs";
import util, {promisify} from "util";
import crypto from "crypto";
import {BlockChain} from "../BlockChain";
import {passwordPrompt} from "../utils";
import P2PServer from "./P2PServer";

fs.readFile.__promisify__ = promisify(fs.readFile);

export default async function (args: any): Promise<void> {
	let httpPort: number,
		p2pPort: number,
		peers: string[],
		passphrase: string,
		publicKeyFilePath: string,
		privateKeyFilePath: string;
	({port: httpPort, p2pPort, peers, passphrase, publicKeyFilePath, privateKeyFilePath} = args);

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

	while (passphrase == null || passphrase === "") {
		passphrase = await passwordPrompt("Please enter a passphrase to encrypt the private key:")
	}

	const publicKeyTextPromise = fs.readFile.__promisify__(publicKeyFilePath);
	const privateKeyTextPromise = fs.readFile.__promisify__(privateKeyFilePath);

	const publicKey = crypto.createPublicKey({
		key: await publicKeyTextPromise,
		format: "pem",
	});
	const privateKey = crypto.createPrivateKey({
		key: await privateKeyTextPromise,
		format: "pem",
		passphrase
	});

	const app = express();
	const chain = new BlockChain();
	const p2pServer = new P2PServer(chain);

	app.use(bodyParser.json());

	app.get('/invoices', (req: Request, res: Response) => {
		res.json(chain.chain);
	});

	app.post('/mine', (req: Request, res: Response) => {
		const block = chain.addBlock(req.body.data);
		console.log("Block added: ", util.inspect(block, true, null, true));
		p2pServer.syncChains();
		res.redirect("/invoices");
	})

	app.listen(httpPort, () => {
		console.log(`Listening on port ${httpPort}`);
	});

	p2pServer.listen(p2pPort, peers);
}
