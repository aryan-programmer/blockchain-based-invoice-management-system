import {freezeClass} from "../freeze";
import Invoice from "./Invoice";

@freezeClass
export default class InvoicePool {
	invoices: Invoice[] = [];

	addInvoice (invoice: Invoice): Invoice {
		if (this.invoices.find(
			value => value.invoice.invoiceNumber === invoice.invoice.invoiceNumber
		) == null) {
			this.invoices.push(invoice);
		}
		return invoice;
	}
}
