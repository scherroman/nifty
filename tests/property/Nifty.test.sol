// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import '../../contracts/Nifty.sol';

contract NiftyTest is Nifty {
    function echidna_numberOfListings_is_always_at_or_above_zero()
        public
        view
        returns (bool)
    {
        return numberOfListings >= 0;
    }

    function echidna_seller_proceeds_is_always_at_or_less_than_contract_balance()
        public
        view
        returns (bool)
    {
        return proceeds[msg.sender] <= address(this).balance;
    }
}
