"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function frozen(constructor) {
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
}
exports.default = frozen;
//# sourceMappingURL=frozen.js.map