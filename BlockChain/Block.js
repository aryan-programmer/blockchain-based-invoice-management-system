"use strict";
var Block_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const cloneDeep_1 = tslib_1.__importDefault(require("lodash/cloneDeep"));
const freeze_1 = require("../freeze");
const utils_1 = require("../utils");
const Wallet_1 = require("../Wallet");
let Block = Block_1 = class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.data = cloneDeep_1.default(data);
        utils_1.deepFreeze(this);
    }
    static genesis() {
        return new Block_1(Block_1.genesisTime, Block_1.genesisLastHash, Block_1.genesisHash, [new Wallet_1.Invoice(Block_1.genesisData[0], true)], Block_1.genesisNonce, Block_1.genesisDifficulty);
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
Block.genesisData = [new Wallet_1.Invoice({
        invoice: {
            invoiceNumber: '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214',
            products: [],
            purchaser: {
                isVendor: false,
                name: 'Nil McNull',
                phoneNumber: '000-000-0000'
            },
            totalCost: 0
        },
        timestamp: '1590049621714',
        signature: '3081880242014d75a20cfaa8704bbcd38cc2099422c2c747cbbebbc569e5c95b189abd424dece2d60671d4e268713c6215b3c06046d120d1bb1c77f37307101d82f78ecf0e2cea024201a5a6fddfd72166c16754247c7faae693ac2e1e0dde9778d27cde439766619a714a63710806c8eb0aaeadf2ab7b8ad8f8219a3bf24db0d59c5cd12618b57006b1af',
        publicKey: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAlX7/En80E/8KR3VMFvhiox9bUsnL
VFOJN+Trs0jwa+rhBZfkXLgAvcdoFx3RYEfJdN7rXv1NGk0AIDSa4gdHq8wAGXH3
oSvIRr7xLCz+ITF0Br6Kt1MJE9SloHT5auaDNdm4IguGaigjsAnMUUludmNpY31t
LCSEXNPaUaC3cmEiCZI=
-----END PUBLIC KEY-----
`
    }, true)];
Block.genesisNonce = "e81a8ce9de16123cd50989e0d4c7be338e24b4624bac88dd02452bcb0555a46230307cd625c0baafee9df74a9321a34541420c95a7c37d21caff2568b40ef7a0";
Block.genesisDifficulty = 0;
Block.genesisHash = Block_1.hash(Block_1.genesisTime, Block_1.genesisLastHash, JSON.stringify(Block_1.genesisData), Block_1.genesisNonce, Block_1.genesisDifficulty);
Block = Block_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], Block);
exports.default = Block;
//# sourceMappingURL=Block.js.map