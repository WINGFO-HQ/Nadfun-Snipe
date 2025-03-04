const { ethers } = require("ethers");
const config = require("./config");
const logger = require("./logger");
const ContractManager = require("./contract-manager");
const TokenScanner = require("./token-scanner");
const WalletManager = require("./wallet-manager");

class TokenTrader {
  constructor(signer, tokenStorage) {
    this.signer = signer;
    this.tokenStorage = tokenStorage;
    this.contractManager = new ContractManager(signer);
    this.tokenScanner = new TokenScanner();
    this.walletManager = new WalletManager();
    this.signerAddress = null;
    this.initSigner();
  }

  async initSigner() {
    this.signerAddress = await this.signer.getAddress();
  }

  async buyToken(tokenData, purchaseAmount) {
    const tokenAddress = tokenData.token_info.token_id.toLowerCase();

    if (
      this.tokenStorage.hasToken(tokenAddress) ||
      this.tokenStorage.isProcessed(tokenAddress)
    ) {
      return false;
    }

    const routerContract = this.contractManager.getRouterContract();

    const amountIn = purchaseAmount;
    const amountOutMin = 0;
    const fee = purchaseAmount.mul(config.DEFAULT_FEE_PERCENT).div(100);
    const to = this.signerAddress;
    const deadline =
      Math.floor(Date.now() / 1000) + config.TX_DEADLINE_HOURS * 3600;
    const totalValue = amountIn.add(fee);

    const randomGasLimit = this.walletManager.getRandomGasLimit(
      config.gas.BUY_GAS_LIMIT_MIN,
      config.gas.BUY_GAS_LIMIT_MAX
    );
    const adjustedFee = await this.walletManager.getAdjustedGasFee();

    try {
      logger.info(
        `Buying token ${tokenAddress} for ${ethers.utils.formatEther(
          amountIn
        )} MON...`
      );

      const tx = await routerContract.protectBuy(
        amountIn,
        amountOutMin,
        fee,
        tokenAddress,
        to,
        deadline,
        {
          value: totalValue,
          gasLimit: randomGasLimit,
          maxFeePerGas: adjustedFee,
          maxPriorityFeePerGas: adjustedFee,
        }
      );

      logger.info(
        `Buy transaction sent: ${config.chain.TX_EXPLORER}${tx.hash}`
      );
      const receipt = await tx.wait();
      logger.success(
        `Buy transaction confirmed in block ${receipt.blockNumber}`
      );

      await this.contractManager.approveRouter(tokenAddress);

      const record = {
        contract_address: tokenAddress,
        wallet_address: this.signerAddress,
        bought_at: Math.floor(Date.now() / 1000),
        bought_at_price: tokenData.token_info.price,
        symbol: tokenData.token_info.symbol,
        name: tokenData.token_info.name,
      };

      this.tokenStorage.addToken(record);
      return true;
    } catch (error) {
      logger.error(`Error buying token: ${error.message}`);
      this.tokenStorage.markAsProcessed(tokenAddress);
      return false;
    }
  }

  async sellToken(tokenAddress) {
    try {
      const tokenContract = this.contractManager.getTokenContract(tokenAddress);
      const routerContract = this.contractManager.getRouterContract();

      const balance = await tokenContract.balanceOf(this.signerAddress);
      if (balance.lte(0)) {
        logger.info(`No balance to sell for token ${tokenAddress}`);
        return false;
      }

      if (!(await this.contractManager.approveRouter(tokenAddress))) {
        return false;
      }

      let symbol = "UNKNOWN";
      try {
        symbol = await tokenContract.symbol();
      } catch (e) {}

      const amountIn = balance;
      const amountOutMin = 0;
      const to = this.signerAddress;
      const deadline =
        Math.floor(Date.now() / 1000) + config.TX_DEADLINE_HOURS * 3600;

      const gasLimit = config.gas.SELL_GAS_LIMIT;
      const adjustedFee = await this.walletManager.getAdjustedGasFee();

      logger.info(
        `Selling ${ethers.utils.formatEther(balance)} ${symbol} tokens...`
      );

      const tx = await routerContract.protectSell(
        amountIn,
        amountOutMin,
        tokenAddress,
        to,
        deadline,
        {
          gasLimit: gasLimit,
          maxFeePerGas: adjustedFee,
          maxPriorityFeePerGas: adjustedFee,
        }
      );

      logger.info(
        `Sell transaction sent: ${config.chain.TX_EXPLORER}${tx.hash}`
      );
      const receipt = await tx.wait();
      logger.success(
        `Sell transaction confirmed in block ${receipt.blockNumber}`
      );

      this.tokenStorage.removeToken(tokenAddress, this.signerAddress);

      return true;
    } catch (error) {
      logger.error(`Error selling token: ${error.message}`);
      return false;
    }
  }

  async checkAndSellByPrice() {
    if (!this.signerAddress) {
      this.signerAddress = await this.signer.getAddress();
    }

    const tokensBought = this.tokenStorage.getByWalletAddress(
      this.signerAddress
    );

    if (tokensBought.length === 0) return;

    for (const record of tokensBought) {
      try {
        const tokenPriceData = await this.tokenScanner.getTokenPrice(
          record.contract_address
        );

        if (!tokenPriceData) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeSincePurchase = currentTime - record.bought_at;

          if (timeSincePurchase > 3600) {
            logger.warn(
              `${
                record.symbol || record.contract_address
              } held for 1+ hour with no price data.`
            );
          }
          continue;
        }

        let currentPrice = 0;
        if (typeof tokenPriceData.price === "string") {
          currentPrice = parseFloat(tokenPriceData.price);
        } else {
          currentPrice = tokenPriceData.price;
        }

        const boughtPrice = parseFloat(record.bought_at_price);
        const profitThreshold = boughtPrice * (1 + config.TAKE_PROFIT / 100);
        const lossThreshold = boughtPrice * (1 - config.STOP_LOSS / 100);

        if (currentPrice >= profitThreshold) {
          logger.success(
            `${record.symbol || "Token"} reached TP (${
              config.TAKE_PROFIT
            }%). Current: ${currentPrice}, Bought: ${boughtPrice}`
          );
          await this.sellToken(record.contract_address);
        } else if (currentPrice <= lossThreshold) {
          logger.warn(
            `${record.symbol || "Token"} reached SL (${
              config.STOP_LOSS
            }%). Current: ${currentPrice}, Bought: ${boughtPrice}`
          );
          await this.sellToken(record.contract_address);
        }
      } catch (err) {
        logger.error(`Error checking price for ${record.contract_address}`);
      }
    }
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = TokenTrader;
