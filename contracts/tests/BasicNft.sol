// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract BasicNft is ERC721 {
    string public constant NAME = 'Dogies';
    string public constant SYMBOL = 'DOGS';
    string public constant TOKEN_URI =
        'ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json';
    uint public tokenCounter = 0;

    event NftMinted(uint indexed id, address indexed minter);

    constructor() ERC721(NAME, SYMBOL) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function tokenURI(
        uint /* tokenId */
    ) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function mintNft() public returns (uint id) {
        id = tokenCounter;
        tokenCounter = tokenCounter + 1;

        _safeMint(msg.sender, id);

        emit NftMinted(id, msg.sender);
    }
}
