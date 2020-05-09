"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const util_1 = tslib_1.__importDefault(require("util"));
const ws_1 = tslib_1.__importDefault(require("ws"));
const BlockChain_1 = require("../BlockChain");
const freeze_1 = tslib_1.__importDefault(require("../freeze"));
let P2PServer = class P2PServer {
    constructor(chain) {
        this.chain = chain;
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
    }
    sendChainTo(socket) {
        socket.send(JSON.stringify(this.chain.chain));
    }
    addMessageHandlerFor(socket) {
        socket.on("message", (message) => {
            if (typeof message === "string") {
                const data = JSON.parse(message).map((value) => new BlockChain_1.Block(value.timestamp, value.lastHash, value.hash, value.data));
                if (this.chain.replaceChain(data)) {
                    console.log("Replaced chain with: ", util_1.default.inspect(data, true, null, true));
                }
            }
        });
    }
};
P2PServer = tslib_1.__decorate([
    freeze_1.default
], P2PServer);
exports.default = P2PServer;
//# sourceMappingURL=P2PServer.js.map