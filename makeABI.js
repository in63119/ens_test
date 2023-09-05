const fs = require("fs");
const path = require("path");
const basePath = __dirname;

const makeFile = async (location, destination, address) => {
  const json = await fs.readFileSync(path.join(basePath, location), {
    encoding: "utf-8",
  });

  await fs.writeFileSync(
    path.join(basePath, destination),
    makeData(json, address)
  );
};

const makeData = (json, address) => {
  const abi = JSON.parse(json).abi;

  return JSON.stringify({
    abi: abi,
    address: address,
  });
};

const makeAbi = async (address, contract) => {
  let dir = "";

  if (contract === "ens") {
    dir = `/artifacts/@ensdomains/ens-contracts/contracts/registry/ENSRegistry.sol/ENSRegistry.json`;
  } else if (contract === "resolver") {
    dir = `/artifacts/@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol/PublicResolver.json`;
  } else if (contract === "registrar") {
    dir = `/artifacts/@ensdomains/ens-contracts/contracts/registry/FIFSRegistrar.sol/FIFSRegistrar.json`;
  } else if (contract === "reverseRegistrar") {
    dir = `/artifacts/@ensdomains/ens-contracts/contracts/registry/ReverseRegistrar.sol/ReverseRegistrar.json`;
  }

  makeFile(dir, `/abis/${contract}.json`, address);
};

module.exports = {
  makeAbi,
};
