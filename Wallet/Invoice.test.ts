import crypto from "crypto";
import {createKeyValuePair} from "../utils";
import Invoice from "./Invoice";
import Wallet from "./Wallet";

describe("Invoice", function () {
	let wallet: Wallet;
	let invoice: Invoice;
	let publicKey: crypto.KeyObject;
	let privateKey: crypto.KeyObject;
	const promise = createKeyValuePair("password").then(({publicKey: publicKeyPem, privateKey: privateKeyPem}) => {
		publicKey = crypto.createPublicKey({
			key: publicKeyPem,
			format: "pem",
		});
		privateKey = crypto.createPrivateKey({
			key: privateKeyPem,
			format: "pem",
			passphrase: "password"
		});
	});

	beforeEach(function (done) {
		promise.then(value => {
			wallet = new Wallet(publicKey, privateKey);
			invoice = new Invoice({
				invoiceNumber: "142857-99-42",
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
				}]
			}, wallet);
			done();
		})
	});

	it('should validate a valid invoice', function () {
		expect(Invoice.verify(wallet.publicKeyPem, invoice.invoice, invoice.signature)).toBe(true);
	});

	it('should invalidate an invalid invoice', async function () {
		// TODO: I do not know how to edit properties on objects locked by Object.freeze so we have to create a fake test.
		const {publicKey: publicKeyPem, privateKey: privateKeyPem} = await createKeyValuePair("password");
		let publicKey2 = crypto.createPublicKey({
			key: publicKeyPem,
			format: "pem",
		});
		let privateKey2 = crypto.createPrivateKey({
			key: privateKeyPem,
			format: "pem",
			passphrase: "password"
		});
		let wallet2 = new Wallet(publicKey2, privateKey2);
		invoice = new Invoice({
			invoiceNumber: "142857-99-42",
			products: [{
				name: "A's",
				cost: 0,
				quantity: "0 box",
				taxPercentage: 18.42
			}, {
				name: "B's",
				cost: 0,
				quantity: "0 boxes",
				taxPercentage: 18.00
			}]
		}, wallet2);
		expect(Invoice.verify(wallet.publicKeyPem, invoice.invoice, invoice.signature)).toBe(false);
	});
});
