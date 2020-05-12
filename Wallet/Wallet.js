"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const freeze_1 = require("../freeze");
let Wallet = class Wallet {
    constructor(publicKey, privateKey) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicKeyPem = publicKey.export({ format: "pem", type: "spki" }).toString();
        Object.freeze(this);
    }
    sign(...args) {
        const signer = crypto_1.default.createSign("sha512");
        for (const arg of args) {
            signer.update(arg);
        }
        return signer.sign(this.privateKey, "hex");
    }
};
Wallet = tslib_1.__decorate([
    freeze_1.freezeClass
], Wallet);
exports.default = Wallet;
//# sourceMappingURL=Wallet.js.map