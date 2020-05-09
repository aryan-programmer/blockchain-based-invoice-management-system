export default function freeze(constructor: Function) {
	Object.freeze(constructor);
	Object.freeze(constructor.prototype);
}
