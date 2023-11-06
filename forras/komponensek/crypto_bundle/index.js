export const crypto = require('crypto-browserify');
export const Buffer = require('buffer').Buffer;

export function hash_keszites(szoveg) {
    const hash = crypto.createHash('sha256');
    hash.update(szoveg);
    return hash.digest('hex');
}