$(document).ready(function () {
  loadTemperatureData();
  $("#period").on("change", function () {
    loadTemperatureData();
  });
});

function loadTemperatureData() {
  let href = $(location).attr("href");
  let id = href.substring(href.indexOf("=") + 1);
  let period = $("#period").val();

  $("#min").empty();
  $("#max").empty();
  $("#avg").empty();
  $("#graph").empty();
  $("#pageName").empty();

  $.ajax({
    type: "GET",
    url:
      "http://127.0.0.1:3000/locations/" +
      id +
      "/temperatures?period=" +
      period,
    cache: false,
    dataType: "json",
    success: function (response) {
      $("#pageName").append(response["data"][0]["name"]);

      let formattedTemperatureData = formatData(
        response["data"][0]["temperatures"],
        period
      );

      console.log(formattedTemperatureData);

      // fill statistics cards
      $("#avg").append(formattedTemperatureData["avg"] + " °C");
      $("#min").append(formattedTemperatureData["min"] + " °C");
      $("#max").append(formattedTemperatureData["max"] + " °C");

      // creates the Temperature Graph
      $("#graph").append("<canvas id='temperatureCanvas'>");
      new Chart(document.getElementById("temperatureCanvas"), {
        type: "line",
        options: {
          scales: {
            y: {
              min: Math.floor(formattedTemperatureData["min"]),
              max: Math.ceil(parseFloat(formattedTemperatureData["max"])),
            },
          },
        },
        data: {
          labels: formattedTemperatureData["graphLabels"],
          datasets: [
            {
              label: response["data"][0]["name"],
              data: formattedTemperatureData["graphData"],
              fill: false,
              borderColor: "#7d1a9b",
              backgroundColor: "#7d1a9b",
              tension: 0.1,
            },
          ],
        },
      });
    },
  });
}

function formatData(temperatures, period) {
  let graphLabels = [];
  let graphData = [];
  let max = 0;
  let min = Number.MAX_VALUE;
  let avgSum = 0;

  for (let i = 0; i < temperatures.length; i++) {
    let dateTime = new Date(temperatures[i]["timestamp"]);

    graphData[i] = parseFloat(temperatures[i]["temperature"]);

    avgSum += parseFloat(temperatures[i]["temperature"]);
    if (max < parseFloat(temperatures[i]["temperature"])) {
      max = parseFloat(temperatures[i]["temperature"]);
    }
    if (min > parseFloat(temperatures[i]["temperature"])) {
      min = parseFloat(temperatures[i]["temperature"]);
    }

    switch (period) {
      case "1m":
        graphLabels[i] = dateTime.toLocaleDateString("de-DE", {
          year: "numeric",
          month: "long",
        });
        break;
      case "7d":
        graphLabels[i] = dateTime.toLocaleDateString("de-DE", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          weekday: "short",
        });
        break;
      case "24h":
        graphLabels[i] = dateTime.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });
        break;
      default:
        graphLabels[i] = dateTime.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });
    }
  }

  let avg = (avgSum / temperatures.length).toFixed(2);

  return {
    graphLabels: graphLabels,
    graphData: graphData,
    min: min,
    max: max,
    avg: avg,
  };
}
