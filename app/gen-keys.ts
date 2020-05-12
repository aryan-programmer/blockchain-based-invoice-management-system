import {promisify} from "util";
import {createKeyValuePair, passwordPrompt} from "../utils";
import fs from "fs";

fs.writeFile.__promisify__ = promisify(fs.writeFile);

export default async function (args: any): Promise<void> {
	let passphrase: string, publicKeyFilePath: string, privateKeyFilePath: string;
	({passphrase, publicKeyFilePath, privateKeyFilePath} = args);
	while (passphrase == null || passphrase === "") {
		passphrase = await passwordPrompt("Please enter a passphrase to encrypt the private key:")
	}
	const keys = await createKeyValuePair(passphrase);
	const publicKeyWrite = fs.writeFile.__promisify__(publicKeyFilePath, keys.publicKey);
	const privateKeyWrite = fs.writeFile.__promisify__(privateKeyFilePath, keys.privateKey);
	await publicKeyWrite;
	await privateKeyWrite;
	return;
}
