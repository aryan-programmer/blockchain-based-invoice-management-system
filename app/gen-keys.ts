import fs from "fs";
import {promisify} from "util";
import {createKeyValuePair, passwordPrompt} from "../utils";

fs.writeFile.__promisify__ = promisify(fs.writeFile);

export default async function (args: any): Promise<void> {
	let password: string,
	    publicKeyFilePath: string,
	    privateKeyFilePath: string;
	({password, publicKeyFilePath, privateKeyFilePath} = args);
	while (password == null || password === "") {
		password = await passwordPrompt("Please enter a passphrase to encrypt the private key:")
	}
	const keys            = await createKeyValuePair(password);
	const publicKeyWrite  = fs.writeFile.__promisify__(publicKeyFilePath, keys.publicKey);
	const privateKeyWrite = fs.writeFile.__promisify__(privateKeyFilePath, keys.privateKey);
	await publicKeyWrite;
	await privateKeyWrite;
	return;
}
