// Resilient storage helper for Firefox private browsing and strict privacy modes
const memoryStore = {};

export const safeStorage = {
  getItem(key) {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Access blocked by Firefox private browsing / cookie settings
    }
    return memoryStore[key] !== undefined ? memoryStore[key] : null;
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Blocked by browser security
    }
    memoryStore[key] = String(value);
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Blocked by browser security
    }
    delete memoryStore[key];
  }
};
