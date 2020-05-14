"use strict";
var Invoice_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const cloneDeep_1 = tslib_1.__importDefault(require("lodash/cloneDeep"));
const freeze_1 = require("../freeze");
const utils_1 = require("../utils");
function roundTo2Decimals(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
let Invoice = Invoice_1 = class Invoice {
    constructor(a, b) {
        if (b === true) {
            const invoice_ = a;
            this.invoice = invoice_.invoice;
            this.signature = invoice_.signature;
            this.publicKey = invoice_.publicKey;
        }
        else {
            const invoice_ = cloneDeep_1.default(a);
            let totalCost = 0;
            for (const product of invoice_.products) {
                product.cost = roundTo2Decimals(product.cost);
                product.tax = roundTo2Decimals(product.cost * product.taxPercentage / 100);
                product.totalCost = roundTo2Decimals(product.cost + product.tax);
                totalCost += product.totalCost;
            }
            invoice_.totalCost = roundTo2Decimals(totalCost);
            this.invoice = invoice_;
            this.signature = b.sign(JSON.stringify(invoice_), b.publicKeyPem);
            this.publicKey = b.publicKeyPem;
        }
        utils_1.deepFreeze(this);
    }
    static verifySignature(publicKey, invoice, signature) {
        const verifier = crypto_1.default.createVerify("sha512");
        verifier.update(JSON.stringify(invoice));
        verifier.update(publicKey);
        return verifier.verify(publicKey, signature, "hex");
    }
    static verifyTotal(invoice) {
        let totalCost = 0;
        for (const product of invoice.products) {
            if (product.tax !== roundTo2Decimals(product.cost * product.taxPercentage / 100))
                return false;
            if (product.totalCost !== roundTo2Decimals(product.cost + product.tax))
                return false;
            totalCost += product.totalCost;
        }
        if (invoice.totalCost !== roundTo2Decimals(totalCost))
            return false;
        // noinspection RedundantIfStatementJS
        if (invoice.totalCost !== roundTo2Decimals(totalCost))
            return false;
        return true;
    }
    static verify({ publicKey, invoice, signature }) {
        return Invoice_1.verifyTotal(invoice) && Invoice_1.verifySignature(publicKey, invoice, signature);
    }
};
Invoice = Invoice_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], Invoice);
exports.default = Invoice;
//# sourceMappingURL=Invoice.js.map