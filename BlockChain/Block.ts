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
			purchaser: {
				isVendor: false,
				name: 'Nil McNull',
				phoneNumber: '000-000-0000'
			},
			totalCost: 0
		},
		timestamp: '1590049621714',
		signature: '3081880242014d75a20cfaa8704bbcd38cc2099422c2c747cbbebbc569e5c95b189abd424dece2d60671d4e268713c6215b3c06046d120d1bb1c77f37307101d82f78ecf0e2cea024201a5a6fddfd72166c16754247c7faae693ac2e1e0dde9778d27cde439766619a714a63710806c8eb0aaeadf2ab7b8ad8f8219a3bf24db0d59c5cd12618b57006b1af',
		publicKey: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAlX7/En80E/8KR3VMFvhiox9bUsnL
VFOJN+Trs0jwa+rhBZfkXLgAvcdoFx3RYEfJdN7rXv1NGk0AIDSa4gdHq8wAGXH3
oSvIRr7xLCz+ITF0Br6Kt1MJE9SloHT5auaDNdm4IguGaigjsAnMUUludmNpY31t
LCSEXNPaUaC3cmEiCZI=
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
