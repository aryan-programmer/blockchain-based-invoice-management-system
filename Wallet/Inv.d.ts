import {DeepReadonly} from "../utils";

export type RecProduct = {
	name: string,
	quantity: string,
	cost: number,
	taxPercentage: number
};

export type RecInv = {
	invoiceNumber: string,
	products: RecProduct[],
	purchaser: Purchaser
};

export type Purchaser = {
	phoneNumber: string,
	name: string,
	isVendor: boolean
};

export type Product = DeepReadonly<RecProduct & {
	tax: number,
	totalCost: number,
}>;

export type Inv = DeepReadonly<{
	invoiceNumber: string,
	products: Product[],
	totalCost: number,
	purchaser: Purchaser
}>;
