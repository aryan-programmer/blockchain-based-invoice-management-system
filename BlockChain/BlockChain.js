"use strict";
var BlockChain_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const freeze_1 = require("../freeze");
const Block_1 = tslib_1.__importDefault(require("./Block"));
let BlockChain = BlockChain_1 = class BlockChain {
    constructor() {
        this.chain = [Block_1.default.genesis()];
    }
    static isValid(chain) {
        const chainLen = chain.length;
        if (chainLen < 2)
            return false;
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block_1.default.genesis()))
            return false;
        for (let i = 1; i < chainLen; i++) {
            const lastBlock = chain[i - 1];
            const block = chain[i];
            if (block.lastHash !== lastBlock.hash)
                return false;
            if (Block_1.default.hashBlock(block) !== block.hash)
                return false;
        }
        return true;
    }
    addBlock(data) {
        const block = Block_1.default.mineBlock(this.chain[this.chain.length - 1], data);
        this.chain.push(block);
        return block;
    }
    replaceChain(chain) {
        if (this.chain.length >= chain.length)
            return false;
        if (!BlockChain_1.isValid(chain))
            return false;
        this.chain = chain;
        return true;
    }
};
BlockChain = BlockChain_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], BlockChain);
exports.default = BlockChain;
//# sourceMappingURL=BlockChain.js.map