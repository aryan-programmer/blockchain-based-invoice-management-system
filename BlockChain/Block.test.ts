import Block from "./Block";
import {Invoice} from "./Invoice";

describe("Block", function () {
	let block: Block;
	let genesis: Block;
	// φ to 104 digits after the decimal
	const phi: Invoice = {
		invoiceNumber: "1.61803398874989484820458683436563811772030917980576286213544862270526046281890244970720720418939113748475",
		products: [],
		totalCost: 0
	};

	beforeEach(function () {
		genesis = Block.genesis();
		block = Block.mineBlock(genesis, phi);
	});

	it('should set the `data` to match the output', function () {
		expect(block.data).toEqual(phi);
	});
	it('should set the `lastHash` to match the hash of the last block', function () {
		expect(block.lastHash).toEqual(genesis.hash);
	});
})
