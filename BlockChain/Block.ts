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
	private static genesisData: Data         = [new Invoice({
		invoice: {
			invoiceNumber: '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214',
			products: [],
			totalCost: 0
		},
		timestamp: '1590036663057',
		signature: '30818702411dd1497d6e8f8e4828126573ab3a552bc94de30b282e6675d7e4c8d012c51f5b4c199151178580545f6f3381fe30c85075633ea1d8dfb90d0fde7919f841cd750b024201ed147b8c213e1497445fb8ea2cf81e63f1a20da50c5f09f7d96d73f701b3077e49f2771149409ca97ce472c5b6d20bc274a89f77c9db5def3d475631b173adc38e',
		publicKey: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAizKyaTWlUs0oqHT79kuVi5sPy8Nz
yzy8YZ+nIZM/antb2pTbBwleJXYYAvdgB41ET+FPvjM6ta7DfTwrI1RqaRoBH9O7
p2pRfymPIQ6hi+Bfj5rOX8LQzPJLiAUcewlD9rBRP21lRUXHeeRz3ENWaXFj90sG
uWBrb1eJjJDfUuMiXro=
-----END PUBLIC KEY-----
`
	}, true)];
	private static genesisNonce: Nonce       = "e81a8ce9de16123cd50989e0d4c7be338e24b4624bac88dd02452bcb0555a46230307cd625c0baafee9df74a9321a34541420c95a7c37d21caff2568b40ef7a0";
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
			[new Invoice(Block.genesisData[0], true)],
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
