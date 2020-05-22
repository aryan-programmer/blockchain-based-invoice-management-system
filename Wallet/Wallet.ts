import crypto from "crypto";
import {Invoice, InvoicePool, RecInv} from ".";
import {freezeClass} from "../freeze";

@freezeClass
export default class Wallet {
	public readonly publicKeyPem: string;

	constructor (
		public readonly publicKey: crypto.KeyObject,
		public readonly privateKey: crypto.KeyObject,
	) {
		this.publicKeyPem = publicKey.export({format: "pem", type: "spki"}).toString();
		Object.freeze(this);
	}

	sign (...args: string[]): string {
		const signer = crypto.createSign("sha512");
		for (const arg of args) {
			signer.update(arg);
		}
		return signer.sign(this.privateKey, "hex");
	}

	addInvoiceToPool (pool: InvoicePool, invoice: RecInv) {
		const invoice_ = new Invoice(invoice, this);
		pool.addInvoice(invoice_);
		return invoice_;
	}
}
