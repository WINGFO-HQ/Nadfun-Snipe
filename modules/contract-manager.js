const { ethers } = require("ethers");
const config = require("./config");
const logger = require("./logger");

const ABIS = {
  ERC20: [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)",
    "function symbol() view returns (string)",
  ],

  ROUTER: [
    {
      type: "function",
      name: "protectBuy",
      inputs: [
        { name: "amountIn", type: "uint256", internalType: "uint256" },
        { name: "amountOutMin", type: "uint256", internalType: "uint256" },
        { name: "fee", type: "uint256", internalType: "uint256" },
        { name: "token", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "protectSell",
      inputs: [
        { name: "amountIn", type: "uint256", internalType: "uint256" },
        { name: "amountOutMin", type: "uint256", internalType: "uint256" },
        { name: "token", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ],
};

class ContractManager {
  constructor(signer) {
    this.signer = signer;
  }

  getTokenContract(tokenAddress) {
    return new ethers.Contract(tokenAddress, ABIS.ERC20, this.signer);
  }

  getRouterContract() {
    return new ethers.Contract(
      config.contracts.ROUTER,
      ABIS.ROUTER,
      this.signer
    );
  }

  async approveRouter(tokenAddress) {
    try {
      const tokenContract = this.getTokenContract(tokenAddress);
      const signerAddress = await this.signer.getAddress();

      const currentAllowance = await tokenContract.allowance(
        signerAddress,
        config.contracts.ROUTER
      );

      if (currentAllowance.eq(0)) {
        logger.info(`Approving router for token ${tokenAddress}`);
        const tx = await tokenContract.approve(
          config.contracts.ROUTER,
          ethers.constants.MaxUint256
        );
        await tx.wait();
        logger.success(`Router approved for token ${tokenAddress}`);
      }
      return true;
    } catch (error) {
      logger.error(`Error approving router: ${error.message}`);
      return false;
    }
  }
}

module.exports = ContractManager;
