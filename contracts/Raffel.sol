/*-------------------- Pragmas -----------------------*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*-------------------- Imports -----------------------*/

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/*-------------------- Interfaces --------------------*/

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/*-------------------- Libraries ---------------------*/

/*-------------------- Errors ------------------------*/

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();

/*-------------------- Contracts ---------------------*/

/** @title A contract for demonstrating solidity
 *  @author
 *  @notice This contract is to demo the format of a contract
 *  @dev This implements ...
 */
contract Raffle is VRFConsumerBaseV2 {
    /*-------------------- Type Declarations ---------------------*/

    /*-------------------- State Varibles ------------------------*/

    // VRF Varibles
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    // Lottery Variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    address private s_recentWinner;

    /*-------------------- Events --------------------------------*/

    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /*-------------------- Modifiers -----------------------------*/

    /*-------------------- constructor function -----------------------------*/

    constructor(
        address vrfCoordinator,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 entranceFee
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_entranceFee = entranceFee;
    }

    /*-------------------- receive function ---------------------------------*/

    /*-------------------- fallback function --------------------------------*/

    /*-------------------- external functions -------------------------------*/

    function requestRandomWinner() external {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

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

    /*-------------------- internal functions -------------------------------*/

    function fulfillRandomWords(
        uint256, /*requestId*/
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /*-------------------- private functions --------------------------------*/

    /*-------------------- view / pure functions ----------------------------*/

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address payable) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
}
