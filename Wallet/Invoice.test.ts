Object.freeze = (a: any) => a;

import crypto from "crypto";
import fs from "fs";
import {id} from "../utils";
import InvalidPhoneNumberError from "./InvalidPhoneNumberError";
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
			}],
			purchaser: {
				isVendor: false,
				name: 'Nil McNull',
				phoneNumber: '000-000-0000'
			}
		}, wallet);
	});

	describe("Validity related functions", function () {
		it('should throw an error when trying to create an invoice with an invalid phone number', function () {
			expect(() => new Invoice({
				invoiceNumber: id(),
				products: [],
				purchaser: {
					isVendor: false,
					name: 'Nil McNull',
					phoneNumber: '000-000-000'
				}
			}, wallet)).toThrow(InvalidPhoneNumberError);
		});

		describe("Validate valid invoices", function () {
			test("Invoice.verifySignature", function () {
				expect(Invoice.verifySignature(wallet.publicKeyPem, invoice)).toBe(true);
			});

			test("Invoice.verifyInv", function () {
				expect(Invoice.verifyInv(invoice.invoice)).toBe(true);
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
					purchaser: {
						isVendor: false,
						name: 'Nil McNull',
						phoneNumber: '000-000-0000'
					}
				};
			});

			test('Invoice.verifySignature', function () {
				expect(Invoice.verifySignature(wallet.publicKeyPem, invoice)).toBe(false);
			});

			describe('Invoice.verifyInv', function () {
				it('should validate invoices with a valid total or phone number', function () {
					expect(Invoice.verifyInv(invoice.invoice)).toBe(true);
				});

				it('should not validate an invoice with an invalid total', function () {
					// @ts-ignore
					// noinspection JSConstantReassignment
					invoice.invoice.totalCost = 100;
					expect(Invoice.verifyInv(invoice.invoice)).toBe(false);
				});

				it('should not validate an invoice with an invalid phone number', function () {
					// @ts-ignore
					// noinspection JSConstantReassignment
					invoice.invoice.purchaser.phoneNumber = "123111111";
					expect(Invoice.verifyInv(invoice.invoice)).toBe(false);
				});
			});

			test("Invoice.verify", function () {
				expect(Invoice.verify(invoice)).toBe(false);
			});
		})
	})
});
