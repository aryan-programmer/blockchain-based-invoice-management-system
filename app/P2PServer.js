"use strict";
var P2PServer_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ws_1 = tslib_1.__importDefault(require("ws"));
const BlockChain_1 = require("../BlockChain");
const freeze_1 = require("../freeze");
const Wallet_1 = require("../Wallet");
var SentDataType;
(function (SentDataType) {
    SentDataType[SentDataType["Chain"] = 0] = "Chain";
    SentDataType[SentDataType["Invoice"] = 1] = "Invoice";
    SentDataType[SentDataType["Invoices"] = 2] = "Invoices";
    SentDataType[SentDataType["ClearInvoices"] = 3] = "ClearInvoices";
})(SentDataType || (SentDataType = {}));
let P2PServer = P2PServer_1 = class P2PServer {
    constructor(chain, pool) {
        this.chain = chain;
        this.pool = pool;
        this.sockets = [];
        Object.freeze(this);
    }
    listen(p2pPort, peers) {
        const server = new ws_1.default.Server({ port: p2pPort });
        server.on("connection", socket => this.connectSocket(socket));
        this.connectToPeers(peers);
        console.log(`Listening for P2P connections on port ${p2pPort}`);
    }
    syncChains() {
        for (const socket of this.sockets) {
            this.sendChainTo(socket);
        }
    }
    broadcastInvoice(invoice) {
        for (const socket of this.sockets) {
            P2PServer_1.sendInvoiceTo(socket, invoice);
        }
    }
    broadcastClearInvoices() {
        for (const socket of this.sockets) {
            P2PServer_1.sendClearInvoicesTo(socket);
        }
    }
    connectToPeers(peers) {
        for (const peer of peers) {
            const socket = new ws_1.default(peer);
            socket.on("open", () => this.connectSocket(socket));
        }
    }
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log(`Connected to socket`);
        this.addMessageHandlerFor(socket);
        this.sendChainTo(socket);
        this.sendInvoicesTo(socket);
    }
    addMessageHandlerFor(socket) {
        socket.on("message", (message) => {
            if (typeof message === "string") {
                const msg = JSON.parse(message);
                if (msg.type === SentDataType.Chain) {
                    const data = msg.value.map((value) => new BlockChain_1.Block(value.timestamp, value.lastHash, value.hash, value.data, value.nonce, value.difficulty));
                    this.chain.replaceChain(data);
                }
                else if (msg.type === SentDataType.Invoice) {
                    this.pool.addInvoice(new Wallet_1.Invoice(msg.value, true));
                }
                else if (msg.type === SentDataType.Invoices) {
                    const data = msg.value.map((value) => new Wallet_1.Invoice(value, true));
                    this.pool.addInvoices(data);
                }
                else if (msg.type === SentDataType.ClearInvoices) {
                    this.pool.clear();
                }
            }
        });
    }
    // region ...Send to socket
    sendChainTo(socket) {
        socket.send(JSON.stringify({
            type: SentDataType.Chain,
            value: this.chain.chain
        }));
    }
    sendInvoicesTo(socket) {
        socket.send(JSON.stringify({
            type: SentDataType.Invoices,
            value: this.pool.invoices
        }));
    }
    static sendInvoiceTo(socket, invoice) {
        socket.send(JSON.stringify({
            type: SentDataType.Invoice,
            value: invoice
        }));
    }
    static sendClearInvoicesTo(socket) {
        socket.send(P2PServer_1.clearInvoicesMessage);
    }
};
P2PServer.clearInvoicesMessage = JSON.stringify({ type: SentDataType.ClearInvoices });
P2PServer = P2PServer_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], P2PServer);
exports.default = P2PServer;
//# sourceMappingURL=P2PServer.js.map