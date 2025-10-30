// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract HashStore {
    address public admin;
    mapping(uint256 => bytes32) private idHashes;

    event HashStored(uint256 idNumber, bytes32 indexed hash);

    constructor(){
        admin = msg.sender;
    }

    modifier onlyAdmin(){
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    function storeHash(uint256 _idNumber, bytes32 _hash) public onlyAdmin {
        idHashes[_idNumber] = _hash;
        emit HashStored(_idNumber, _hash);
    }

    function getHash(uint256 _idNumber) public view returns (bytes32){
        return idHashes[_idNumber];
    }

    // A simple check function for the Express backend to call.
    function verifyHash(uint256 _idNumber, bytes32 _hash) public view returns (bool){
        return idHashes[_idNumber] == _hash;
    }
}