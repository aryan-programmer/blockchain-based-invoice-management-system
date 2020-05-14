import crypto from "crypto";
import {RecInvoice} from "../BlockChain";
import {freezeClass} from "../freeze";
import Invoice from "./Invoice";
import InvoicePool from "./InvoicePool";

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

	addInvoiceToPool (pool: InvoicePool, invoice: RecInvoice) {
		return pool.addInvoice(new Invoice(invoice, this));
	}
}
