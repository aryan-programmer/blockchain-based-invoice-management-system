import isEqual from "lodash/isEqual";
import freeze from "../freeze";
import Block from "./Block";
import {Invoice, RecInvoice} from "./Invoice";

@freeze
export default class BlockChain {
	chain: Block[];

	constructor () {
		this.chain = [Block.genesis()];
	}

	addBlock (data: RecInvoice): Block {
		const retData = data as Invoice;
		let totalCost = 0;
		for (const product of retData.products) {
			product.tax = product.cost * product.taxPercentage / 100;
			product.totalCost = product.cost + product.tax;
			totalCost += product.totalCost;
		}
		retData.totalCost = totalCost;
		const block = Block.mineBlock(this.chain[this.chain.length - 1], retData);
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
