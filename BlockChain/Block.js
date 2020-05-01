"use strict";
var Block_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_js_1 = require("crypto-js");
const frozen_1 = tslib_1.__importDefault(require("../frozen"));
let Block = Block_1 = class Block {
    constructor(timestamp, lastHash, hash, data) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        Object.freeze(this);
    }
    toString() {
        return `Block {
	Timestamp : ${this.timestamp},
	Last Hash : ${this.lastHash},
	Hash      : ${this.hash},
	Data      : ${this.data},
}`;
    }
    static genesis() {
        return new Block_1(Block_1.genesisTime, Block_1.genesisLastHash, Block_1.genesisHash, Block_1.genesisData);
    }
    static mineBlock(lastBlock, data) {
        const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        const hash = Block_1.hash(timestamp, lastHash, data);
        return new Block_1(timestamp, lastHash, hash, data);
    }
    static hashBlock(block) {
        return Block_1.hash(block.timestamp, block.lastHash, block.data);
    }
    static hash(timestamp, lastHash, data) {
        return crypto_js_1.SHA512(`T${timestamp} H${lastHash} D${data}`).toString();
    }
};
Block.genesisTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0);
Block.genesisLastHash = crypto_js_1.SHA512("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746").toString();
Block.genesisData = "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214";
Block.genesisHash = Block_1.hash(Block_1.genesisTime, Block_1.genesisLastHash, Block_1.genesisData);
Block = Block_1 = tslib_1.__decorate([
    frozen_1.default
], Block);
exports.default = Block;
//# sourceMappingURL=Block.js.map