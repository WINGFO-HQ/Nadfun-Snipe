const { ethers } = require("ethers");
const path = require("path");

const chain = {
  RPC_URL: "https://testnet-rpc.monad.xyz",
  CHAIN_ID: 10143,
  SYMBOL: "MON",
  TX_EXPLORER: "https://testnet.monadexplorer.com/tx/",
  ADDRESS_EXPLORER: "https://testnet.monadexplorer.com/address/",
};

const contracts = {
  ROUTER: "0x822EB1ADD41cf87C3F178100596cf24c9a6442f6",
  FACTORY: "0x822EB1ADD41cf87C3F178100596cf24c9a6442f6",
};

const paths = {
  PRIVATE_KEY_FILE: path.join(__dirname, "..", "private.key"),
  TOKENS_FILE: path.join(__dirname, "..", "sniped_tokens.json"),
};

const api = {
  RECENT_TOKENS:
    "https://testnet-api-server.nad.fun/order/latest_trade?page=1&limit=52",
  TOKEN_PRICE_BASE: "https://testnet-api-server.nad.fun/trade/market/",
};

const trading = {
  TAKE_PROFIT: 20,
  STOP_LOSS: 15,
  DEFAULT_PURCHASE_AMOUNT: ethers.utils.parseUnits("0.5", "ether"),
  DEFAULT_FEE_PERCENT: 1,
  TX_DEADLINE_HOURS: 6,
};

const monitoring = {
  MONITOR_DELAY: 5000,
  PRICE_CHECK_INTERVAL: 2,
  MAX_TOKEN_AGE: 5,
};

const gas = {
  BUY_GAS_LIMIT_MIN: 250000,
  BUY_GAS_LIMIT_MAX: 350000,
  SELL_GAS_LIMIT: 300000,
};

module.exports = {
  chain,
  contracts,
  paths,
  api,

  TAKE_PROFIT: trading.TAKE_PROFIT,
  STOP_LOSS: trading.STOP_LOSS,
  DEFAULT_PURCHASE_AMOUNT: trading.DEFAULT_PURCHASE_AMOUNT,
  DEFAULT_FEE_PERCENT: trading.DEFAULT_FEE_PERCENT,
  TX_DEADLINE_HOURS: trading.TX_DEADLINE_HOURS,

  MONITOR_DELAY: monitoring.MONITOR_DELAY,
  PRICE_CHECK_INTERVAL: monitoring.PRICE_CHECK_INTERVAL,
  MAX_TOKEN_AGE: monitoring.MAX_TOKEN_AGE,

  trading,
  monitoring,
  gas,
};
