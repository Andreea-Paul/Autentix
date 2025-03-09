// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentValidator {
    mapping(string => bool) public documentHashes;

    function storeDocumentHash(string memory documentHash) public {
        require(!documentHashes[documentHash], "Hash-ul este deja stocat!");
        documentHashes[documentHash] = true;
    }

    function verifyDocument(string memory documentHash) public view returns (bool) {
        return documentHashes[documentHash];
    }
} 