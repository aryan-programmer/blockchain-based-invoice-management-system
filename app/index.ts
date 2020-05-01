import express from "express";
import bodyParser from "body-parser";
import {program} from "commander";
import {Request, Response} from "express-serve-static-core";
import util from "util";
import {BlockChain} from "../BlockChain";

program
	.version("1.0.0", "-v, --version", "Show current version")
	.name("blockchain-based-invoice-management-system")
	.helpOption("-h, --help", "Show this help")
	.requiredOption("-p, --port <number>", "The HTTP port on which to listen, must be more than 1000", parseInt)
	.parse(process.argv);

const {port: HTTP_PORT} = program;

if(HTTP_PORT == null || isNaN(HTTP_PORT)) {
	console.error("error: option '-p, --port <number>' invalid argument")
	process.exit(1);
}
if(HTTP_PORT < 1000) {
	console.error("error: option '-p, --port <number>' must be more than 1000")
	process.exit(1);
}

const app = express();
const chain = new BlockChain();

app.use(bodyParser.json());

app.get('/invoices', (req: Request, res: Response) => {
	res.json(chain.chain);
});

app.post('/mine', (req: Request, res: Response) => {
	const block = chain.addBlock(req.body.data);
	console.log("Block added: ", util.inspect(block, true, null, true));
	res.redirect("/invoices");
})

app.listen(HTTP_PORT, () => {
	console.log(`Listening on port ${HTTP_PORT}`);
});
