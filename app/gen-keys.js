"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const util_1 = require("util");
const utils_1 = require("../utils");
const fs_1 = tslib_1.__importDefault(require("fs"));
fs_1.default.writeFile.__promisify__ = util_1.promisify(fs_1.default.writeFile);
function default_1(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let passphrase, publicKeyFilePath, privateKeyFilePath;
        ({ passphrase, publicKeyFilePath, privateKeyFilePath } = args);
        while (passphrase == null || passphrase === "") {
            passphrase = yield utils_1.passwordPrompt("Please enter a passphrase to encrypt the private key:");
        }
        const keys = yield utils_1.createKeyValuePair(passphrase);
        const publicKeyWrite = fs_1.default.writeFile.__promisify__(publicKeyFilePath, keys.publicKey);
        const privateKeyWrite = fs_1.default.writeFile.__promisify__(privateKeyFilePath, keys.privateKey);
        yield publicKeyWrite;
        yield privateKeyWrite;
        return;
    });
}
exports.default = default_1;
//# sourceMappingURL=gen-keys.js.map