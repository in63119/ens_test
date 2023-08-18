const shell = require("shelljs");

const compileString = "truffle compile";

// 테스트넷
const deployString = "truffle deploy --network baobab --compile-none";

const init = async () => {
  console.log(" -------------- 배포 까지만 진행이 됩니다. --------------");

  try {
    await shell.exec(compileString);

    console.log(" ---------------- 컴파일 완료 ---------------- ");

    await shell.exec(deployString);

    console.log(" ---------------- 배포 완료 ---------------- ");
  } catch (error) {
    console.log("-----------------------------------------------------");
    console.log("node deploy.js 재실행 plz~");
  }
};

init();
