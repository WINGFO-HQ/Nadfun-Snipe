const fs = require("fs");
const config = require("./config");
const logger = require("./logger");

class TokenStorage {
  constructor() {
    this.tokens = this.loadFromFile();
    this.processedTokenIds = new Set();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(config.paths.TOKENS_FILE)) {
        const data = fs.readFileSync(config.paths.TOKENS_FILE, "utf8");
        return JSON.parse(data);
      }
    } catch (err) {
      logger.error(`Error reading tokens file: ${err.message}`);
    }
    return [];
  }

  saveToFile() {
    try {
      fs.writeFileSync(
        config.paths.TOKENS_FILE,
        JSON.stringify(this.tokens, null, 2)
      );
    } catch (err) {
      logger.error(`Error writing tokens file: ${err.message}`);
    }
  }

  addToken(tokenRecord) {
    this.tokens.push(tokenRecord);
    this.saveToFile();
    this.markAsProcessed(tokenRecord.contract_address);
  }

  removeToken(tokenAddress, walletAddress) {
    this.tokens = this.tokens.filter(
      (r) =>
        r.contract_address.toLowerCase() !== tokenAddress.toLowerCase() ||
        r.wallet_address.toLowerCase() !== walletAddress.toLowerCase()
    );
    this.saveToFile();
  }

  getAllTokenAddresses() {
    return this.tokens.map((r) => r.contract_address.toLowerCase());
  }

  getByWalletAddress(walletAddress) {
    return this.tokens.filter(
      (r) => r.wallet_address.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  hasToken(tokenAddress) {
    const normalizedAddress = tokenAddress.toLowerCase();
    return this.tokens.some(
      (r) => r.contract_address.toLowerCase() === normalizedAddress
    );
  }

  markAsProcessed(tokenAddress) {
    this.processedTokenIds.add(tokenAddress.toLowerCase());
  }

  isProcessed(tokenAddress) {
    return this.processedTokenIds.has(tokenAddress.toLowerCase());
  }
}

module.exports = TokenStorage;
