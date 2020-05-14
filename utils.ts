import crypto from "crypto";
import readline from "readline";
import {Writable} from "stream";
import {promisify} from "util";

crypto.generateKeyPair.__promisify__ = promisify(crypto.generateKeyPair);

// The NPM uuid package fails with an:
// Error: No valid exports main found for '<path-to-project>\node_modules\uuid'
// region ...UUID V4 with default parameters only
const byteToHex: string[] = [];

for (let i = 0; i < 256; ++i) {
	byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid (buf: Buffer) {
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

export function id () {
	const rnds = crypto.randomBytes(16); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

	rnds[6] = rnds[6] & 0x0f | 0x40;
	rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

	return bytesToUuid(rnds);
}

// endregion UUID V4 with default parameters only

// region ...Deep r/w only
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

export function deepFreeze<T extends object> (object: T): DeepReadonly<T> {
	for (let name of Object.getOwnPropertyNames(object)) {
		if (!object.hasOwnProperty(name)) continue;
		// @ts-ignore
		let value = object[name];
		if (value && typeof value === "object") {
			deepFreeze(value);
		}
	}
	Object.freeze(object);
	return object;
}

// endregion Deep r/w only

// region ...Password prompt
const nullOut = new Writable({
	write (chunk, encoding, callback) {
		callback();
	}
});

export function passwordPrompt (promptText: string): Promise<string> {
	const {stdout, stdin}                 = process;
	const passwordPromptReadlineInterface = readline.createInterface({
		input: stdin,
		output: nullOut,
		terminal: true,
	});
	return new Promise((resolve) => {
		stdout.write(promptText);
		passwordPromptReadlineInterface.question("", answer => {
			resolve(answer);
			passwordPromptReadlineInterface.close();
			stdout.write("\n");
		});
	});
}

// endregion password prompt

// region ...Key value pair
export function createKeyValuePair (privateKeyPassPhrase: string): Promise<{ publicKey: string, privateKey: string }> {
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
export const minDifficulty     = 2;
const mineRate                 = 1000;

export function getNewDifficulty (currentDifficulty: number, mineStartTimestamp: number): number {
	return Math.max(currentDifficulty + (mineStartTimestamp + mineRate > Date.now() ? +1 : -1), minDifficulty);
}

// endregion Mining difficulty

deepFreeze(module.exports);
