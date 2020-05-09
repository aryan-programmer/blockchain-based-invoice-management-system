"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const commander_1 = require("commander");
const util_1 = tslib_1.__importDefault(require("util"));
const BlockChain_1 = require("../BlockChain");
const P2PServer_1 = tslib_1.__importDefault(require("./P2PServer"));
commander_1.program
    .version("1.0.0", "-v, --version", "Show current version")
    .name("blockchain-based-invoice-management-system")
    .helpOption("-h, --help", "Show this help")
    .requiredOption("--port <number>", "The HTTP port on which to listen, must be more than 1000", parseInt)
    .requiredOption("--p2p-port <number>", "The port on which to listen for P2P connections, must be more than 1000", parseInt)
    .option("--peers <list>", "The peers to connect to, separated by commas, no spaces", (value) => value.split(","), [])
    .parse(process.argv);
let httpPort, p2pPort, peers;
({ port: httpPort, p2pPort, peers } = commander_1.program);
function verifyNumber(val, optionName) {
    if (val == null || isNaN(val)) {
        console.error(`error: option '${optionName}' invalid argument`);
        process.exit(1);
    }
    if (val < 1000) {
        console.error(`error: option '${optionName}' must be more than 1000`);
        process.exit(1);
    }
}
verifyNumber(httpPort, "--port <number>");
verifyNumber(p2pPort, "--p2p-port <number>");
const app = express_1.default();
const chain = new BlockChain_1.BlockChain();
const p2pServer = new P2PServer_1.default(chain);
app.use(body_parser_1.default.json());
app.get('/invoices', (req, res) => {
    res.json(chain.chain);
});
app.post('/mine', (req, res) => {
    const block = chain.addBlock(req.body.data);
    console.log("Block added: ", util_1.default.inspect(block, true, null, true));
    p2pServer.syncChains();
    res.redirect("/invoices");
});
app.listen(httpPort, () => {
    console.log(`Listening on port ${httpPort}`);
});
p2pServer.listen(p2pPort, peers);
//# sourceMappingURL=index.js.map