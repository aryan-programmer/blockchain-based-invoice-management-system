"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const freeze_1 = require("../freeze");
const Invoice_1 = tslib_1.__importDefault(require("./Invoice"));
let InvoicePool = class InvoicePool {
    constructor() {
        this.invoices = [];
    }
    addInvoice(invoice) {
        if (this.invoices.find(value => value.invoice.invoiceNumber === invoice.invoice.invoiceNumber) == null && Invoice_1.default.verify(invoice)) {
            this.invoices.push(invoice);
        }
        return invoice;
    }
    getValidInvoices() {
        return this.invoices.filter(Invoice_1.default.verify);
    }
    clear() {
        this.invoices = [];
    }
    addInvoices(invoices) {
        for (const invoice of invoices) {
            this.addInvoice(invoice);
        }
    }
};
InvoicePool = tslib_1.__decorate([
    freeze_1.freezeClass
], InvoicePool);
exports.default = InvoicePool;
//# sourceMappingURL=InvoicePool.js.map