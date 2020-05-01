export type RecProduct = {
	name: string,
	quantity: string,
	cost: number,
	taxPercentage: number
};

export type RecInvoice = {
	invoiceNumber: string,
	products: RecProduct[],
};

export type Product = RecProduct & {
	tax: number,
	totalCost: number,
};

export type Invoice = {
	invoiceNumber: string,
	products: Product[],
	totalCost: number,
};
