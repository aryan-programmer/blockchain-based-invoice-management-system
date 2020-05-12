import crypto from "crypto";
import {createKeyValuePair, id} from "../utils";
import Invoice from "./Invoice";
import InvoicePool from "./InvoicePool";
import Wallet from "./Wallet";

describe("InvoicePool", function () {
	let wallet: Wallet;
	let invoice: Invoice;
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
		pool.addInvoice(invoice);
	});

	it('should add an invoice to the pool', function () {
		expect(pool.invoices.find(value => value.invoice.invoiceNumber === invoice.invoice.invoiceNumber)).toEqual(invoice);
	});
});
