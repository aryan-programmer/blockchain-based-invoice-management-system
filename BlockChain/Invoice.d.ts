import {DeepReadonly} from "../utils";

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

export type Product = DeepReadonly<RecProduct & {
	tax: number,
	totalCost: number,
}>;

export type Invoice = DeepReadonly<{
	invoiceNumber: string,
	products: Product[],
	totalCost: number,
}>;
