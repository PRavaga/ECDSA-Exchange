import "./index.scss";
import * as secp from "ethereum-cryptography/secp256k1";

const server = "http://localhost:3042";

document
  .getElementById("exchange-address")
  .addEventListener("input", ({ target: { value } }) => {
    if (value === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    fetch(`${server}/balance/${value}`)
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });

document.getElementById("transfer-amount").addEventListener("click", () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  let privateKey = prompt(
    "Enter private key to sign the transaction // you should never do that tho:)",
    "Private Key"
  );

  const message =
    "a33321f98e4ff1c283c76998f14f57447545d339b3db534c6d886decb4209f28";

  const pubkey = Buffer.from(secp.getPublicKey(privateKey)).toString("hex");

  secp.sign(message, privateKey).then((signature) => {
    const body = JSON.stringify({
      sender,
      amount,
      recipient,
      signature: Buffer.from(signature).toString("hex"),
      pubkey,
    });

    const request = new Request(`${server}/send`, { method: "POST", body });

    fetch(request, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });

  // const body = JSON.stringify({
  //   sender,
  //   amount,
  //   recipient,
  //   signature,
  //   pubkey,
  // });

  // const request = new Request(`${server}/send`, { method: "POST", body });
});
