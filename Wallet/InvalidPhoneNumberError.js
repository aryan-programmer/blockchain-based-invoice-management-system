"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const freeze_1 = require("../freeze");
let InvalidPhoneNumberError = class InvalidPhoneNumberError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidPhoneNumberError";
    }
};
InvalidPhoneNumberError = tslib_1.__decorate([
    freeze_1.freezeClass
], InvalidPhoneNumberError);
exports.default = InvalidPhoneNumberError;
//# sourceMappingURL=InvalidPhoneNumberError.js.map