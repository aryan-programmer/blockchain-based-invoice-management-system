export default function frozen(constructor: Function) {
	Object.freeze(constructor);
	Object.freeze(constructor.prototype);
}
