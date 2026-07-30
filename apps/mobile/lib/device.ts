import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "device_id";

let cached: string | null = null;

// Generates a reasonably-unique anonymous device id without pulling in a uuid
// dependency. Persisted in SecureStore so it survives app restarts and is used
// to attribute activity (recently viewed / for you) for logged-out users.
const generateId = () => {
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `dev_${Date.now().toString(36)}_${rand()}${rand()}`;
};

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!id) {
      id = generateId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
    }
    cached = id;
    return id;
  } catch {
    // SecureStore failed — fall back to an in-memory id for this session.
    cached = cached || generateId();
    return cached;
  }
}

// Without this, the same device id follows whoever logs in next on this
// device, and mergeActivity() would fold the previous account's guest
// browsing history into the new one.
export async function resetDeviceId(): Promise<void> {
  cached = null;
  await SecureStore.deleteItemAsync(DEVICE_ID_KEY).catch(() => {});
}
