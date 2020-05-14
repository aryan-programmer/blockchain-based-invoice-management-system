"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const util_1 = require("util");
const utils_1 = require("../utils");
fs_1.default.writeFile.__promisify__ = util_1.promisify(fs_1.default.writeFile);
async function default_1(args) {
    let password, publicKeyFilePath, privateKeyFilePath;
    ({ password, publicKeyFilePath, privateKeyFilePath } = args);
    while (password == null || password === "") {
        password = await utils_1.passwordPrompt("Please enter a passphrase to encrypt the private key:");
    }
    const keys = await utils_1.createKeyValuePair(password);
    const publicKeyWrite = fs_1.default.writeFile.__promisify__(publicKeyFilePath, keys.publicKey);
    const privateKeyWrite = fs_1.default.writeFile.__promisify__(privateKeyFilePath, keys.privateKey);
    await publicKeyWrite;
    await privateKeyWrite;
    return;
}
exports.default = default_1;
//# sourceMappingURL=gen-keys.js.map