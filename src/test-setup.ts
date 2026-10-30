/**
 * Node 26 defines a built-in experimental `localStorage` global that stays
 * `undefined` unless the process is started with `--localstorage-file`. It
 * shadows the working implementation jsdom provides, so anything touching
 * storage (e.g. ThemeService) throws under `ng test`.
 *
 * Restore a minimal in-memory Storage for the test environment only.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (!globalThis[name]) {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, name, { value: storage, configurable: true });
    if (typeof window !== 'undefined' && !window[name]) {
      Object.defineProperty(window, name, { value: storage, configurable: true });
    }
  }
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
