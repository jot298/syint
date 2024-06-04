$(document).ready(function () {
  loadLocations();
});

function loadLocations() {
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:3000/locations",
    cache: false,
    dataType: "json",
    success: function (response) {
      $("#locationsList").empty();
      for (let i = 0; i < response["data"].length; i++) {
        let location = response["data"][i];

        // translates abbreviation into full name and corresponding degrees
        let windDirection = "";
        switch (location["wind_direction"]) {
          case "N":
            windDirection = "Norden (0 °C)";
            break;
            case "NNE":
            windDirection = "Nord-Nord-Osten (22,5 °C)";
            break;
            case "NE":
            windDirection = "Nord-Osten (45 °C)";
            break;
            case "ENE":
            windDirection = "Ost-Nord-Osten (67,5 °C)";
            break;
            case "E":
            windDirection = "Osten (90 °C)";
            break;
            case "ESE":
            windDirection = "Ost-Süd-Osten (112,5 °C)";
            break;
            case "SE":
            windDirection = "Süd-Osten (135 °C)";
            break;
            case "SSE":
            windDirection = "Süd-Süd-Osten (157,5 °C)";
            break;
            case "S":
            windDirection = "Süden (180 °C)";
            break;
            case "SSW":
            windDirection = "Süd-Süd-Westen (202,5 °C)";
            break;
            case "SW":
            windDirection = "Süd-Westen (225 °C)";
            break;
            case "WSW":
            windDirection = "West-Süd-Westen (247,5 °C)";
            break;
            case "W":
            windDirection = "Westen (270 °C)";
            break;
            case "WNW":
            windDirection = "West-Nord-Westen (292,5 °C)";
            break;
            case "NW":
            windDirection = "Nord-Westen (315 °C)";
            break;
            case "NNW":
            windDirection = "Nord-Nord-Westen (337,5 °C)";
            break;
        }

        // translates uv index into words
        let uvIndexDesc = "";
        if (location["uv_index"] <= 2) {
          uvIndexDesc = "niedrig";
        } else if (location["uv_index"] <= 5) {
          uvIndexDesc = "mäßig";
        } else if (location["uv_index"] <= 7) {
          uvIndexDesc = "hoch";
        } else if (location["uv_index"] <= 10) {
          uvIndexDesc = "sehr hoch";
        } else if (location["uv_index"] >= 11) {
          uvIndexDesc = "extrem";
        }

        // create location card in html
        $("#locationsList").append(
          '<div class="col-sm-6 mb-3 mb-sm-0"><div class="card"><div class="card-body"><h5 class="card-title">' +
            location["name"] +
            '</h5><p class="card-text">Temperatur: ' +
            location["temperature"] +
            ' °C</p><p class="card-text">UV-Index: ' +
            uvIndexDesc +
            " (" +
            location["uv_index"] +
            ')</p><p class="card-text">Windrichtung: ' +
            windDirection +
            '</p><p class="card-text">Windstärke: ' +
            location["wind_speed"] +
            ' km/h</p><a href="/location/location.html?id=' +
            location["id"] +
            '" class="btn btn-primary">Historische Daten</a></div></div></div>'
        );
      }
    },
  });
}
