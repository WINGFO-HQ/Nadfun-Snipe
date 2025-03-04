const fs = require("fs");
const { ethers } = require("ethers");
const config = require("./config");
const logger = require("./logger");

class WalletManager {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.chain.RPC_URL);
  }

  ensureSetup() {
    if (!fs.existsSync(config.paths.PRIVATE_KEY_FILE)) {
      logger.warn(
        `Creating sample private.key file. Please edit this file with your actual private key.`
      );
      fs.writeFileSync(
        config.paths.PRIVATE_KEY_FILE,
        "YOUR_PRIVATE_KEY_HERE_WITHOUT_0x_PREFIX"
      );
      return false;
    }

    const privateKey = this.readPrivateKey();
    if (privateKey === "YOUR_PRIVATE_KEY_HERE_WITHOUT_0x_PREFIX") {
      logger.error(
        "You need to edit the private.key file with your actual private key"
      );
      return false;
    }

    return true;
  }

  readPrivateKey() {
    try {
      if (!fs.existsSync(config.paths.PRIVATE_KEY_FILE)) {
        throw new Error(
          `Private key file not found: ${config.paths.PRIVATE_KEY_FILE}`
        );
      }
      return fs.readFileSync(config.paths.PRIVATE_KEY_FILE, "utf8").trim();
    } catch (err) {
      logger.error(`Error reading private key: ${err.message}`);
      process.exit(1);
    }
  }

  async getSigner() {
    const privateKey = this.readPrivateKey();
    const signer = new ethers.Wallet(privateKey, this.provider);
    const address = await signer.getAddress();
    return { signer, address };
  }

  async getBalance(address) {
    try {
      return await this.provider.getBalance(address);
    } catch (err) {
      logger.error(`Error getting balance: ${err.message}`);
      return ethers.BigNumber.from(0);
    }
  }

  getRandomGasLimit(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async getAdjustedGasFee() {
    const latestBlock = await this.provider.getBlock("latest");
    return latestBlock.baseFeePerGas.mul(105).div(100);
  }
}

module.exports = WalletManager;
