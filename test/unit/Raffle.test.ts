import { getNamedAccounts, network, deployments, ethers } from "hardhat"
import { assert, expect } from "chai"
import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types"
import { BigNumber } from "ethers"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", async function () {
          let raffle: Raffle
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
          let deployer: string
          let raffleEntranceFee: BigNumber
          let keepersUpdateInterval: number
          const chainId = network.config.chainId!

          this.beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              keepersUpdateInterval = (await raffle.getKeepersUpdateInterval()).toNumber()
          })

          describe("constructor", async function () {
              it("initializes the raffle correctly", async function () {
                  // Ideally test have 1 assert per "it"
                  assert.equal((await raffle.getRaffleState()).toString(), "0")
                  assert.equal(
                      keepersUpdateInterval.toString(),
                      networkConfig[network.config.chainId!]["keepersUpdateInterval"]
                  )
              })
          })

          describe("enterRaffle", async function () {
              it("reverts when you don't pay enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__NotEnoughETHEntered"
                  )
              })
              it("records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  assert.equal(await raffle.getPlayer(0), deployer)
              })
              it("emits event RaffleEnter", async () => {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("doesn't allow entrance when raffle is calculating", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [keepersUpdateInterval + 1])
                  await network.provider.send("evm_mine", [])
                  // await network.provider.request({method: "evm_mine", params: []})
                  // pretend to be a chainlink keeper
                  await raffle.performUpkeep([])
                  //   await expect(
                  //       raffle.enterRaffle({ value: raffleEntranceFee })
                  //   ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")
              })
          })
      })
