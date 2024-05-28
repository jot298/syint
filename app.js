const express = require("express");
const timers = require("timers-promises");
const sdk = require("@api/climacell-docs");

const options = { method: "GET", headers: { accept: "application/json" } };

const loadData = async () => {
  console.log("Starting Loading Loop: ");
  while (true) {
    fetch(
      "https://api.tomorrow.io/v4/weather/realtime?location=toronto&apikey=CF8QTRhpprm11YkrniU6d1SeqhaQcpkP",
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("Current Weatherdata:");
        console.log(response);
      })
      .catch((err) => console.error(err));

    // Wait 20 sec before next call
    await timers.setTimeout(20000);
  }
};

const sendData = async () => {
  console.log("Starting endless loop: ");
  while (true) {
    await timers.setTimeout(18000);
    console.log("sending data");
  }
};

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

var current_data = [];

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.get("/status", (request, response) => {
  const status = {
    Stock: "BTC",
    Price: 12.99,
  };

  response.send(status);
});

loadData();
sendData();
