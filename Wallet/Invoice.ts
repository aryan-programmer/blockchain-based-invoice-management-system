import crypto from "crypto";
import {Invoice as Inv, RecInvoice} from "../BlockChain";
import cloneDeep from "lodash/cloneDeep";
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

	constructor (
		invoice: RecInvoice,
		wallet: Wallet
	) {
		const invoice_ = cloneDeep(invoice) as DeepWriteable<Inv>;
		let totalCost = 0;
		for (const product of invoice_.products) {
			product.cost = roundTo2Decimals(product.cost);
			product.tax = roundTo2Decimals(product.cost * product.taxPercentage / 100);
			product.totalCost = roundTo2Decimals(product.cost + product.tax);
			totalCost += product.totalCost;
		}
		invoice_.totalCost = roundTo2Decimals(totalCost);
		this.invoice = invoice_;
		this.signature = wallet.sign(
			invoice_.invoiceNumber,
			...invoice_.products.map(value => JSON.stringify(value)),
			invoice_.totalCost.toString()
		);
		this.publicKey = wallet.publicKeyPem;
		deepFreeze(this);
	}

	static verify (publicKey: string, invoice: Inv, signature: string): boolean {
		const verifier = crypto.createVerify("sha512");
		verifier.update(invoice.invoiceNumber);
		for (const product of invoice.products) {
			verifier.update(JSON.stringify(product));
		}
		verifier.update(invoice.totalCost.toString());
		return verifier.verify(publicKey, signature, "hex");
	}
}
