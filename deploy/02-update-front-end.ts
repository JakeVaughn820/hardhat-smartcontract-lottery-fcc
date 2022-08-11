import { frontEndContractsFile } from "../helper-hardhat-config"
import fs from "fs"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const updateUI: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { network, ethers } = hre
    const chainId = network.config.chainId!

    console.log(process.env.UPDATE_FRONT_END)
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        const raffle = await ethers.getContract("Raffle")
        const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
        if (chainId in contractAddresses) {
            if (!contractAddresses[network.config.chainId!].includes(raffle.address)) {
                contractAddresses[network.config.chainId!].push(raffle.address)
            }
        } else {
            contractAddresses[chainId] = [raffle.address]
        }
        fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
        console.log("Front end written!")
    }
}
export default updateUI
updateUI.tags = ["all", "frontend"]
