"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const express_1 = tslib_1.__importDefault(require("express"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const util_1 = require("util");
const BlockChain_1 = require("../BlockChain");
const utils_1 = require("../utils");
const Wallet_1 = require("../Wallet");
const P2PServer_1 = tslib_1.__importDefault(require("./P2PServer"));
fs_1.default.readFile.__promisify__ = util_1.promisify(fs_1.default.readFile);
function default_1(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let httpPort, p2pPort, peers, passphrase, publicKeyFilePath, privateKeyFilePath;
        ({ port: httpPort, p2pPort, peers, passphrase, publicKeyFilePath, privateKeyFilePath } = args);
        function verifyNumber(val, optionName) {
            if (val == null || isNaN(val)) {
                console.error(`error: option '${optionName}' invalid argument`);
                process.exit(1);
            }
            else if (val < 1000) {
                console.error(`error: option '${optionName}' must be more than 1000`);
                process.exit(1);
            }
        }
        verifyNumber(httpPort, "--port <number>");
        verifyNumber(p2pPort, "--p2p-port <number>");
        while (passphrase == null || passphrase === "") {
            passphrase = yield utils_1.passwordPrompt("Please enter a passphrase to encrypt the private key:");
        }
        const publicKeyTextPromise = fs_1.default.readFile.__promisify__(publicKeyFilePath);
        const privateKeyTextPromise = fs_1.default.readFile.__promisify__(privateKeyFilePath);
        const publicKey = crypto_1.default.createPublicKey({
            key: yield publicKeyTextPromise,
            format: "pem",
        });
        const privateKey = crypto_1.default.createPrivateKey({
            key: yield privateKeyTextPromise,
            format: "pem",
            passphrase
        });
        const app = express_1.default();
        const chain = new BlockChain_1.BlockChain();
        const wallet = new Wallet_1.Wallet(publicKey, privateKey);
        const pool = new Wallet_1.InvoicePool();
        const p2pServer = new P2PServer_1.default(chain, pool);
        app.use(body_parser_1.default.json());
        app.get('/invoices', (req, res) => {
            res.json(chain.chain);
        });
        app.get('/pendingInvoices', (req, res) => {
            res.json(pool.invoices);
        });
        app.get('/publicKey', (req, res) => {
            res.send(wallet.publicKeyPem);
        });
        app.post('/mine', (req, res) => {
            chain.addBlock(req.body.data);
            p2pServer.syncChains();
            res.redirect("/invoices");
        });
        app.post('/addInvoice', (req, res) => {
            p2pServer.broadcastInvoice(wallet.addInvoiceToPool(pool, req.body.data));
            res.redirect("/pendingInvoices");
        });
        app.listen(httpPort, () => {
            console.log(`Listening on port ${httpPort}`);
        });
        p2pServer.listen(p2pPort, peers);
    });
}
exports.default = default_1;
//# sourceMappingURL=p2p.js.map