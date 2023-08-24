const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { ADDRESS, PRIVATEKEY, RPC_URL, ACCESS_KEY, SECRET_ACCESS_KEY } =
  process.env;

const axios = require("axios");

const Caver = require("caver-js");
const caver = new Caver(RPC_URL);

const KNS = require("../data/KNSABI.json");
const KNS_address = KNS.address;
const KNS_abi = KNS.abi;
const KNS_contract = new caver.klay.Contract(KNS_abi, KNS_address).methods;

/*
  사용 변수 명칭
  - checkName: 확인할 이름
  - checkAddress: 확인할 주소

  - nameToRegister: 등록할 이름
  - addressToRegister: 등록할 주소
*/
const checkName = "insu"; // 확인할 이름
const checkAddress = "0xf9E245E02aCafc6d282537d8245e7894aaB53848"; // 확인할 주소

const nameToRegister = "insu"; // 등록할 이름(KNS & txtRecord 함께 사용)
const addressToRegister = "0xF959343f3dA502C04423C028816b540cE6af368D"; // 등록할 주소

/*
  컨트랙트 함수 사용
    whatToUse: 
      - 등록 
      - 이름으로 주소 확인
      - 주소로 이름 확인
      - 레코드 등록
      - 레코드 조회
*/
const whatToUse = "등록";
// const whatToUse = "이름으로 주소 확인";
// const whatToUse = "주소로 이름 확인";
// const whatToUse = "레코드 등록";
// const whatToUse = "레코드 조회";

const recordData = {
  avatar: "https://in-nft.s3.ap-northeast-2.amazonaws.com/In_kid.png",
  name: "Lee Insu",
  email: "in63119@gmail.com",
  phone: "010-6669-4106",
  blog: "https://github.com/in63119",
  kid1: { name: "jungha", nft: "uri" },
  kid2: { name: "sujin", nft: "uri" },
};

const check = async (whatToUse) => {
  switch (whatToUse) {
    case "이름으로 주소 확인":
      console.log("등록된 이름으로 주소를 확인합니다.");
      const fromNameToAddress = await KNS_contract.fromNameToAddress(
        checkName
      ).encodeABI();

      try {
        const address = await caver.klay.call({
          to: KNS_address,
          data: fromNameToAddress,
        });
        const result = "0x" + address.slice(26);

        console.log(
          `KNS에 등록된 이름 [${checkName}] 에 해당하는 주소는 [${result}] 입니다.`
        );
      } catch (err) {
        console.error(err);
        console.log("테스트 도중 에러가 발생했습니다. 확인해주세요.");
      }

      break;

    case "주소로 이름 확인":
      console.log("등록된 주소로 이름을 확인합니다.");
      const fromAddressToName = await KNS_contract.fromAddressToName(
        checkAddress
      ).encodeABI();

      try {
        const result = await caver.klay.call({
          to: KNS_address,
          data: fromAddressToName,
        });
        const decodeString = caver.utils.hexToUtf8(result);
        const name = decodeString.slice(32); // 데이터의 32바이트(길이 관련)를 자르고 실제 데이터만 가져옴

        console.log(
          `KNS에 등록된 주소 [${checkAddress}] 에 해당하는 이름은 [${name}] 입니다.`
        );
      } catch (err) {
        console.error(err);
        console.log("테스트 도중 에러가 발생했습니다. 확인해주세요.");
      }

      break;

    case "레코드 조회":
      console.log("등록된 이름으로 레코드를 확인합니다.");

      const checkTxtRecord = await KNS_contract.checkTxtRecord(
        checkName
      ).encodeABI();

      try {
        const hexTxtRecord = await caver.klay.call({
          to: KNS_address,
          data: checkTxtRecord,
        });
        const decodetxtRecord = caver.utils.hexToUtf8(hexTxtRecord);
        const txtRecord = decodetxtRecord.slice(33); // 여긴 주소가 아니라서 33까지 잘라야 하나...

        console.log(
          `KNS에 등록된 이름 [${checkName}] 에 해당하는 텍스트 레코드는 [${txtRecord}] 입니다.`
        );
      } catch (err) {
        console.error(err);
        console.log("테스트 도중 에러가 발생했습니다. 확인해주세요.");
      }

      break;

    default:
      console.log("whatToUse의 명령어를 확인해주세요.");
  }
};

const register = async (whatToUse) => {
  switch (whatToUse) {
    case "등록":
      console.log("주소를 등록합니다.");

      const contractMethod = await KNS_contract.register(
        nameToRegister,
        addressToRegister
      ).encodeABI();

      const estimate = await KNS_contract.register(
        nameToRegister,
        addressToRegister
      ).estimateGas({
        to: KNS_address,
      });

      await SendTransaction(contractMethod, KNS_address, estimate);

      break;

    case "레코드 등록":
      console.log("텍스트 레코드를 등록합니다.");

      const uri = await jsonToPinata(recordData, nameToRegister);
      console.log(`등록자의 정보가 담긴 uri를 생성했습니다. uri: ${uri}`);

      const registerTxtRecord = await KNS_contract.registerTxtRecord(
        nameToRegister,
        uri
      ).encodeABI();

      const txtRecordestimate = await KNS_contract.registerTxtRecord(
        nameToRegister,
        uri
      ).estimateGas({
        to: KNS_address,
      });

      await SendTransaction(registerTxtRecord, KNS_address, txtRecordestimate);
      break;

    default:
      console.log("whatToUse의 명령어를 확인해주세요.");
  }
};

const SendTransaction = async (data, to, estimate) => {
  await caver.klay.accounts
    .signTransaction(
      {
        from: ADDRESS,
        to: to,
        gasPrice: await caver.klay.getGasPrice(),
        gas: estimate,
        data: data,
      },
      PRIVATEKEY
    )
    .then(async (Tx) => {
      await caver.klay
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

const jsonToPinata = async (metaData, owner) => {
  try {
    const baseUrl = "https://gateway.pinata.cloud/ipfs/";
    const data = JSON.stringify({
      pinataMetadata: {
        name: owner,
      },
      pinataContent: metaData,
    });

    const res = await axios
      .post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: `${ACCESS_KEY}`,
          pinata_secret_api_key: `${SECRET_ACCESS_KEY}`,
        },
      })
      .then((res) => {
        const result = `${baseUrl}${res.data.IpfsHash}`;
        return result;
      });

    return res;
  } catch (err) {
    console.error(err);
  }
};

if (
  whatToUse === "이름으로 주소 확인" ||
  whatToUse === "주소로 이름 확인" ||
  whatToUse === "레코드 조회"
) {
  console.log("확인 테스트를 시작합니다.");
  check(whatToUse);
} else if (whatToUse === "등록" || whatToUse === "레코드 등록") {
  console.log("등록 테스트를 시작합니다.");
  register(whatToUse);
}
