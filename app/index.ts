import express from "express";
import bodyParser from "body-parser";
import {program} from "commander";
import {Request, Response} from "express-serve-static-core";
import util from "util";
import {BlockChain} from "../BlockChain";
import P2PServer from "./P2PServer";

program
	.version("1.0.0", "-v, --version", "Show current version")
	.name("blockchain-based-invoice-management-system")
	.helpOption("-h, --help", "Show this help")
	.requiredOption("--port <number>", "The HTTP port on which to listen, must be more than 1000", parseInt)
	.requiredOption("--p2p-port <number>", "The port on which to listen for P2P connections, must be more than 1000", parseInt)
	.option("--peers <list>", "The peers to connect to, separated by commas, no spaces", (value) => value.split(","), [])
	.parse(process.argv);

let httpPort: number, p2pPort: number, peers: string[];
({port: httpPort, p2pPort, peers} = program);

function verifyNumber (val: number, optionName: string) {
	if(val == null || isNaN(val)) {
		console.error(`error: option '${optionName}' invalid argument`)
		process.exit(1);
	}
	if(val < 1000) {
		console.error(`error: option '${optionName}' must be more than 1000`)
		process.exit(1);
	}
}

verifyNumber(httpPort, "--port <number>");
verifyNumber(p2pPort, "--p2p-port <number>");

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
