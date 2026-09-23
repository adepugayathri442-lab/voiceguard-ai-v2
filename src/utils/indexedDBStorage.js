/**
 * Native IndexedDB storage for persistent audio recordings and biometric audio samples
 * Prevents localStorage quota overflow (5MB limit) and audio loss on page reloads.
 */

const DB_NAME = 'VoiceGuardDB';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio_recordings';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported in this browser.');
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      resolve(null);
    };
  });
}

/**
 * Save an audio Blob into IndexedDB
 * @param {string} id - Unique Call ID or sample key
 * @param {Blob} blob - Audio blob
 */
export async function saveAudioBlob(id, blob) {
  if (!id || !blob) return false;
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.put(blob, id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.error('Failed to save audio to IndexedDB:', req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('saveAudioBlob error:', err);
    return false;
  }
}

/**
 * Retrieve an audio Blob from IndexedDB
 * @param {string} id - Unique Call ID or sample key
 * @returns {Promise<Blob|null>}
 */
export async function getAudioBlob(id) {
  if (!id) return null;
  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => {
        console.error('Failed to retrieve audio from IndexedDB:', req.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('getAudioBlob error:', err);
    return null;
  }
}

/**
 * Get a playable object URL for an audio item in IndexedDB
 * @param {string} id
 * @returns {Promise<string|null>}
 */
export async function getAudioObjectUrl(id) {
  const blob = await getAudioBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Delete an audio Blob from IndexedDB
 * @param {string} id
 */
export async function deleteAudioBlob(id) {
  if (!id) return false;
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}

/**
 * Clear all audio blobs from IndexedDB
 */
export async function clearAllAudioBlobs() {
  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    return false;
  }
}
