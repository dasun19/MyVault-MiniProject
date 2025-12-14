// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashRegistry {

    // identityId (e.g. NIC hash / DID) → latest hash
    mapping(bytes32 => bytes32) public latestHash;

    // hash → timestamp
    mapping(bytes32 => uint256) public hashTimestamp;

    // hash → revoked
    mapping(bytes32 => bool) public revoked;

    // --- Store FIRST hash ---
    function storeInitialHash(bytes32 identityId, bytes32 hash) public {
        require(latestHash[identityId] == bytes32(0), "Identity already exists");
        require(hashTimestamp[hash] == 0, "Hash already stored");

        latestHash[identityId] = hash;
        hashTimestamp[hash] = block.timestamp;
    }

    // --- UPDATE hash (revoke old, add new) ---
    function updateHash(bytes32 identityId, bytes32 newHash) public {
        bytes32 oldHash = latestHash[identityId];
        require(oldHash != bytes32(0), "Identity not found");
        require(hashTimestamp[newHash] == 0, "New hash already stored");

        revoked[oldHash] = true;
        latestHash[identityId] = newHash;
        hashTimestamp[newHash] = block.timestamp;
    }

    // --- Verify ---
    function verify(bytes32 identityId, bytes32 hash) public view returns (bool) {
        return (
            latestHash[identityId] == hash &&
            revoked[hash] == false &&
            hashTimestamp[hash] != 0
        );
    }
}
