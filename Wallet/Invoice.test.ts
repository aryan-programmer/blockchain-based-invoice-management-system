Object.freeze = (a: any) => a;

import crypto from "crypto";
import fs from "fs";
import {id} from "../utils";
import Invoice from "./Invoice";
import Wallet from "./Wallet";

describe("Invoice", function () {
	let wallet: Wallet;
	let invoice: Invoice;
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

	describe("Validity related functions", function () {
		describe("Validate valid invoices", function () {
			test("Invoice.verifySignature", function () {
				expect(Invoice.verifySignature(wallet.publicKeyPem, invoice.invoice, invoice.signature)).toBe(true);
			});

			test("Invoice.verifyTotal", function () {
				expect(Invoice.verifyTotal(invoice.invoice)).toBe(true);
			});

			test("Invoice.verify", function () {
				expect(Invoice.verify(invoice)).toBe(true);
			});
		});

		describe("Invalidate tampered/invalid invoices", function () {
			beforeEach(function () {
				// @ts-ignore
				// noinspection JSConstantReassignment
				invoice.invoice = {
					invoiceNumber: "142857-99-42",
					products: [{
						name: "A's",
						cost: 0,
						quantity: "0 box",
						taxPercentage: 18.42,
						tax: 0,
						totalCost: 0,
					}, {
						name: "B's",
						cost: 0,
						quantity: "0 boxes",
						taxPercentage: 18.00,
						tax: 0,
						totalCost: 0,
					}],
					totalCost: 0,
				};
			})

			test('Invoice.verifySignature', function () {
				expect(Invoice.verifySignature(wallet.publicKeyPem, invoice.invoice, invoice.signature)).toBe(false);
			});

			test('Invoice.verifyTotal', function () {
				// The total matches as the attacker was smart
				expect(Invoice.verifyTotal(invoice.invoice)).toBe(true);
				// Oops! The attacker make a mistake (not likely)
				// @ts-ignore
				// noinspection JSConstantReassignment
				invoice.invoice.totalCost = 100;
				expect(Invoice.verifyTotal(invoice.invoice)).toBe(false);
			});

			test("Invoice.verify", function () {
				expect(Invoice.verify(invoice)).toBe(false);
			});
		})
	})
});
