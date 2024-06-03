const express = require("express");
const timers = require("timers-promises");
const { Client } = require("pg");
const config = require("./config.json");
var cors = require("cors");

const loadnew = false;

const options = { method: "GET", headers: { accept: "application/json" } };

const loadData = async () => {
  while (true) {
    const fetch_api =
      "http://api.weatherapi.com/v1/current.json?key=" +
      config.API_KEY +
      "&q=Graz&aqi=no";
    fetch(fetch_api, options)
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
    fetch(fetch2_api, options)
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
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.get("/locations", async (req, res) => {
  const client = new Client({
    user: "postgres",
    password: "secret",
    port: 5432,
  });
  await client.connect();
  const query = {
    text: "SELECT DISTINCT ON (place) place as name, * FROM weather_data ORDER BY place DESC LIMIT 100;",
    values: [],
  };
  const resp = await client.query(query);
  await client.end();
  var resp_to_send = {
    data: resp.rows,
  };

  res.json(resp_to_send);
});

app.get("/locations/:locationId/temperatures", async (req, res) => {
  console.log("Got Request for data, resp:");
  const client = new Client({
    user: "postgres",
    password: "secret",
    port: 5432,
  });
  await client.connect();
  const location = req.params.locationId;
  const period = req.query.period ? req.query.period : "7d";
  var name = "";
  switch (location) {
    case "1":
      name = "Vienna";
    case "2":
      name = "Graz";
  }
  const response_to_send = {
    data: [
      {
        id: location,
        name: name,
        temperatures: [],
      },
    ],
  };

  var querystring = "";

  switch (period) {
    case "1h":
      querystring =
        "SELECT DISTINCT ON (created_at) created_at as timestamp, temperature FROM weather_data WHERE place = '" +
        name +
        "' AND created_at >= now() - interval '1' hour ORDER BY created_at DESC;";
    case "24h":

    case "7d":

    case "1m":
  }

  const query = {
    text: querystring,
    values: [],
  };
  const resp = await client.query(query);
  response_to_send.data[0].temperatures = resp.rows;
  await client.end();

  res.json(response_to_send);
  console.log(response_to_send.toString());
});
if (loadnew === true) {
  loadData();
  sendData();
}
