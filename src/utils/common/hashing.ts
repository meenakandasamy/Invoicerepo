import { HmacSHA256 } from 'crypto-js';

export function isHashValue(orgValue: string, key: string, hashValue: string): boolean {
    const hashedOrgValue: string = HmacSHA256(orgValue, key).toString();
    return hashedOrgValue == hashValue ? true : false;
}