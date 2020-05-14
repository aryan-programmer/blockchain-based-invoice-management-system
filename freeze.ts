export function freezeClass (constructor: Function) {
	Object.freeze(constructor);
	Object.freeze(constructor.prototype);
}
