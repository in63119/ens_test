const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { ADDRESS, PRIVATEKEY, INFURA_KEY } = process.env;
const rpcURL = `https://goerli.infura.io/v3/${INFURA_KEY}`;

const { Web3 } = require("web3");
const web3 = new Web3(rpcURL);

const ENS = require("../data/ENSABI.json");
const ENS_address = ENS.address;
const ENS_abi = ENS.abi;
const ENS_contract = new web3.eth.Contract(ENS_abi, ENS_address).methods;

/*
    컨트랙트 함수 사용(whatToUse: 등록 or 확인)

    checkName: 확인할 이름

    nameToRegister: 등록할 이름
    addressToRegister: 등록할 주소
*/
const checkName = "higih.eth"; // 확인할 이름

const nameToRegister = "higih.eth"; // 등록할 이름
const addressToRegister = "0x05Fa061F7E820d69AfE26559822044d6E84089a5"; // 등록할 주소

// '확인' or '등록'
const whatToUse = "확인";
// const whatToUse = "등록";

const checkAddress = async () => {
  const contractMethod = await ENS_contract.resolve(checkName).encodeABI();

  const result = await web3.eth.call({
    to: ENS_address,
    data: contractMethod,
  });

  if (
    result ===
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    console.log("해당하는 주소가 없습니다.");
  } else {
    console.log(`${checkName}의 해당하는 주소는 ${addressToRegister} 입니다.`);
    console.log("result : ", result);
  }
};

const register = async () => {
  const contractMethod = await ENS_contract.register(
    nameToRegister,
    addressToRegister
  ).encodeABI();

  const estimate = await ENS_contract.register(
    nameToRegister,
    addressToRegister
  ).estimateGas({
    to: ENS_address,
  });
  const gas = await web3.utils.toHex(estimate);

  const SendTransaction = async (data, to) => {
    await web3.eth.accounts
      .signTransaction(
        {
          from: ADDRESS,
          to: to,
          gasPrice: await web3.eth.getGasPrice(),
          gas: gas,
          value: "0x0",
          data: data,
        },
        PRIVATEKEY
      )
      .then(async (Tx) => {
        await web3.eth
          .sendSignedTransaction(Tx.rawTransaction)
          .then((hash, err) => {
            if (err) {
              console.log(err);
            } else {
              console.log(hash, "success!");
            }
          });
      });
  };

  //   console.log("gasPrice : ", await web3.eth.getGasPrice());
  await SendTransaction(contractMethod, ENS_address);
};

if (whatToUse === "확인") {
  console.log("등록된 주소를 확인합니다.");
  checkAddress();
} else if (whatToUse === "등록") {
  console.log("주소를 등록합니다.");
  register();
}
