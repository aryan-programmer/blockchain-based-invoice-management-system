"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function freeze(constructor) {
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
}
exports.default = freeze;
//# sourceMappingURL=freeze.js.map