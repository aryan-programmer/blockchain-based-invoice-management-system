import crypto from "crypto";
import cloneDeep from "lodash/cloneDeep";
import {freezeClass} from "../freeze";
import {deepFreeze, DeepReadonly, getNewDifficulty, initialDifficulty} from "../utils";
import {Invoice} from "../Wallet";

export type Nonce = string;
export type Timestamp = string;
export type Hash = string;
export type Data = DeepReadonly<Invoice[]>;

@freezeClass
export default class Block {
	private static genesisTime               = Date.UTC(2020, 0, 1, 0, 0, 0, 0).toString();
	private static genesisLastHash           = crypto
		.createHash("sha512")
		.update("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746")
		.digest('hex');
	private static genesisData: Data[0]      = new Invoice({
		invoice: {
			invoiceNumber: '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214',
			products: [],
			totalCost: 0,
		},
		signature: '308188024201c2e95aba73858ed20ac67d7db5a05dbf20f53ab75f8dc42800e712f981653467f13a69b4cee6e603ad138720ee901356e823e3fec9a0e6398e2d4e8f21344af9b5024201af893b427335b37c23f32689ce56345c720a72b48a8b75a07d91af03898a48266f1b1be55f9ca776f9fcf7d2a2bb4f3658e996318b390b40f4246317a895627c60',
		publicKey: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBwzm2gXYhW23NMI3GuDeJjuRMSD/5
9WKtHPn4lbX+zJCVdEbCZ8Xy5ID23fbjqxfXVJr2gd2AXUu5KY4Cacvmh/MBFZ22
Shl2MJXWpox9OypqGBhDRHJy5oV7Z49PFqHs/Yt7hMABjg+Hvz6DDD4NPyMKeJDk
0KZ6uP6dCmqVyNvfp1s=
-----END PUBLIC KEY-----
`
	}, true);
	private static genesisNonce: Nonce       = "";
	private static genesisDifficulty: number = 0;
	private static genesisHash               = Block.hash(
		Block.genesisTime,
		Block.genesisLastHash,
		JSON.stringify(Block.genesisData),
		Block.genesisNonce,
		Block.genesisDifficulty,
	);
	public readonly data: Data;

	constructor (
		public readonly timestamp: Timestamp,
		public readonly lastHash: Hash,
		public readonly hash: Hash,
		data: Data,
		public readonly nonce: Nonce,
		public readonly difficulty: number,
	) {
		this.data = cloneDeep(data);
		deepFreeze(this);
	}

	static genesis (): Block {
		return new Block(
			Block.genesisTime,
			Block.genesisLastHash,
			Block.genesisHash,
			[new Invoice(Block.genesisData, true)],
			Block.genesisNonce,
			Block.genesisDifficulty,
		);
	}

	static mineBlock (lastBlock: Block, data: Data): Block {
		const timestamp                  = Date.now();
		const timestampStr               = timestamp.toString();
		const dataStr                    = JSON.stringify(data);
		let {hash: lastHash, difficulty} = lastBlock;
		if (difficulty === 0) difficulty = initialDifficulty;
		let nonce: Nonce;
		let hash: string;
		do {
			difficulty = getNewDifficulty(lastBlock.difficulty, timestamp);
			nonce      = crypto.randomBytes(64/* 512bits/8 */).toString("hex");
			hash       = Block.hash(
				timestampStr,
				lastHash,
				dataStr,
				nonce,
				difficulty
			);
		} while (!Block.doesHashStartWithNZeroes(hash, difficulty));
		return new Block(timestampStr, lastHash, hash, data, nonce, difficulty);
	}

	static doesHashStartWithNZeroes (hash: Hash, n: number): boolean {
		for (let i = 0; i < n; i++) {
			if (hash[i] !== '0') {
				return false;
			}
		}
		return true;
	}

	static hashBlock (block: Block): string {
		return Block.hash(
			block.timestamp.toString(),
			block.lastHash,
			JSON.stringify(block.data),
			block.nonce,
			block.difficulty
		);
	}

	private static hash (
		timestampAsString: string,
		lastHash: Hash,
		data: string,
		nonce: Nonce,
		difficulty: number,
	): Hash {
		const hash = crypto.createHash('sha512');
		hash.write(timestampAsString);
		hash.write(lastHash);
		hash.write(data);
		hash.write(nonce);
		hash.write(difficulty.toString());
		return hash.digest('hex');
	}

	toString (): string {
		return JSON.stringify(this, null, 2)
	}
}
