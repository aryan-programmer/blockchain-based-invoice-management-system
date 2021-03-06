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
const InvalidPhoneNumberError_1 = tslib_1.__importDefault(require("../Wallet/InvalidPhoneNumberError"));
const Miner_1 = require("./Miner");
const P2PServer_1 = tslib_1.__importDefault(require("./P2PServer"));
fs_1.default.readFile.__promisify__ = util_1.promisify(fs_1.default.readFile);
const localhosts = ['localhost', '127.0.0.1', '::1', '::ffff:127.0.0.1'];
function localhostOnly(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || "not at all localhost";
    if (!localhosts.includes(ip)) {
        res.sendStatus(401);
        return;
    }
    next();
}
async function default_1(args) {
    let httpPort, p2pPort, peers, password, publicKeyFilePath, privateKeyFilePath;
    ({ port: httpPort, p2pPort, peers, password, publicKeyFilePath, privateKeyFilePath } = args);
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
    while (password == null || password === "") {
        password = await utils_1.passwordPrompt("Please enter a passphrase to encrypt the private key:");
    }
    const publicKeyTextPromise = fs_1.default.readFile.__promisify__(publicKeyFilePath);
    const privateKeyTextPromise = fs_1.default.readFile.__promisify__(privateKeyFilePath);
    const publicKey = crypto_1.default.createPublicKey({
        key: await publicKeyTextPromise,
        format: "pem",
    });
    const privateKey = crypto_1.default.createPrivateKey({
        key: await privateKeyTextPromise,
        format: "pem",
        passphrase: password
    });
    const app = express_1.default();
    const chain = new BlockChain_1.BlockChain();
    const wallet = new Wallet_1.Wallet(publicKey, privateKey);
    const pool = new Wallet_1.InvoicePool();
    const p2p = new P2PServer_1.default(chain, pool);
    const miner = new Miner_1.Miner(wallet, p2p);
    app.use(body_parser_1.default.json());
    app.get('/blocks', (req, res) => {
        res.json(chain.chain);
    });
    app.get('/pendingInvoices', (req, res) => {
        res.json(pool.invoices);
    });
    app.get('/publicKey', (req, res) => {
        res.send(wallet.publicKeyPem);
    });
    app.post('/mine', localhostOnly, (req, res) => {
        miner.mine();
        res.redirect("/blocks");
    });
    app.post('/addInvoice', localhostOnly, (req, res) => {
        try {
            p2p.broadcastInvoice(wallet.addInvoiceToPool(pool, req.body.data));
            res.redirect("/pendingInvoices");
        }
        catch (e) {
            if (e instanceof InvalidPhoneNumberError_1.default) {
                res.send("Invalid Phone Number");
            }
            else {
                throw e;
            }
        }
    });
    app.listen(httpPort, () => {
        console.log(`Listening on port ${httpPort}`);
    });
    p2p.listen(p2pPort, peers);
}
exports.default = default_1;
//# sourceMappingURL=p2p.js.map