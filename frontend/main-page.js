$(document).ready(function () {
  loadLocations();
});

function loadLocations() {
  $.ajax({
    type: "GET",
    url: "localURL/locations",
    cache: false,
    dataType: "json",
    success: function (response) {
      $("#locationsList").empty();
      for (let i = 0; i < response["data"].length; i++) {
        let location = response["data"][i];

        // translates degrees into specific wind direction
        let windDirection;
        if (
          (location["wind-direction"] >= 0 &&
            location["wind-direction"] < 22.5) ||
          (location["wind-direction"] >= 337.5 &&
            location["wind-direction"] <= 360)
        ) {
          windDirection = "Nord";
        } else if (
          location["wind-direction"] >= 22.5 &&
          location["wind-direction"] < 67.5
        ) {
          windDirection = "Nord-West";
        } else if (
          location["wind-direction"] >= 67.5 &&
          location["wind-direction"] < 112.5
        ) {
          windDirection = "West";
        } else if (
          location["wind-direction"] >= 112.5 &&
          location["wind-direction"] < 157.5
        ) {
          windDirection = "Süd-West";
        } else if (
          location["wind-direction"] >= 157.5 &&
          location["wind-direction"] < 202.5
        ) {
          windDirection = "Süd";
        } else if (
          location["wind-direction"] >= 202.5 &&
          location["wind-direction"] < 247.5
        ) {
          windDirection = "Süd-Ost";
        } else if (
          location["wind-direction"] >= 247.5 &&
          location["wind-direction"] < 292.5
        ) {
          windDirection = "Ost";
        } else if (
          location["wind-direction"] >= 292.5 &&
          location["wind-direction"] < 337.5
        ) {
          windDirection = "Nord-Ost";
        }

        // translates uv index into words
        let uvIndexDesc = "";
        if (location["uv-index"] <= 2) {
          uvIndexDesc = "niedrig";
        } else if (location["uv-index"] <= 5) {
          uvIndexDesc = "mäßig";
        } else if (location["uv-index"] <= 7) {
          uvIndexDesc = "hoch";
        } else if (location["uv-index"] <= 10) {
          uvIndexDesc = "sehr hoch";
        } else if (location["uv-index"] >= 11) {
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
            location["uv-index"] +
            ')</p><p class="card-text">Windrichtung: ' +
            windDirection +
            " (" +
            location["wind-direction"] +
            '°)</p><p class="card-text">Windstärke: ' +
            location["wind-speed"] +
            ' m/s</p><a href="/location/location.html?id=' +
            location["id"] +
            '" class="btn btn-primary">Historische Daten</a></div></div></div>'
        );
      }
    },
  });
}
