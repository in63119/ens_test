const { ethers } = require("hardhat");
const { makeAbi } = require("../makeABI");

async function main() {
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
  const FIFSRegistrar = await ethers.getContractFactory("FIFSRegistrar");
  const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
  const PublicResolver = await ethers.getContractFactory("PublicResolver");
  const signers = await ethers.getSigners();
  const accounts = signers.map((s) => s.address);

  let ensAddress;
  const ens = await ENSRegistry.deploy().then((res) => {
    ensAddress = res.target; // 이전에는 deployed() 이후에 .address로 컨트랙트 주소를 알 수 있었지만 target으로 변경됨
    return res;
  });
  await ens.waitForDeployment(); // deployed() 요거 왜 안되지?? ㅠㅠ => hardhat 버전이 업데이트 되면서 다른 것 써야함
  console.log("Registry at", ensAddress);
  await makeAbi(ensAddress, "ens");

  let resolverAddress;
  const resolver = await PublicResolver.deploy(ensAddress, ZERO_ADDRESS).then(
    (res) => {
      resolverAddress = res.target;
      return res;
    }
  );
  await resolver.waitForDeployment();
  console.log("Resolver at", resolverAddress);
  await makeAbi(resolverAddress, "resolver");

  const registrar = await FIFSRegistrar.deploy(ens.target, namehash.hash(tld));
  await registrar.waitForDeployment();
  console.log("Registrar at", registrar.target);
  await makeAbi(registrar.target, "registrar");

  const reverseRegistrar = await ReverseRegistrar.deploy(
    ens.target,
    resolver.target
  );
  await reverseRegistrar.waitForDeployment();
  console.log("ReverseRegistrar at", reverseRegistrar.target);
  await makeAbi(reverseRegistrar.target, "reverseRegistrar");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
