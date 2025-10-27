require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");
require("./tasks/deploy-fundMe");
require("./tasks/interact-fundMe");
//require("./tasks");
require("dotenv").config();
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const SEPOLIA_PRIVATE_KEY2 = process.env.SEPOLIA_PRIVATE_KEY2;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: 'hardhat', //hardhat本地网络，合约部署一次就消失，local，本地网络，合约部署一次，一直存在
  mocha:{
    timeout: 300000,
  },
  gasReporter:{
    enabled: true,
  },
  networks: {
    sepolia:{
      url:SEPOLIA_URL,
      accounts:[SEPOLIA_PRIVATE_KEY,SEPOLIA_PRIVATE_KEY2],
      chainId: 11155111,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY
  },
  namedAccounts:{
    firstAccount:{
      default: 0,
    },
    secondAccount:{
      default: 1,
    },
  } 
};
