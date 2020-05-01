"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const commander_1 = require("commander");
const util_1 = tslib_1.__importDefault(require("util"));
const BlockChain_1 = require("../BlockChain");
commander_1.program
    .version("1.0.0", "-v, --version", "Show current version")
    .name("blockchain-based-invoice-management-system")
    .helpOption("-h, --help", "Show this help")
    .requiredOption("-p, --port <number>", "The HTTP port on which to listen, must be more than 1000", parseInt)
    .parse(process.argv);
const { port: HTTP_PORT } = commander_1.program;
if (HTTP_PORT == null || isNaN(HTTP_PORT)) {
    console.error("error: option '-p, --port <number>' invalid argument");
    process.exit(1);
}
if (HTTP_PORT < 1000) {
    console.error("error: option '-p, --port <number>' must be more than 1000");
    process.exit(1);
}
const app = express_1.default();
const chain = new BlockChain_1.BlockChain();
app.use(body_parser_1.default.json());
app.get('/invoices', (req, res) => {
    res.json(chain.chain);
});
app.post('/mine', (req, res) => {
    const block = chain.addBlock(req.body.data);
    console.log("Block added: ", util_1.default.inspect(block, true, null, true));
    res.redirect("/invoices");
});
app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});
//# sourceMappingURL=index.js.map