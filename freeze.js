"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function freezeClass(constructor) {
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
}
exports.freezeClass = freezeClass;
//# sourceMappingURL=freeze.js.map