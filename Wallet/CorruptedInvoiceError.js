"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const freeze_1 = require("../freeze");
let CorruptedInvoiceError = class CorruptedInvoiceError extends Error {
    constructor(message) {
        super(message);
        this.name = "CorruptedInvoiceError";
    }
};
CorruptedInvoiceError = tslib_1.__decorate([
    freeze_1.freezeClass
], CorruptedInvoiceError);
exports.default = CorruptedInvoiceError;
//# sourceMappingURL=CorruptedInvoiceError.js.map