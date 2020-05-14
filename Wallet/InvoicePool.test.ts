Object.freeze = (a: any) => a;

import crypto from "crypto";
import fs from "fs";
import cloneDeep from "lodash/cloneDeep";
import {Invoice, InvoicePool, Wallet} from ".";
import {id} from "../utils";

describe("InvoicePool", function () {
	let wallet: Wallet;
	let invoice: Invoice;
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

	beforeEach(function () {
		wallet  = new Wallet(publicKey, privateKey);
		pool    = new InvoicePool();
		invoice = wallet.addInvoiceToPool(pool, {
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
		});
	});

	it('should add an invoice to the pool', function () {
		expect(pool.invoices.find(value => value.invoice.invoiceNumber === invoice.invoice.invoiceNumber)).toEqual(invoice);
	});

	describe("Creating a new invoice", function () {
		describe("And adding it again", function () {
			it('should do nothing', function () {
				const oldPool = cloneDeep(pool);
				expect(pool.addInvoice(invoice)).toBe(invoice);
				expect(oldPool).toEqual(pool);
			});
		})
	});

	describe("Validity related functions", function () {
		let validInvoices: Invoice[];

		beforeEach(function () {
			validInvoices = [...pool.invoices];
			for (let i = 0; i < 10; i++) {
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
					}]
				});
				if (i % 2 === 0) {
					if (i % 4 === 0) {
						for (const product of invoice.invoice.products) {
							// @ts-ignore
							// noinspection JSConstantReassignment
							product.cost = product.tax = product.totalCost = 0;
						}
					}
					// @ts-ignore
					// noinspection JSConstantReassignment
					invoice.invoice.totalCost = 0;
				} else {
					validInvoices.push(invoice);
				}
			}
		});

		describe("Invoice.getValidInvoices", function () {
			it('should only get the valid invoices', function () {
				expect(pool.getValidInvoices()).toEqual(validInvoices);
			});
		});

		describe("Invoice.addInvoices", function () {
			let pool2: InvoicePool;
			let newValidInvoices: Invoice[];

			beforeEach(function () {
				pool2            = new InvoicePool();
				newValidInvoices = [];
				for (let i = 0; i < 3; i++) {
					newValidInvoices.push(wallet.addInvoiceToPool(pool2, {
						invoiceNumber: id(),
						products: []
					}));
				}
				pool2.addInvoices(pool.invoices);
				newValidInvoices.push(...validInvoices);
			});

			it('should add only the valid invoices', function () {
				expect(pool2.invoices).toEqual(newValidInvoices);
			});
		})
	});
});
