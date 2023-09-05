require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const { KLAYTN_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    klaytn: {
      url: KLAYTN_URL || "",
      accounts: [PRIVATE_KEY],
    },
  },
};
