"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const freeze_1 = require("../freeze");
const utils_1 = require("../utils");
let Miner = class Miner {
    constructor(wallet, p2p) {
        this.wallet = wallet;
        this.p2p = p2p;
    }
    mine() {
        if (this.p2p.pool.invoices.length === 0)
            return null;
        const ret = this.p2p.chain.addBlock(utils_1.deepFreeze(this.p2p.pool.getValidInvoices()));
        this.p2p.syncChains();
        this.p2p.pool.clear();
        this.p2p.broadcastClearInvoices();
        return ret;
    }
};
Miner = tslib_1.__decorate([
    freeze_1.freezeClass
], Miner);
exports.Miner = Miner;
//# sourceMappingURL=Miner.js.map