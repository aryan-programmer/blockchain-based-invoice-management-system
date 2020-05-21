import {getNewDifficulty, minDifficulty} from "../utils";
import {Invoice} from "../Wallet";
import Block, {Data} from "./Block";

describe("Block", function () {
	let block: Block;
	let genesis: Block;
	// φ to 104 digits after the decimal
	const phi: Data = [new Invoice({
		timestamp: Date.now().toString(),
		invoice: {
			invoiceNumber: "1.61803398874989484820458683436563811772030917980576286213544862270526046281890244970720720418939113748475",
			products: [],
			totalCost: 0,
			purchaser: {
				isVendor: false,
				name: 'Nil McNull',
				phoneNumber: '000-000-0000'
			}
		},
		signature: "",
		publicKey: ""
	}, true)];

	beforeEach(function () {
		genesis = Block.genesis();
		block   = Block.mineBlock(genesis, phi);
	});

	it('should set the `data` to match the output', function () {
		expect(block.data).toEqual(phi);
	});

	it('should set the `lastHash` to match the hash of the last block', function () {
		expect(block.lastHash).toEqual(genesis.hash);
	});

	describe("Difficulty related functions", function () {
		it('should generate a `hash` that starts with zeroes equalling the difficulty level', function () {
			expect(block.hash.substr(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
		});

		it('should lower the difficulty for a slowly mined block', function () {
			expect(getNewDifficulty(block.difficulty, Date.now() - 100000)).toEqual(Math.max(block.difficulty - 1, minDifficulty));
		});

		it('should increase the difficulty for a quickly mined block', function () {
			expect(getNewDifficulty(block.difficulty, Date.now() - 100)).toEqual(Math.max(block.difficulty + 1, minDifficulty));
		});
	})
})
