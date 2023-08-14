const ENS = artifacts.require("ENS");
const { makeENSData } = require("../makeABI");

module.exports = async function (deployer, network, accounts) {
  if (network == "goerli") {
    console.log(" ");
    console.log("------------- Contract를 배포합니다. --------------");
    console.log(" ");

    await deployer.deploy(ENS);
    const ENSContract = await ENS.deployed();

    makeENSData(ENSContract.address);

    console.log(" ");
    console.log("------------- ABI를 만들었습니다. --------------");

    console.log(" ");
    console.log("------------- Contract 배포가 완료되었습니다. --------------");
  }
};
