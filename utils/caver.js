const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { KLAYTN_URL, PRIVATE_KEY, ADDRESS } = process.env;

const Caver = require("caver-js");
const caver = new Caver(KLAYTN_URL);
