class Logger {
  static info(message) {
    console.log(`[*] ${message}`);
  }

  static success(message) {
    console.log(`[+] ${message}`);
  }

  static warn(message) {
    console.log(`[!] ${message}`);
  }

  static error(message) {
    console.log(`[-] ${message}`);
  }

  static fatal(message) {
    console.log(`[/] ${message}`);
  }

  static debug(message) {
    if (process.env.DEBUG === "true") {
      console.log(`[*] ${message}`);
    }
  }

  static showBanner(title, config, options = {}) {
    const line = "=".repeat(50);
    console.log(line);
    console.log(`             ${title}               `);
    console.log(line);

    if (config) {
      if (config.TAKE_PROFIT)
        console.log(`• Take Profit: ${config.TAKE_PROFIT}%`);
      if (config.STOP_LOSS) console.log(`• Stop Loss: ${config.STOP_LOSS}%`);
      if (config.DEFAULT_PURCHASE_AMOUNT) {
        const ethers = require("ethers");
        console.log(
          `• Purchase Amount: ${ethers.utils.formatEther(
            config.DEFAULT_PURCHASE_AMOUNT
          )} MON`
        );
      }
      if (config.MONITOR_DELAY)
        console.log(`• Monitor Delay: ${config.MONITOR_DELAY / 1000}s`);
    }

    if (options.telegramChannels && options.telegramChannels.length > 0) {
      console.log(line);
      console.log("Join our Telegram channels:");
      options.telegramChannels.forEach((channel) => {
        console.log(`• ${channel}`);
      });
    }

    console.log(line);
  }
}

module.exports = Logger;
