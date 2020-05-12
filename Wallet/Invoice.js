"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const cloneDeep_1 = tslib_1.__importDefault(require("lodash/cloneDeep"));
const freeze_1 = require("../freeze");
const utils_1 = require("../utils");
function roundTo2Decimals(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
let Invoice = class Invoice {
    constructor(invoice, wallet) {
        if (wallet === true) {
            const invoice_ = invoice;
            this.invoice = invoice_.invoice;
            this.signature = invoice_.signature;
            this.publicKey = invoice_.publicKey;
        }
        else {
            const invoice_ = cloneDeep_1.default(invoice);
            let totalCost = 0;
            for (const product of invoice_.products) {
                product.cost = roundTo2Decimals(product.cost);
                product.tax = roundTo2Decimals(product.cost * product.taxPercentage / 100);
                product.totalCost = roundTo2Decimals(product.cost + product.tax);
                totalCost += product.totalCost;
            }
            invoice_.totalCost = roundTo2Decimals(totalCost);
            this.invoice = invoice_;
            this.signature = wallet.sign(JSON.stringify(invoice_), wallet.publicKeyPem);
            this.publicKey = wallet.publicKeyPem;
        }
        utils_1.deepFreeze(this);
    }
    static verify(publicKey, invoice, signature) {
        const verifier = crypto_1.default.createVerify("sha512");
        verifier.update(JSON.stringify(invoice));
        verifier.update(publicKey);
        return verifier.verify(publicKey, signature, "hex");
    }
};
Invoice = tslib_1.__decorate([
    freeze_1.freezeClass
], Invoice);
exports.default = Invoice;
//# sourceMappingURL=Invoice.js.map