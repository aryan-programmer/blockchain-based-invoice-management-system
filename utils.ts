import crypto from "crypto";
import readline from "readline";
import {Writable} from "stream";
import {promisify} from "util";
const { v1: uuidV1 } = require('uuid');
export const id = uuidV1;

crypto.generateKeyPair.__promisify__ = promisify(crypto.generateKeyPair);

// region ...Deep r/w only
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

export function deepFreeze (object: any) {
	let propNames = Object.getOwnPropertyNames(object);
	for (let name of propNames) {
		let value = object[name];
		if (value && typeof value === "object") {
			deepFreeze(value);
		}
	}
	return Object.freeze(object);
}
// endregion Deep r/w only

// region ...Password prompt
const {stdout, stdin} = process;
const nullOut = new Writable({
	write (chunk, encoding, callback) {
		callback();
	}
});
const passwordPromptReadlineInterface = readline.createInterface({
	input: stdin,
	output: nullOut,
	terminal: true,
})

export function passwordPrompt (promptText: string): Promise<string> {
	return new Promise((resolve) => {
		stdout.write(promptText);
		passwordPromptReadlineInterface.question("", answer => {
			resolve(answer);
			stdout.write("\n");
		});
	});
}
// endregion password prompt

// region ...Key value pair
export function createKeyValuePair (privateKeyPassPhrase: string): Promise<{publicKey: string, privateKey: string}> {
	return crypto.generateKeyPair.__promisify__(
		'ec', {
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
		}
	);
}

// endregion Key value pair

// region ...Mining difficulty
export const initialDifficulty = 5;
export const minDifficulty = 2;
const mineRate = 1000;

export function getNewDifficulty (currentDifficulty: number, mineStartTimestamp: number): number {
	return Math.max(currentDifficulty + (mineStartTimestamp + mineRate > Date.now() ? +1 : -1), minDifficulty);
}
// endregion Mining difficulty
