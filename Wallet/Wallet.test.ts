import crypto from "crypto";
import fs from "fs";
import {InvoicePool, Wallet} from ".";
import {id} from "../utils";

describe("Wallet", function () {
	let wallet: Wallet;
	let pool: InvoicePool;

	const publicKey  = crypto.createPublicKey({
		key: fs.readFileSync("./sign-public-test-key.pem"),
		format: "pem",
	});
	const privateKey = crypto.createPrivateKey({
		key: fs.readFileSync("./sign-private-test-key-pwd-pass.pem"),
		format: "pem",
		passphrase: "pass"
	});

	beforeEach(() => {
		wallet = new Wallet(publicKey, privateKey);
		pool   = new InvoicePool();
	});

	it('should add an invoice to the pool', function () {
		const invoice = wallet.addInvoiceToPool(pool, {
			invoiceNumber: id(),
			products: [{
				name: "A's",
				cost: 74.42,
				quantity: "1 box",
				taxPercentage: 18.42
			}, {
				name: "B's",
				cost: 176.57,
				quantity: "2 boxes",
				taxPercentage: 18.00
			}],
			purchaser: {
				isVendor: false,
				name: 'Nil McNull',
				phoneNumber: '000-000-0000'
			}
		});
		expect(pool.invoices[0]).toEqual(invoice);
	});
});
