import crypto from "crypto";
import cloneDeep from "lodash/cloneDeep";
import {Inv, RecInv} from "./Inv";
import {freezeClass} from "../freeze";
import {deepFreeze, DeepReadonly, DeepWriteable} from "../utils";
import Wallet from "./Wallet";

function roundTo2Decimals (value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

@freezeClass
export default class Invoice {
	public readonly invoice: Inv;
	public readonly timestamp: string;
	public readonly signature: string;
	public readonly publicKey: string;

	constructor (a: DeepReadonly<RecInv> | Invoice, b: Wallet | true) {
		if (b === true) {
			const invoice_ = cloneDeep(a) as Invoice;
			this.invoice   = invoice_.invoice;
			this.timestamp = invoice_.timestamp;
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
			this.timestamp     = Date.now().toString();
			this.signature     = b.sign(
				JSON.stringify(invoice_),
				this.timestamp,
				b.publicKeyPem,
			);
			this.publicKey     = b.publicKeyPem;
		}
		deepFreeze(this);
	}

	static verifySignature (publicKey: string, invoice: Invoice): boolean {
		const verifier = crypto.createVerify("sha512");
		verifier.update(JSON.stringify(invoice.invoice));
		verifier.update(invoice.timestamp);
		verifier.update(invoice.publicKey);
		return verifier.verify(publicKey, invoice.signature, "hex");
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

	static verify (invoice: Invoice): boolean {
		return Invoice.verifyTotal(invoice.invoice) && Invoice.verifySignature(invoice.publicKey, invoice);
	}
}
