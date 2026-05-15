import { isHashValue } from "./hashing";

export function altSession() {
    const devKey: string | null = sessionStorage.getItem('dev_key');
    const secretKey = import.meta.env.VITE_SESSION_SECRET_KEY;
    const unHashPassword = import.meta.env.VITE_SESSION_ALT_ORG_PASSWORD
    if(!devKey) return sessionStorage.setItem('dev_key','');
    const result = isHashValue(unHashPassword, secretKey, devKey);
    return result;
}