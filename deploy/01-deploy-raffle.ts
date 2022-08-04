import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import verify from "../utils/verify"

const VRF_SUB_FUND_AMOUNT = "2000000000000000000000"

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId!
    let vrfCoordinatorV2Address, subscriptionId

    // Set up vrfCoordinatorV2Address and subscriptionId
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]!
        subscriptionId = networkConfig[chainId]["subscriptionId"]!
    }

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const args: any[] = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[network.config.chainId!]["keyHash"],
        networkConfig[network.config.chainId!]["callbackGasLimit"],
        networkConfig[network.config.chainId!]["raffleEntranceFee"],
        networkConfig[network.config.chainId!]["keepersUpdateInterval"],
    ]

    // Deploy Contract
    log(`Deploying Raffle and waiting for confirmations...`)
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations || 2,
    })
    log(`Raffle deployed at ${raffle.address}`)
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContractAt(
            "VRFCoordinatorV2Mock",
            vrfCoordinatorV2Address
        )
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
        log("Consumer is added")
    }
    log("----------------------------------------------------")

    // Verify Contract on EtherScan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying contract...")
        await verify(raffle.address, args)
        log("----------------------------------------------------")
    }
}

export default deployRaffle
deployRaffle.tags = ["all", "raffle"]
