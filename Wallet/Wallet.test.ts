import crypto from "crypto";
import {createKeyValuePair, id} from "../utils";
import Invoice from "./Invoice";
import InvoicePool from "./InvoicePool";
import Wallet from "./Wallet";
import cloneDeep from "lodash/cloneDeep";

describe("Wallet", function () {
	let wallet: Wallet;
	let pool: InvoicePool;
	let publicKey: crypto.KeyObject;
	let privateKey: crypto.KeyObject;

	beforeAll(function (done) {
		createKeyValuePair("password").then(({publicKey: publicKeyPem, privateKey: privateKeyPem}) => {
			publicKey = crypto.createPublicKey({
				key: publicKeyPem,
				format: "pem",
			});
			privateKey = crypto.createPrivateKey({
				key: privateKeyPem,
				format: "pem",
				passphrase: "password"
			});
			done();
		});
	});

	beforeEach(function () {
		wallet = new Wallet(publicKey, privateKey);
		pool = new InvoicePool();
	});

	describe("Creating a new invoice", function () {
		let invoice: Invoice;

		beforeEach(function () {
			invoice = wallet.addInvoiceToPool(pool, {
				invoiceNumber: id(),
				products: []
			});
		});

		describe("And adding it again", function () {
			it('should do nothing', function () {
				const oldPool = cloneDeep(pool);
				expect(pool.addInvoice(invoice)).toBe(invoice);
				expect(oldPool).toEqual(pool);
			});
		})
	})
});
