const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

function getAddress(publicKey) {
  return keccak256(publicKey.slice(1)).slice(-20);
}

const privateKey = secp.utils.randomPrivateKey();

console.log("prviate key:", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log("public key:", toHex(getAddress(publicKey)));
