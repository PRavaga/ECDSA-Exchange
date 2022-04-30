const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const app = express();
const cors = require("cors");
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const privKeys = [
  [
    182, 39, 189, 91, 236, 220, 6, 149, 38, 110, 7, 110, 164, 81, 197, 111, 234,
    193, 91, 26, 36, 180, 187, 173, 134, 226, 94, 99, 200, 73, 92, 120,
  ],
  [
    106, 162, 85, 66, 242, 208, 191, 114, 178, 61, 74, 78, 214, 1, 0, 229, 116,
    187, 230, 177, 204, 210, 128, 147, 34, 51, 140, 242, 248, 51, 218, 184,
  ],
  [
    84, 177, 214, 175, 3, 61, 136, 65, 187, 180, 75, 138, 67, 153, 23, 48, 172,
    68, 91, 17, 51, 134, 29, 81, 156, 44, 118, 160, 126, 136, 37, 29,
  ],
];

const message =
  "a33321f98e4ff1c283c76998f14f57447545d339b3db534c6d886decb4209f28";

const addresses = [];

const convert = (key) =>
  `0X${Buffer.from(key).toString("hex").slice(-40).toUpperCase()}`;

for (key in privKeys)
  addresses.push(
    convert(secp.getPublicKey(Buffer.from(privKeys[key]).toString("hex")))
  );

const balances = {
  [addresses[0]]: 100,
  [addresses[1]]: 50,
  [addresses[2]]: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, pubkey } = req.body;
  if (secp.verify(signature, message, pubkey)) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  } else {
    console.log("invalid signature");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log("--------------------------------");
  console.log("Balances");
  Object.entries(balances).forEach((balance, i) => console.log(i, ...balance));
  console.log("--------------------------------");
  console.log("Private keys");
  privKeys.forEach((key, i) =>
    console.log(i, Buffer.from(key).toString("hex"))
  );
});
