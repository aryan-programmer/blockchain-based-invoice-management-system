"use strict";
var Block_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const cloneDeep_1 = tslib_1.__importDefault(require("lodash/cloneDeep"));
const freeze_1 = require("../freeze");
const utils_1 = require("../utils");
let Block = Block_1 = class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.data = cloneDeep_1.default(data);
        // freezeDeep(this);
    }
    static genesis() {
        return new Block_1(Block_1.genesisTime, Block_1.genesisLastHash, Block_1.genesisHash, Block_1.genesisData, Block_1.genesisNonce, Block_1.genesisDifficulty);
    }
    static mineBlock(lastBlock, data) {
        const timestamp = Date.now();
        const timestampStr = timestamp.toString();
        const dataStr = JSON.stringify(data);
        let { hash: lastHash, difficulty } = lastBlock;
        if (difficulty === 0)
            difficulty = utils_1.initialDifficulty;
        let nonce;
        let hash;
        do {
            difficulty = utils_1.getNewDifficulty(lastBlock.difficulty, timestamp);
            nonce = crypto_1.default.randomBytes(64 /* 512bits/8 */).toString("hex");
            hash = Block_1.hash(timestampStr, lastHash, dataStr, nonce, difficulty);
        } while (!Block_1.doesHashStartWithNZeroes(hash, difficulty));
        return new Block_1(timestampStr, lastHash, hash, data, nonce, difficulty);
    }
    static doesHashStartWithNZeroes(hash, n) {
        for (let i = 0; i < n; i++) {
            if (hash[i] !== '0') {
                return false;
            }
        }
        return true;
    }
    static hashBlock(block) {
        return Block_1.hash(block.timestamp.toString(), block.lastHash, JSON.stringify(block.data), block.nonce, block.difficulty);
    }
    static hash(timestampAsString, lastHash, data, nonce, difficulty) {
        const hash = crypto_1.default.createHash('sha512');
        hash.write(timestampAsString);
        hash.write(lastHash);
        hash.write(data);
        hash.write(nonce);
        hash.write(difficulty.toString());
        return hash.digest('hex');
    }
    toString() {
        return JSON.stringify(this, null, 2);
    }
};
Block.genesisTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0).toString();
Block.genesisLastHash = crypto_1.default
    .createHash("sha512")
    .update("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746")
    .digest('hex');
Block.genesisData = utils_1.deepFreeze({
    invoiceNumber: "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214",
    products: [],
    totalCost: 0,
    __notARealInvoice: true
});
Block.genesisNonce = "";
Block.genesisDifficulty = 0;
Block.genesisHash = Block_1.hash(Block_1.genesisTime, Block_1.genesisLastHash, JSON.stringify(Block_1.genesisData), Block_1.genesisNonce, Block_1.genesisDifficulty);
Block = Block_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], Block);
exports.default = Block;
//# sourceMappingURL=Block.js.map