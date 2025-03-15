// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DocumentValidator
 * @dev Contract to store and verify document hashes on the blockchain.
 */
contract DocumentValidator {
    // Mapping to store document hashes (true if stored, false otherwise)
    mapping(string => bool) public documentHashes;

    /**
     * @dev Stores a document hash on the blockchain.
     * @param documentHash The hash of the document to be stored.
     * @notice The hash must not already exist in the mapping.
     */
    function storeDocumentHash(string memory documentHash) public {
        require(!documentHashes[documentHash], "Hash-ul este deja stocat!");
        documentHashes[documentHash] = true;
    }

    /**
     * @dev Verifies if a document hash exists in the contract.
     * @param documentHash The hash of the document to check.
     * @return A boolean indicating whether the document hash exists.
     */
    function verifyDocument(string memory documentHash) public view returns (bool) {
        return documentHashes[documentHash];
    }
}
