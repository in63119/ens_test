const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const { KLAYTN_URL, PRIVATE_KEY, ADDRESS } = process.env;

const Caver = require("caver-js");
const caver = new Caver(KLAYTN_URL);

const { ethers } = require("hardhat");
const namehash = require("eth-ens-namehash");

const tld = "test";
const labelhash = (label) => ethers.keccak256(ethers.toUtf8Bytes(label));
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// Contract
const ensData = require("./abis/ens.json");
const ens = new caver.klay.Contract(ensData.abi, ensData.address).methods;

const registrarData = require("./abis/registrar.json");
const registrar = new caver.klay.Contract(
  registrarData.abi,
  registrarData.address
).methods;

const resolverData = require("./abis/resolver.json");
const resolver = new caver.klay.Contract(resolverData.abi, resolverData.address)
  .methods;

const reverseRegistrarData = require("./abis/reverseRegistrar.json");
const reverseRegistrar = new caver.klay.Contract(
  reverseRegistrarData.abi,
  reverseRegistrarData.address
).methods;

const setting = async () => {
  const resolverNode = namehash.hash("resolver");
  const resolverLabel = labelhash("resolver");

  console.log("setSubnodeOwner를 셋팅합니다.");
  const setSubnodeOwner = await ens
    .setSubnodeOwner(ZERO_HASH, resolverLabel, ADDRESS)
    .encodeABI();
  await SendTransaction(setSubnodeOwner, ensData.address);

  console.log(" ");
  console.log("setResolver를 셋팅합니다.");
  const setResolver = await ens
    .setResolver(resolverNode, resolverData.address)
    .encodeABI();
  await SendTransaction(setResolver, ensData.address);

  console.log(" ");
  console.log("setAddr를 셋팅합니다.");
  const setAddr = await resolver
    .setAddr(resolverNode, resolverData.address)
    .encodeABI();
  await SendTransaction(setAddr, resolverData.address);

  console.log(" ");
  console.log("Registrar를 셋팅합니다.");
  const setupRegistrar = await ens
    .setSubnodeOwner(ZERO_HASH, labelhash(tld), registrarData.address)
    .encodeABI();
  await SendTransaction(setupRegistrar, ensData.address);

  console.log(" ");
  console.log("ReverseRegistrar를 셋팅합니다.");
  const reverseSubnodeOwner = await ens
    .setSubnodeOwner(ZERO_HASH, labelhash("reverse"), ADDRESS)
    .encodeABI();
  await SendTransaction(reverseSubnodeOwner, ensData.address);
  const reverseSubnodeOwnerCa = await ens
    .setSubnodeOwner(
      namehash.hash("reverse"),
      labelhash("addr"),
      reverseRegistrarData.address
    )
    .encodeABI();
  await SendTransaction(reverseSubnodeOwnerCa, ensData.address);
};

const SendTransaction = async (data, to, estimate) => {
  await caver.klay.accounts
    .signTransaction(
      {
        from: ADDRESS,
        to: to,
        gasPrice: await caver.klay.getGasPrice(),
        gas: 500000,
        data: data,
      },
      PRIVATE_KEY
    )
    .then(async (Tx) => {
      await caver.klay
        .sendSignedTransaction(Tx.rawTransaction)
        .then((hash, err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("success!");
          }
        });
    });
};

setting();
