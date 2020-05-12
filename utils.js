"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const readline_1 = tslib_1.__importDefault(require("readline"));
const stream_1 = require("stream");
const util_1 = require("util");
crypto_1.default.generateKeyPair.__promisify__ = util_1.promisify(crypto_1.default.generateKeyPair);
// The NPM uuid package fails with an:
// Error: No valid exports main found for '<path-to-project>\node_modules\uuid'
// region ...UUID V4 with default parameters only
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
}
function bytesToUuid(buf) {
    return [
        byteToHex[buf[0]],
        byteToHex[buf[1]],
        byteToHex[buf[2]],
        byteToHex[buf[3]], '-',
        byteToHex[buf[4]],
        byteToHex[buf[5]], '-',
        byteToHex[buf[6]],
        byteToHex[buf[7]], '-',
        byteToHex[buf[8]],
        byteToHex[buf[9]], '-',
        byteToHex[buf[10]],
        byteToHex[buf[11]],
        byteToHex[buf[12]],
        byteToHex[buf[13]],
        byteToHex[buf[14]],
        byteToHex[buf[15]]
    ].join('');
}
function id() {
    let i = 0;
    const rnds = crypto_1.default.randomBytes(16); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided
    return bytesToUuid(rnds);
}
exports.id = id;
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
deepFreeze(module.exports);
//# sourceMappingURL=utils.js.map