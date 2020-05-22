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
    SentDataType[SentDataType["InitInvoicePool"] = 2] = "InitInvoicePool";
    SentDataType[SentDataType["ClearInvoicePool"] = 3] = "ClearInvoicePool";
})(SentDataType || (SentDataType = {}));
let P2PServer = P2PServer_1 = class P2PServer {
    constructor(chain, pool) {
        this.chain = chain;
        this.pool = pool;
        this.sockets = [];
        Object.freeze(this);
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
                let relayToPeers = false;
                if (msg.type === SentDataType.Chain) {
                    const data = msg.value.map((value) => new BlockChain_1.Block(value.timestamp, value.lastHash, value.hash, value.data, value.nonce, value.difficulty));
                    relayToPeers = this.chain.replaceChain(data);
                }
                else if (msg.type === SentDataType.Invoice) {
                    relayToPeers = this.pool.addInvoice(new Wallet_1.Invoice(msg.value, true));
                }
                else if (msg.type === SentDataType.InitInvoicePool) {
                    if (this.pool.invoices.length === 0) {
                        const data = msg.value.map((value) => new Wallet_1.Invoice(value, true));
                        this.pool.invoices = data;
                        relayToPeers = true;
                    }
                }
                else if (msg.type === SentDataType.ClearInvoicePool) {
                    if (this.pool.invoices.length !== 0) {
                        this.pool.clear();
                        relayToPeers = true;
                    }
                }
                if (relayToPeers) {
                    for (const socket_ of this.sockets) {
                        if (socket === socket_)
                            continue;
                        socket_.send(message);
                    }
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
            type: SentDataType.InitInvoicePool,
            value: this.pool.invoices
        }));
    }
};
P2PServer.clearInvoicesMessage = JSON.stringify({ type: SentDataType.ClearInvoicePool });
P2PServer = P2PServer_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], P2PServer);
exports.default = P2PServer;
//# sourceMappingURL=P2PServer.js.map