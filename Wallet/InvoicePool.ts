import {freezeClass} from "../freeze";
import Invoice from "./Invoice";

@freezeClass
export default class InvoicePool {
	invoices: Invoice[] = [];

	addInvoice (invoice: Invoice): boolean {
		if (this.invoices.find(
			value => value.invoice.invoiceNumber === invoice.invoice.invoiceNumber
		) == null && Invoice.verify(invoice)) {
			this.invoices.push(invoice);
			return true;
		}
		return false;
	}

	getValidInvoices () {
		return this.invoices.filter(Invoice.verify);
	}

	clear () {
		this.invoices = [];
	}

	addInvoices (invoices: Invoice[]) {
		for (const invoice of invoices) {
			this.addInvoice(invoice);
		}
	}
}
