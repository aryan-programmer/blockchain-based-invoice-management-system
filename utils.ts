export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

export function deepFreeze(object: any) {
	let propNames = Object.getOwnPropertyNames(object);
	for (let name of propNames) {
		let value = object[name];
		if(value && typeof value === "object") {
			deepFreeze(value);
		}
	}
	return Object.freeze(object);
}

export const initialDifficulty = 5;
export const minDifficulty = 2;
const mineRate = 1000;
export function getNewDifficulty (currentDifficulty: number, mineStartTimestamp: number): number {
	return Math.max(currentDifficulty + (mineStartTimestamp + mineRate > Date.now() ? +1 : -1), minDifficulty);
}
