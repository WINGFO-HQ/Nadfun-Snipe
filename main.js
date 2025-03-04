const { ethers } = require("ethers");
const config = require("./modules/config");
const logger = require("./modules/logger");
const TokenStorage = require("./modules/token-storage");
const TokenScanner = require("./modules/token-scanner");
const TokenTrader = require("./modules/token-trader");
const WalletManager = require("./modules/wallet-manager");

async function main() {
  try {
    logger.showBanner("Nadfun Token Sniper", config, {
      telegramChannels: ["https://t.me/infomindao"],
    });

    const walletManager = new WalletManager();
    const tokenStorage = new TokenStorage();

    if (!walletManager.ensureSetup()) {
      logger.error("Please set up your wallet first");
      return;
    }

    const { signer, address } = await walletManager.getSigner();
    logger.info(`Starting sniper with address: ${address}`);

    const balance = await walletManager.getBalance(address);
    logger.info(`Account balance: ${ethers.utils.formatEther(balance)} MON`);

    if (balance.lt(config.DEFAULT_PURCHASE_AMOUNT.mul(2))) {
      logger.warn(
        `Low balance. You need at least ${ethers.utils.formatEther(
          config.DEFAULT_PURCHASE_AMOUNT.mul(2)
        )} MON to snipe effectively`
      );
    }

    const tokenScanner = new TokenScanner();
    const tokenTrader = new TokenTrader(signer, tokenStorage);

    const existingTokens = tokenStorage.getByWalletAddress(address);
    if (existingTokens.length > 0) {
      logger.info(
        `You have ${existingTokens.length} tokens from previous sessions`
      );
      logger.info(`Checking price conditions for existing tokens...`);
      await tokenTrader.checkAndSellByPrice();
    }

    let cycleCount = 0;

    logger.info("Starting token sniper loop...");

    while (true) {
      logger.debug("Searching for tokens to snipe...");

      try {
        const tokensToProcess = await tokenScanner.scanForNewTokens(
          tokenStorage
        );

        if (tokensToProcess.length > 0) {
          const tokenData = tokensToProcess[0];
          const tokenInfo = tokenData.token_info;

          logger.success(
            `New token found! Name: ${tokenInfo.name} (${tokenInfo.symbol})`
          );
          logger.info(
            `Current price: ${tokenInfo.price} MON, Market: ${tokenInfo.market_type}`
          );

          await tokenTrader.buyToken(tokenData, config.DEFAULT_PURCHASE_AMOUNT);
        }
      } catch (error) {
        logger.error(`Error in main loop: ${error.message}`);
      }

      cycleCount++;

      if (cycleCount % config.PRICE_CHECK_INTERVAL === 0) {
        try {
          await tokenTrader.checkAndSellByPrice();
        } catch (err) {
          logger.error(`Error checking prices: ${err.message}`);
        }
      }

      await tokenTrader.delay(config.MONITOR_DELAY);
    }
  } catch (err) {
    logger.fatal(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

main();
