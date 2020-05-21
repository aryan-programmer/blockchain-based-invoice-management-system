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
            const invoice_ = cloneDeep_1.default(a);
            this.invoice = invoice_.invoice;
            this.timestamp = invoice_.timestamp;
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
            this.timestamp = Date.now().toString();
            this.signature = b.sign(JSON.stringify(invoice_), this.timestamp, b.publicKeyPem);
            this.publicKey = b.publicKeyPem;
        }
        utils_1.deepFreeze(this);
    }
    static verifySignature(publicKey, invoice) {
        const verifier = crypto_1.default.createVerify("sha512");
        verifier.update(JSON.stringify(invoice.invoice));
        verifier.update(invoice.timestamp);
        verifier.update(invoice.publicKey);
        return verifier.verify(publicKey, invoice.signature, "hex");
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
    static verify(invoice) {
        return Invoice_1.verifyTotal(invoice.invoice) && Invoice_1.verifySignature(invoice.publicKey, invoice);
    }
};
Invoice = Invoice_1 = tslib_1.__decorate([
    freeze_1.freezeClass
], Invoice);
exports.default = Invoice;
//# sourceMappingURL=Invoice.js.map