"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
commander_1.program
    .version("1.0.0", "-v, --version", "Show current version")
    .name("blockchain-based-invoice-management-system");
commander_1.program
    .command('gen-keys')
    .description("Generates public and private keys for the signing of the invoices.")
    .helpOption("-h, --help", "Show this help")
    .option("--public-key-file-path <file>", "The file to which to store the public key", "sign-public-key.pem")
    .option("--private-key-file-path <file>", "The file to which to store the private (secret) key", "sign-private-key.pem")
    .option("--password <password>", "The password used to encrypt the private key")
    .action(async (args) => {
    try {
        await require("./gen-keys").default(args);
        process.exit(0);
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }
});
commander_1.program
    .command("p2p")
    .description("Launches a P2P server & an API server on the specified ports, connected to the peers specified.")
    .helpOption("-h, --help", "Show this help")
    .requiredOption("--port <number>", "The HTTP port on which to listen, must be more than 1000", parseInt)
    .requiredOption("--p2p-port <number>", "The port on which to listen for P2P connections, must be more than 1000", parseInt)
    .option("--peers <list>", "The peers to connect to, separated by commas, no spaces", (value) => value.split(","), [])
    .option("--public-key-file-path <file>", "The file which contains the public key used for signing", "sign-public-key.pem")
    .option("--private-key-file-path <file>", "The file which contains the private key used for signing", "sign-private-key.pem")
    .option("--password <password>", "The password that used to encrypt the private key used for signing")
    .action(async (args) => {
    try {
        await require("./p2p").default(args);
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }
});
commander_1.program.parse(process.argv);
//# sourceMappingURL=index.js.map