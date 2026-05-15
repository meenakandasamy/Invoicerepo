const STORAGE_PREFIX = 'session_part';
const CHUNK_SIZE = 1300;

const SECRET = import.meta.env.VITE_AES_SECRET_KEY;

/* =======================
   Browser Guards
======================= */

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof sessionStorage !== 'undefined' &&
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined'
  );
}

/* =======================
   Crypto Helpers
======================= */

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(SECRET);
  return crypto.subtle.importKey('raw', enc, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(base64: string): ArrayBuffer {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

async function encrypt(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text),
  );

  // ✅ FIX: iv.buffer instead of iv
  return `${toBase64(iv.buffer)}.${toBase64(encrypted)}`;
}

async function decrypt(payload: string): Promise<string> {
  const [ivB64, cipherB64] = payload.split('.');

  const iv = new Uint8Array(fromBase64(ivB64)); // ✅ correct
  const cipher = fromBase64(cipherB64);
  const key = await getKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher,
  );

  return new TextDecoder().decode(decrypted);
}

/* =======================
   PUBLIC API (UNCHANGED)
======================= */

export async function SetSessionCookie(session: Session) {
  if (!isBrowser()) return;

  const json = JSON.stringify(session);
  const totalChunks = Math.ceil(json.length / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const encryptedChunk = await encrypt(chunk);
    sessionStorage.setItem(`${STORAGE_PREFIX}${i + 1}`, encryptedChunk);
  }

  sessionStorage.setItem(`${STORAGE_PREFIX}_count`, totalChunks.toString());
}

export async function GetSessionCookie(): Promise<Session | null> {
  if (!isBrowser()) return null;

  const countStr = sessionStorage.getItem(`${STORAGE_PREFIX}_count`);
  if (!countStr) return null;

  const count = parseInt(countStr, 10);
  if (isNaN(count) || count <= 0) return null;

  let sessionStr = '';

  try {
    for (let i = 0; i < count; i++) {
      const encryptedPart = sessionStorage.getItem(`${STORAGE_PREFIX}${i + 1}`);
      if (!encryptedPart) return null;

      sessionStr += await decrypt(encryptedPart);
    }

    return JSON.parse(sessionStr) as Session;
  } catch (err) {
    console.error('Failed to restore session:', err);
    return null;
  }
}

export function DeleteSessionCookie() {
  if (!isBrowser()) return;

  const countStr = sessionStorage.getItem(`${STORAGE_PREFIX}_count`);
  if (!countStr) return;

  const count = parseInt(countStr, 10);
  if (!isNaN(count)) {
    for (let i = 0; i < count; i++) {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${i + 1}`);
    }
  }

  sessionStorage.removeItem(`${STORAGE_PREFIX}_count`);
}
