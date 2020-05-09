import {SHA512} from "crypto-js";
import freeze from "../freeze";
import {Invoice} from "./Invoice";

@freeze
export default class Block {
	constructor (
		public readonly timestamp: number,
		public readonly lastHash: string,
		public readonly hash: string,
		public readonly data: Invoice
	) {
		Object.freeze(this);
	}

	toString (): string {
		return JSON.stringify(this, null, 2)
	}

	private static genesisTime = Date.UTC(2020, 0, 1, 0, 0, 0, 0);
	private static genesisLastHash = SHA512("2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516642742746").toString();
	private static genesisData: Invoice = {
		invoiceNumber: "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214",
		products: [],
		totalCost: 0
	};
	private static genesisHash = Block.hash(Block.genesisTime, Block.genesisLastHash, Block.genesisData)

	static genesis (): Block {
		return new Block(
			Block.genesisTime,
			Block.genesisLastHash,
			Block.genesisHash,
			Block.genesisData
		);
	}

	static mineBlock (lastBlock: Block, data: Invoice): Block {
		const timestamp = Date.now();
		const lastHash = lastBlock.hash;
		const hash = Block.hash(timestamp, lastHash, data);
		return new Block(timestamp, lastHash, hash, data);
	}

	static hashBlock(block: Block): string{
		return Block.hash(block.timestamp, block.lastHash, block.data);
	}

	private static hash (timestamp: number, lastHash: string, data: Invoice): string {
		return SHA512(`T${timestamp} H${lastHash} D${JSON.stringify(data)}`).toString()
	}
}
