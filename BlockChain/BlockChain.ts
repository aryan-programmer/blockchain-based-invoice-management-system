import isEqual from "lodash/isEqual";
import frozen from "../frozen";
import Block from "./Block";
import DataType from "./DataType";

@frozen
export default class BlockChain {
	chain: Block[];

	constructor () {
		this.chain = [Block.genesis()];
	}

	addBlock (data: DataType): Block {
		const block = Block.mineBlock(this.chain[this.chain.length - 1], data);
		this.chain.push(block);
		return block;
	}

	replaceChain (chain: Block[]): boolean {
		if (this.chain.length >= chain.length) return false;
		if (!BlockChain.isValid(chain)) return false;
		this.chain = chain;
		return true;
	}

	static isValid (chain: Block[]) {
		const chainLen = chain.length;
		if (chainLen < 2) return false;

		if (!isEqual(chain[0], Block.genesis())) return false;

		for (let i = 1; i < chainLen; i++) {
			const lastBlock = chain[i - 1];
			const block = chain[i];

			if (block.lastHash !== lastBlock.hash) return false;

			if (Block.hashBlock(block) !== block.hash) return false;
		}

		return true;
	}
}
