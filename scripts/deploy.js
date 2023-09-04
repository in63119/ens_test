const { ethers } = require("hardhat");
const namehash = require("eth-ens-namehash");

const tld = "test";
const labelhash = (label) => ethers.keccak256(ethers.toUtf8Bytes(label));
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

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

  let resolverAddress;
  const resolver = await PublicResolver.deploy(ensAddress, ZERO_ADDRESS).then(
    (res) => {
      resolverAddress = res.target;
      return res;
    }
  );
  await resolver.waitForDeployment();
  await setupResolver(ens, resolver, accounts);
  console.log("Resolver at", resolverAddress);

  const registrar = await FIFSRegistrar.deploy(ens.target, namehash.hash(tld));
  await registrar.waitForDeployment();
  await setupRegistrar(ens, registrar);
  console.log("Registrar at", registrar.target);

  const reverseRegistrar = await ReverseRegistrar.deploy(
    ens.target,
    resolver.target
  );
  await reverseRegistrar.waitForDeployment();
  await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts);
  console.log("ReverseRegistrar at", reverseRegistrar.target);
}

async function setupResolver(ens, resolver, accounts) {
  const resolverNode = namehash.hash("resolver");
  const resolverLabel = labelhash("resolver");
  await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0]);
  await ens.setResolver(resolverNode, resolver.target);
  await resolver["setAddr(bytes32,address)"](resolverNode, resolver.target);
}

async function setupRegistrar(ens, registrar) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.target);
}

async function setupReverseRegistrar(
  ens,
  registrar,
  reverseRegistrar,
  accounts
) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash("reverse"), accounts[0]);
  await ens.setSubnodeOwner(
    namehash.hash("reverse"),
    labelhash("addr"),
    reverseRegistrar.target
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
