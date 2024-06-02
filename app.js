const express = require("express");
const timers = require("timers-promises");
const { Client } = require("pg");
const config = require("./config.json");

const options = { method: "GET", headers: { accept: "application/json" } };

const loadData = async () => {
  while (true) {
    const fetch_api =
      "http://api.weatherapi.com/v1/current.json?key=" +
      config.API_KEY +
      "&q=Graz&aqi=no";
    fetch(
      //"https://api.tomorrow.io/v4/weather/realtime?location=Vienna&apikey=CF8QTRhpprm11YkrniU6d1SeqhaQcpkP",
      fetch_api,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("Current Weatherdata Graz:");
        console.log(response);
        save(response);
      })
      .catch((err) => console.error(err));

    // Wait 20 sec before next call
    await timers.setTimeout(10000);
    const fetch2_api =
      "http://api.weatherapi.com/v1/current.json?key=" +
      config.API_KEY +
      "&q=Vienna&aqi=no";
    fetch(
      //"https://api.tomorrow.io/v4/weather/realtime?location=Vienna&apikey=CF8QTRhpprm11YkrniU6d1SeqhaQcpkP",
      fetch2_api,
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("Current Weatherdata Vienna:");
        console.log(response);
        save(response);
      })
      .catch((err) => console.error(err));

    // Wait 20 sec before next call
    await timers.setTimeout(10000);
  }
};

const save = async (response) => {
  // docker run -e POSTGRES_PASSWORD=secret -d -p 5432:5432 postgres
  const client = new Client({
    user: "postgres",
    password: "secret",
    port: 5432,
  });
  await client.connect();
  /*const res = await client.query("SELECT $1::text as connected", [
    "Connection to postgres successful!",
  ]);
  console.log(res.rows[0].connected);*/
  const query = {
    text: "INSERT INTO weather_data (place, created_at, temperature, uv_index, wind_direction, wind_speed) VALUES($1, $2, $3, $4, $5, $6)",
    values: [
      response.location.name,
      response.location.localtime,
      response.current.temp_c,
      response.current.uv,
      response.current.wind_dir,
      response.current.wind_kph,
    ],
  };
  const res = await client.query(query);
  console.log(res.rows[0]);
  console.log("Successfully Saved dataset");

  await client.end();
};

const sendData = async () => {
  console.log("Starting endless loop: ");
  while (true) {
    await timers.setTimeout(18000);
    // docker run -e POSTGRES_PASSWORD=secret -d -p 5432:5432 postgres
    const client = new Client({
      user: "postgres",
      password: "secret",
      port: 5432,
    });
    await client.connect();
    const query = {
      text: "SELECT * FROM weather_data WHERE place = 'Graz' ORDER BY created_at DESC LIMIT 1;",
      values: [],
    };
    const res = await client.query(query);
    console.log(res.rows[0]);
    console.log("Successfully Saved dataset");

    await client.end();
    const url = config.WEBHOOK_URL;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res.rows[0]),
    });
  }
};

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.get("/weather_vienna", async (req, res) => {
  const client = new Client({
    user: "postgres",
    password: "secret",
    port: 5432,
  });
  await client.connect();
  const query = {
    text: "SELECT * FROM weather_data WHERE place = 'Vienna' ORDER BY created_at DESC LIMIT 1;",
    values: [],
  };
  const resp = await client.query(query);
  await client.end();

  res.json(resp.rows[0]);
});

loadData();
sendData();
