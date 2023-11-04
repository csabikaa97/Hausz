export const crypto = require('crypto-browserify');
export const Buffer = require('buffer').Buffer;

export function hash_keszites(szoveg) {
    const hash = crypto.createHash('sha256');
    hash.update(szoveg);
    return hash.digest('hex');
}

export function dsa() {
    const plain =  'Hello World';
    const hashKey = crypto.createHash('sha256');
    hashKey.update('14E2E2D1582A36172AE401CB826003C1');
    const key = hashKey.digest('hex').substring(0, 32);
      
    const hashIv = crypto.createHash('sha256');
    hashIv.update('747E314D23DBC624E971EE59A0BA6D28');
    const iv = hashIv.digest('hex').substring(0, 16);
      
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    var encrypted = cipher.update(plain, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    encrypted = Buffer.from(encrypted, 'utf-8').toString('base64');
    console.log(encrypted); // MTZHaEoxb0JYV0dzNnptbEI2UXlPUT09
    
    encrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    var decrypted = decipher.update(encrypted, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    console.log(decrypted); // Hello World
}