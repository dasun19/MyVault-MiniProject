// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashRegistry {
    // Store hash => timestamp
    mapping(bytes32 => uint256) public idHashes;

    // Store hash (anyone can call this)
    function storeHash(bytes32 _hash) public {
        require(idHashes[_hash] == 0, "Hash already stored");
        idHashes[_hash] = block.timestamp;
    }

    // Verify hash
    function verifyHash(bytes32 _hash) public view returns (bool) {
        return idHashes[_hash] != 0;
    }

    // Optional: get timestamp of a hash
    function getHashTimestamp(bytes32 _hash) public view returns (uint256) {
        return idHashes[_hash];
    }
}
