import { HardhatRuntimeEnvironment, NetworkConfig } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// import { getNamedAccounts, deployments, network, run } from "hardhat"

import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
// import verify from "../utils/verify"

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations || 6,
    })
}

export default deployRaffle
