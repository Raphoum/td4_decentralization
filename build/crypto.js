"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsaDecrypt = exports.rsaEncrypt = exports.importPubKey = exports.exportPubKey = exports.generateRsaKeyPair = void 0;
const crypto_1 = require("crypto");
function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString("base64");
}
function base64ToArrayBuffer(base64) {
    return Buffer.from(base64, "base64").buffer;
}
async function generateRsaKeyPair() {
    const keyPair = await crypto_1.webcrypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
    }, true, ["encrypt", "decrypt"]);
    return keyPair;
}
exports.generateRsaKeyPair = generateRsaKeyPair;
async function exportPubKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey("spki", key);
    return arrayBufferToBase64(exported);
}
exports.exportPubKey = exportPubKey;
async function importPubKey(strKey) {
    const binaryKey = base64ToArrayBuffer(strKey);
    return await crypto_1.webcrypto.subtle.importKey("spki", binaryKey, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
}
exports.importPubKey = importPubKey;
async function rsaEncrypt(b64Data, strPublicKey) {
    const publicKey = await importPubKey(strPublicKey);
    const encrypted = await crypto_1.webcrypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, base64ToArrayBuffer(b64Data));
    return arrayBufferToBase64(encrypted);
}
exports.rsaEncrypt = rsaEncrypt;
async function rsaDecrypt(data, privateKey) {
    const decrypted = await crypto_1.webcrypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, base64ToArrayBuffer(data));
    return Buffer.from(decrypted).toString();
}
exports.rsaDecrypt = rsaDecrypt;
