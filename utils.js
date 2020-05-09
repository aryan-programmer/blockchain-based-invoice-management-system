"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deepFreeze(object) {
    let propNames = Object.getOwnPropertyNames(object);
    for (let name of propNames) {
        let value = object[name];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;
exports.initialDifficulty = 5;
exports.minDifficulty = 2;
const mineRate = 1000;
function getNewDifficulty(currentDifficulty, mineStartTimestamp) {
    return Math.max(currentDifficulty + (mineStartTimestamp + mineRate > Date.now() ? +1 : -1), exports.minDifficulty);
}
exports.getNewDifficulty = getNewDifficulty;
//# sourceMappingURL=utils.js.map