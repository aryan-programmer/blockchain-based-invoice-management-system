Object.freeze = (a: any) => a;

import crypto from "crypto";
import {createKeyValuePair, id} from "../utils";
import Invoice from "./Invoice";
import Wallet from "./Wallet";

describe("Invoice", function () {
	let wallet: Wallet;
	let invoice: Invoice;
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
		invoice = new Invoice({
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
			}]
		}, wallet);
	});

	it('should validate a valid invoice', function () {
		expect(Invoice.verify(wallet.publicKeyPem, invoice.invoice, invoice.signature)).toBe(true);
	});

	it('should invalidate an tampered invoice', async function () {
		// @ts-ignore
		// noinspection JSConstantReassignment
		invoice.invoice = {
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
		};
		expect(Invoice.verify(wallet.publicKeyPem, invoice.invoice, invoice.signature)).toBe(false);
	});
});
