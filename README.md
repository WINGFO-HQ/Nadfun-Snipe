# Nadfun Token Sniper

A modular automated token sniper for the Monad testnet. This application automatically detects newly launched tokens, purchases them, and implements take profit and stop loss strategies.

## Features

- **Automatic Token Detection**: Monitors the Monad testnet for newly launched tokens
- **Instant Buying**: Automatically purchases new tokens with configurable amounts
- **Take Profit & Stop Loss**: Implements automatic selling based on price movements
- **Modular Design**: Clean code architecture for easy maintenance and extensibility
- **Error Handling**: Robust error handling for API and network issues
- **Transaction Management**: Handles gas pricing and transaction submissions

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/WINGFO-HQ/Nadfun-Snipe.git
   cd Nadfun-Snipe
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Edit `private.key` file in the root directory with your wallet's private key.

## Configuration

All configuration settings are in `modules/config.js`:

- **Trading Parameters**:

  - `TAKE_PROFIT`: Percentage gain for automatic selling (default: 10%)
  - `STOP_LOSS`: Percentage loss for automatic selling (default: 10%)
  - `DEFAULT_PURCHASE_AMOUNT`: Amount to spend per token (default: 1 MON)

- **Monitoring Parameters**:

  - `MONITOR_DELAY`: Time between checks for new tokens (default: 5 seconds)
  - `PRICE_CHECK_INTERVAL`: Frequency of price checks for owned tokens
  - `MAX_TOKEN_AGE`: Maximum age (in seconds) to consider a token as "new"

- **Gas Parameters**:
  - `BUY_GAS_LIMIT_MIN/MAX`: Gas limit range for buy transactions
  - `SELL_GAS_LIMIT`: Gas limit for sell transactions

## Usage

Start the application:

```bash
node main.js
```

The application will:

1. Load your wallet from the private key
2. Start monitoring for new token launches
3. Automatically purchase new tokens as they are detected
4. Monitor token prices and sell according to your take profit/stop loss settings

## Project Structure

- `main.js`: Application entry point
- `modules/`:
  - `config.js`: Configuration settings
  - `logger.js`: Simple logging utility
  - `contract-manager.js`: Smart contract interaction
  - `token-scanner.js`: Monitors for new token launches
  - `token-storage.js`: Manages token storage and persistence
  - `token-trader.js`: Handles buying and selling logic
  - `wallet-manager.js`: Manages wallet operations

## Important Notes

- **Minimum Purchase**: The minimum purchase amount is 1 MON. Lower amounts may not work due to contract restrictions.
- **Error Handling**: The application handles common errors such as missing price data for new tokens.
- **API Issues**: Some tokens may temporarily show "no rows returned" errors due to API indexing delays.
- **Price Delay**: There can be a delay between token purchase and price data availability.

## Customization

### Changing Purchase Amount

Edit `DEFAULT_PURCHASE_AMOUNT` in `config.js`:

```javascript
DEFAULT_PURCHASE_AMOUNT: ethers.utils.parseUnits("0.5", "ether"), // 0.5 MON
```

### Modifying Take Profit/Stop Loss

Adjust `TAKE_PROFIT` and `STOP_LOSS` in `config.js`:

```javascript
TAKE_PROFIT: 20, // 20%
STOP_LOSS: 15, // 15%
```

## Debugging

Set the DEBUG environment variable to enable debug logs:

```bash
DEBUG=true node main.js
```

## Disclaimer

This software is for educational purposes only. Trading cryptocurrencies carries a high level of risk, and may not be suitable for all investors. Before deciding to trade cryptocurrency you should carefully consider your investment objectives, level of experience, and risk appetite.

## License

MIT
