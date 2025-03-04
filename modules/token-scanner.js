const axios = require("axios");
const config = require("./config");
const logger = require("./logger");

class TokenScanner {
  constructor() {
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      Origin: "https://testnet.nad.fun",
      Reffer: "https://testnet.nad.fun/",
      "Sec-Fetch-Site": "same-site",
    };
  }

  async getRecentLaunchedTokens() {
    try {
      const response = await axios.get(config.api.RECENT_TOKENS, {
        headers: this.headers,
      });
      if (response.status === 200 && response.data.order_token) {
        return response.data.order_token;
      } else {
        throw new Error(`Unexpected response: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error getting recent tokens: ${error.message}`);
      return [];
    }
  }

  async getTokenPrice(tokenAddress, retries = 3, baseDelay = 2000) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const url = `${config.api.TOKEN_PRICE_BASE}${tokenAddress}`;

        const response = await axios.get(url, {
          headers: this.headers,
          timeout: 10000,
        });

        if (response.status === 200 && response.data) {
          return response.data;
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (axiosError) {
        if (
          axiosError.response &&
          axiosError.response.data &&
          axiosError.response.data.error &&
          axiosError.response.data.error.includes("no rows returned by a query")
        ) {
          return null;
        }

        if (attempt < retries - 1) {
          const delay =
            baseDelay * Math.pow(2, attempt) * (0.7 + Math.random() * 0.6);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          return null;
        }
      }
    }
    return null;
  }

  filterRecentTokens(orderTokens) {
    const currentTime = Math.floor(Date.now() / 1000);
    return orderTokens.filter((item) => {
      const createdAt = item.token_info.created_at;
      return currentTime - createdAt <= config.MAX_TOKEN_AGE;
    });
  }

  async scanForNewTokens(tokenStorage) {
    const orderTokens = await this.getRecentLaunchedTokens();
    const recentTokens = this.filterRecentTokens(orderTokens);

    if (recentTokens.length > 0) {
      return recentTokens.filter((tokenData) => {
        const tokenId = tokenData.token_info.token_id.toLowerCase();
        return (
          !tokenStorage.hasToken(tokenId) && !tokenStorage.isProcessed(tokenId)
        );
      });
    }
    return [];
  }
}

module.exports = TokenScanner;
