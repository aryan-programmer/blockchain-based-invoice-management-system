import crypto from "crypto";
import cloneDeep from "lodash/cloneDeep";
import {freezeClass} from "../freeze";
import {deepFreeze, getNewDifficulty, initialDifficulty} from "../utils";
import {Invoice} from "./Invoice";

export type Nonce = string;
export type Timestamp = string;
export type Hash = string;

@freezeClass
export default class Block {
	public readonly data: Invoice;

	constructor (
		public readonly timestamp: Timestamp,
		public readonly lastHash: Hash,
		public readonly hash: Hash,
		data: Invoice,
		public readonly nonce: Nonce,
		public readonly difficulty: number,
	) {
		this.data = cloneDeep(data);
		deepFreeze(this);
	}

	toString (): string {
		return JSON.stringify(this, null, 2)
	}

	private static genesisTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0).toString();
	private static genesisLastHash = crypto
		.createHash("sha512")
		.update("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746")
		.digest('hex');
	private static genesisData: Invoice = deepFreeze({
		invoiceNumber: "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214",
		products: [],
		totalCost: 0
	});
	private static genesisNonce: Nonce = "";
	private static genesisDifficulty: number = 0;
	private static genesisHash = Block.hash(
		Block.genesisTime,
		Block.genesisLastHash,
		JSON.stringify(Block.genesisData),
		Block.genesisNonce,
		Block.genesisDifficulty,
	);

	static genesis (): Block {
		return new Block(
			Block.genesisTime,
			Block.genesisLastHash,
			Block.genesisHash,
			Block.genesisData,
			Block.genesisNonce,
			Block.genesisDifficulty,
		);
	}

	static mineBlock (lastBlock: Block, data: Invoice): Block {
		const timestamp = Date.now();
		const timestampStr = timestamp.toString();
		const dataStr = JSON.stringify(data);
		let {hash: lastHash, difficulty} = lastBlock;
		if (difficulty === 0) difficulty = initialDifficulty;
		let nonce: Nonce;
		let hash: string;
		do {
			difficulty = getNewDifficulty(lastBlock.difficulty, timestamp);
			nonce = crypto.randomBytes(64/* 512bits/8 */).toString("hex");
			hash = Block.hash(
				timestampStr,
				lastHash,
				dataStr,
				nonce,
				difficulty
			);
		} while (!this.doesHashStartWithNZeroes(hash, difficulty));
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
		return Block.hash(block.timestamp.toString(), block.lastHash, JSON.stringify(block.data), block.nonce, block.difficulty);
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
}
