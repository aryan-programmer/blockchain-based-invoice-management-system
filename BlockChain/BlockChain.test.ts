Object.freeze = (a: any) => a;

import Block, {Data} from "./Block";
import BlockChain from "./BlockChain";

describe("BlockChain", function () {
	let chain: BlockChain;
	let chain2: BlockChain;
	let genesis: Block;
	// φ to 104 digits after the decimal
	const phi: Data       = {
		invoiceNumber: "1.61803398874989484820458683436563811772030917980576286213544862270526046281890244970720720418939113748475",
		products: [],
		totalCost: 0,
		__notARealInvoice: true
	};
	// π² to 104 digits after the decimal
	const piSquared: Data = {
		invoiceNumber: "9.86960440108935861883449099987615113531369940724079062641334937622004482241920524300177340371855223182402",
		products: [],
		totalCost: 0,
		__notARealInvoice: true
	};
	// √π to 104 digits after the decimal
	const sqrtPi: Data    = {
		invoiceNumber: "1.772453850905516027298167483341145182797549456122387128213807789852911284591032181374950656738544665",
		products: [],
		totalCost: 0,
		__notARealInvoice: true
	};

	beforeEach(function () {
		chain   = new BlockChain();
		chain2  = new BlockChain();
		genesis = Block.genesis();
	});

	it('should start with the genesis block', function () {
		expect(chain.chain[0]).toEqual(genesis);
	});

	it('should add a new block', function () {
		chain.addBlock(phi);
		expect(chain.chain[1].data).toEqual(phi);
	});

	describe("Validity related functions", function () {
		beforeEach(function () {
			chain.addBlock(phi);
			chain.addBlock(piSquared);
		});

		describe("isValid", function () {
			it('should validate a valid chain', function () {
				expect(BlockChain.isValid(chain.chain)).toBe(true);
			});

			it('should invalidate a chain with a corrupt genesis block', function () {
				// @ts-ignore
				// noinspection JSConstantReassignment
				chain.chain[0].data.invoiceNumber = "22/7";
				expect(BlockChain.isValid(chain.chain)).toBe(false);
			});

			it('should invalidate a corrupt chain', function () {
				// @ts-ignore
				// noinspection JSConstantReassignment
				chain.chain[2].data = sqrtPi;
				expect(BlockChain.isValid(chain.chain)).toBe(false);
			});
		});

		describe("replaceChain", function () {
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
				// @ts-ignore
				// noinspection JSConstantReassignment
				chain.chain[3].data = {
					invoiceNumber: "φ",
					products: [],
					totalCost: 0
				};
				expect(chain2.replaceChain(chain.chain)).toBe(false);
				expect(chain2.chain).not.toEqual(chain.chain);
			});
		})
	})
});
