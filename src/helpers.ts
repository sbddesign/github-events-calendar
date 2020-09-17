/**
 * Lowercase the keys of an object
 * REF: https://stackoverflow.com/a/54985484
 */
export function keysToLowercase(obj: {}) {
	let newObj = Object.fromEntries(
		Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
	);
	return newObj;
}
