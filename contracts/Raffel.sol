/*-------------------- Pragmas -----------------------*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*-------------------- Imports -----------------------*/

/*-------------------- Interfaces --------------------*/

/*-------------------- Libraries ---------------------*/

/*-------------------- Errors ------------------------*/

error Raffle__NotEnoughETHEntered();

/*-------------------- Contracts ---------------------*/

/** @title A contract for demonstrating solidity
 *  @author
 *  @notice This contract is to demo the format of a contract
 *  @dev This implements ...
 */
contract Raffle {
    /*-------------------- Type Declarations ---------------------*/

    /*-------------------- State Varibles ------------------------*/
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    /*-------------------- Events --------------------------------*/

    event RaffleEnter(address indexed player);

    /*-------------------- Modifiers -----------------------------*/

    /*-------------------- constructor function -----------------------------*/

    constructor(uint256 entranceFee) {
        i_entranceFee = entranceFee;
    }

    /*-------------------- receive function ---------------------------------*/

    /*-------------------- fallback function --------------------------------*/

    /*-------------------- external functions -------------------------------*/

    /*-------------------- public functions ---------------------------------*/

    function enterRaffle() public payable {
        // require (msg.value >= i_entranceFee, "Not Enough ETH!");
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        s_players.push(payable(msg.sender));
        // Emit event
        emit RaffleEnter(msg.sender);
    }

    function pickRandomWinner() public {}

    /*-------------------- internal functions -------------------------------*/

    /*-------------------- private functions --------------------------------*/

    /*-------------------- view / pure functions ----------------------------*/

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address payable) {
        return s_players[index];
    }
}
