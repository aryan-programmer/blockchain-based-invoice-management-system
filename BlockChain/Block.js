"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = require("crypto-js");
class Block {
    constructor(timestamp, lastHash, hash, data) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        Object.defineProperties(this, {
            timestamp: {
                value: timestamp,
                writable: false,
                configurable: false
            },
            lastHash: {
                value: lastHash,
                writable: false,
                configurable: false
            },
            hash: {
                value: hash,
                writable: false,
                configurable: false
            },
            data: {
                value: data,
                writable: false,
                configurable: false
            },
        });
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
        return new Block(Block.genesisTime, Block.genesisLastHash, Block.genesisHash, Block.genesisData);
    }
    static mineBlock(lastBlock, data) {
        const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        const hash = Block.hash(timestamp, lastHash, data);
        return new Block(timestamp, lastHash, hash, data);
    }
    static hash(timestamp, lastHash, data) {
        return crypto_js_1.SHA512(`T${timestamp} H${lastHash} D${data}`).toString();
    }
}
exports.default = Block;
Block.genesisTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0);
Block.genesisLastHash = crypto_js_1.SHA512("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746").toString();
Block.genesisData = "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214";
Block.genesisHash = Block.hash(Block.genesisTime, Block.genesisLastHash, Block.genesisData);
//# sourceMappingURL=Block.js.map