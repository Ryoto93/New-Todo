export function getItem<T>(key: string): T | null {
	try {
		const item = window.localStorage.getItem(key);
		return item ? (JSON.parse(item) as T) : null;
	} catch (error) {
		console.error(`Error reading localStorage key "${key}":`, error);
		return null;
	}
}

export function setItem<T>(key: string, value: T): void {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error setting localStorage key "${key}":`, error);
	}
} 