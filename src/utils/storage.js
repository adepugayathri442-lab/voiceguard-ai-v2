/**
 * LocalStorage & Metadata management for Voice Profile and Call History Logs
 * Integrated with IndexedDB for long-term audio blob persistence.
 */

import { deleteAudioBlob, clearAllAudioBlobs } from './indexedDBStorage.js';

const PROFILE_KEY = 'voiceguard_user_profile_v2';
const HISTORY_KEY = 'voiceguard_call_history_v2';

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load voice profile:', err);
    return null;
  }
}

export function saveStoredProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error('Failed to save voice profile:', err);
    return false;
  }
}

export function deleteStoredProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    deleteAudioBlob('profile_reference_audio');
    return true;
  } catch (err) {
    console.error('Failed to remove voice profile:', err);
    return false;
  }
}

export function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load history:', err);
    return [];
  }
}

/**
 * Add a call history entry without overwriting previous calls.
 * Associates call with callerNumber, callId, and audit results.
 */
export function addHistoryEntry(entry) {
  try {
    const history = getStoredHistory();
    // Do NOT overwrite previous calls. Prepend the new call.
    const updated = [entry, ...history].slice(0, 100); // keep up to 100 calls
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to add history entry:', err);
    return [];
  }
}

/**
 * Retrieve all previous calls from a specific phone number
 * @param {string} phoneNumber
 * @returns {Array} calls matching the normalized phone number
 */
export function getCallsByPhoneNumber(phoneNumber) {
  if (!phoneNumber) return [];
  const normalized = phoneNumber.replace(/\s+/g, '').replace(/[-()]/g, '');
  const history = getStoredHistory();
  return history.filter(item => {
    if (!item.callerNumber) return false;
    const itemNorm = item.callerNumber.replace(/\s+/g, '').replace(/[-()]/g, '');
    return itemNorm === normalized;
  });
}

export function clearStoredHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    clearAllAudioBlobs();
    return true;
  } catch (err) {
    console.error('Failed to clear history:', err);
    return false;
  }
}

export function removeHistoryEntry(id) {
  try {
    const history = getStoredHistory();
    const updated = history.filter(item => item.id !== id && item.callId !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    deleteAudioBlob(id);
    return updated;
  } catch (err) {
    console.error('Failed to remove history item:', err);
    return [];
  }
}
