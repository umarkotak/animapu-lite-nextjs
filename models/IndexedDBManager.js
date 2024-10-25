class IndexedDBManager {
  constructor() {
    this.dbName = "ANIMAPU_OFFLINE_MANGADB";
    this.version = 1;
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('manga_details')) {
          db.createObjectStore('manga_details', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('manga_chapters')) {
          db.createObjectStore('manga_chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chapter_images')) {
          db.createObjectStore('chapter_images', { keyPath: 'id' });
        }
      };
    });
  }

  // Store data in IndexedDB
  async store(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Retrieve data from IndexedDB
  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Delete data from IndexedDB
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export default IndexedDBManager
