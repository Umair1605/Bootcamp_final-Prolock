require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
let secret = require("./secret")
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  // solidity: "0.8.4",
  // networks: {
  //    ropsten: {
  //      url: secret.url,
  //      accounts: [secret.key]
  //    },
  // },
};