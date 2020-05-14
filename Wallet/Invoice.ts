import crypto from "crypto";
import cloneDeep from "lodash/cloneDeep";
import {Invoice as Inv, RecInvoice} from "../BlockChain";
import {freezeClass} from "../freeze";
import {deepFreeze, DeepWriteable} from "../utils";
import Wallet from "./Wallet";

function roundTo2Decimals (value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

@freezeClass
export default class Invoice {
	public readonly invoice: Inv;
	public readonly signature: string;
	public readonly publicKey: string;

	constructor (a: RecInvoice | Invoice, b: Wallet | true) {
		if (b === true) {
			const invoice_ = a as Invoice;
			this.invoice   = invoice_.invoice;
			this.signature = invoice_.signature;
			this.publicKey = invoice_.publicKey;
		} else {
			const invoice_ = cloneDeep(a) as DeepWriteable<Inv>;
			let totalCost  = 0;
			for (const product of invoice_.products) {
				product.cost      = roundTo2Decimals(product.cost);
				product.tax       = roundTo2Decimals(product.cost * product.taxPercentage / 100);
				product.totalCost = roundTo2Decimals(product.cost + product.tax);
				totalCost += product.totalCost;
			}
			invoice_.totalCost = roundTo2Decimals(totalCost);
			this.invoice       = invoice_;
			this.signature     = b.sign(
				JSON.stringify(invoice_),
				b.publicKeyPem
			);
			this.publicKey     = b.publicKeyPem;
		}
		deepFreeze(this);
	}

	static verifySignature (publicKey: string, invoice: Inv, signature: string): boolean {
		const verifier = crypto.createVerify("sha512");
		verifier.update(JSON.stringify(invoice));
		verifier.update(publicKey);
		return verifier.verify(publicKey, signature, "hex");
	}

	static verifyTotal (invoice: Inv) {
		let totalCost = 0;
		for (const product of invoice.products) {
			if (product.tax !== roundTo2Decimals(product.cost * product.taxPercentage / 100)) return false;
			if (product.totalCost !== roundTo2Decimals(product.cost + product.tax)) return false;
			totalCost += product.totalCost;
		}
		if (invoice.totalCost !== roundTo2Decimals(totalCost)) return false;
		// noinspection RedundantIfStatementJS
		if (invoice.totalCost !== roundTo2Decimals(totalCost)) return false;
		return true;
	}

	static verify({publicKey, invoice, signature}: Invoice): boolean{
		return Invoice.verifyTotal(invoice) && Invoice.verifySignature(publicKey, invoice, signature);
	}
}
