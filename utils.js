"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const readline_1 = tslib_1.__importDefault(require("readline"));
const stream_1 = require("stream");
const util_1 = require("util");
const { v1: uuidV1 } = require('uuid');
exports.id = uuidV1;
crypto_1.default.generateKeyPair.__promisify__ = util_1.promisify(crypto_1.default.generateKeyPair);
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
// endregion Deep r/w only
// region ...Password prompt
const { stdout, stdin } = process;
const nullOut = new stream_1.Writable({
    write(chunk, encoding, callback) {
        callback();
    }
});
const passwordPromptReadlineInterface = readline_1.default.createInterface({
    input: stdin,
    output: nullOut,
    terminal: true,
});
function passwordPrompt(promptText) {
    return new Promise((resolve) => {
        stdout.write(promptText);
        passwordPromptReadlineInterface.question("", answer => {
            resolve(answer);
            stdout.write("\n");
        });
    });
}
exports.passwordPrompt = passwordPrompt;
// endregion password prompt
// region ...Key value pair
function createKeyValuePair(privateKeyPassPhrase) {
    return crypto_1.default.generateKeyPair.__promisify__('ec', {
        namedCurve: "secp521r1",
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes256',
            passphrase: privateKeyPassPhrase
        },
    });
}
exports.createKeyValuePair = createKeyValuePair;
// endregion Key value pair
// region ...Mining difficulty
exports.initialDifficulty = 5;
exports.minDifficulty = 2;
const mineRate = 1000;
function getNewDifficulty(currentDifficulty, mineStartTimestamp) {
    return Math.max(currentDifficulty + (mineStartTimestamp + mineRate > Date.now() ? +1 : -1), exports.minDifficulty);
}
exports.getNewDifficulty = getNewDifficulty;
// endregion Mining difficulty
//# sourceMappingURL=utils.js.map