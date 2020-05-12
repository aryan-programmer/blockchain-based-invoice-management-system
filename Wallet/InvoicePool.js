"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const freeze_1 = require("../freeze");
let InvoicePool = class InvoicePool {
    constructor() {
        this.invoices = [];
    }
    addInvoice(invoice) {
        if (this.invoices.find(value => value.invoice.invoiceNumber === invoice.invoice.invoiceNumber) == null) {
            this.invoices.push(invoice);
        }
        return invoice;
    }
};
InvoicePool = tslib_1.__decorate([
    freeze_1.freezeClass
], InvoicePool);
exports.default = InvoicePool;
//# sourceMappingURL=InvoicePool.js.map