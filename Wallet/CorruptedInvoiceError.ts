import {freezeClass} from "../freeze";

@freezeClass
export default class CorruptedInvoiceError extends Error {
	constructor (message: string) {
		super(message);
		this.name = "CorruptedInvoiceError";
	}
}
