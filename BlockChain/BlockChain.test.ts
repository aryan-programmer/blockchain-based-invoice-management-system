import Block from "./Block";
import BlockChain from "./BlockChain";
import {Invoice, RecInvoice} from "./Invoice";

describe("BlockChain", function () {
	let chain: BlockChain;
	let chain2: BlockChain;
	let genesis: Block;
	// φ to 104 digits after the decimal
	const phi: RecInvoice = {
		invoiceNumber: "1.61803398874989484820458683436563811772030917980576286213544862270526046281890244970720720418939113748475",
		products: []
	};
	// π² to 104 digits after the decimal
	const piSquared: RecInvoice = {
		invoiceNumber: "9.86960440108935861883449099987615113531369940724079062641334937622004482241920524300177340371855223182402",
		products: []
	};
	// √π to 104 digits after the decimal
	const sqrtPi: RecInvoice & Invoice = {
		invoiceNumber: "1.772453850905516027298167483341145182797549456122387128213807789852911284591032181374950656738544665",
		products: [],
		totalCost: 0
	};

	beforeEach(function () {
		chain = new BlockChain();
		chain2 = new BlockChain();
		genesis = Block.genesis();
	});

	it('should start with the genesis block', function () {
		expect(chain.chain[0]).toEqual(genesis);
	});

	it('should add a new block', function () {
		chain.addBlock(phi);
		expect(chain.chain[1].data).toEqual(phi);
	});

	describe("BlockChain validity related functions", function () {
		beforeEach(function () {
			chain.addBlock(phi);
			chain.addBlock(piSquared);
		});

		describe("BlockChain.isValid", function () {
			it('should validate a valid chain', function () {
				expect(BlockChain.isValid(chain.chain)).toBe(true);
			});

			it('should invalidate a chain with a corrupt genesis block', function () {
				chain.chain[0] = new Block(genesis.timestamp, genesis.lastHash, genesis.hash, {
					invoiceNumber: "22/7",
					products: [],
					totalCost: 0
				}, "", 0);
				expect(BlockChain.isValid(chain.chain)).toBe(false);
			});

			it('should invalidate a corrupt chain', function () {
				const block = chain.chain[2];
				chain.chain[2] = new Block(block.timestamp, block.lastHash, block.hash, sqrtPi, "", block.difficulty);
				expect(BlockChain.isValid(chain.chain)).toBe(false);
			});
		});

		describe("BlockChain.replaceChain", function () {
			it('should replace the chain with a valid and longer chain', function () {
				expect(chain2.replaceChain(chain.chain)).toBe(true);
				expect(chain2.chain).toEqual(chain.chain);
			});

			it('should not replace the chain if it is shorter', function () {
				chain2.addBlock(phi);
				expect(chain.replaceChain(chain2.chain)).toBe(false);
				expect(chain.chain).not.toEqual(chain2.chain);
			});

			it('should not replace the chain if it is of equal length', function () {
				chain2.addBlock(sqrtPi);
				chain2.addBlock(phi);
				expect(chain2.replaceChain(chain.chain)).toBe(false);
				expect(chain2.chain).not.toEqual(chain.chain);
				expect(chain.replaceChain(chain2.chain)).toBe(false);
				expect(chain.chain).not.toEqual(chain2.chain);
			});

			it('should not replace the chain if it is invalid', function () {
				chain.addBlock(piSquared);
				chain.addBlock(sqrtPi);
				chain.addBlock(phi);
				const block = chain.chain[3];
				chain.chain[3] = new Block(block.timestamp, block.lastHash, block.hash, {
					invoiceNumber: "φ",
					products: [],
					totalCost: 0
				}, "", block.difficulty);
				expect(chain2.replaceChain(chain.chain)).toBe(false);
				expect(chain2.chain).not.toEqual(chain.chain);
			});
		})
	})
});
