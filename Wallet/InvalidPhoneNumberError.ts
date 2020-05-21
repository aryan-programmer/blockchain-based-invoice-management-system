import {freezeClass} from "../freeze";

@freezeClass
export default class InvalidPhoneNumberError extends Error {
	constructor (message: string) {
		super(message);
		this.name = "InvalidPhoneNumberError";
	}
}
