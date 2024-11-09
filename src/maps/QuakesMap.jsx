import { renderToString } from "react-dom/server";
import { CssBaseline, Link, Typography, Stack, Button } from "@mui/material";
import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import Header from "./Header";
import { BASE_LAYERS } from "./baseLayers";

const OUTER_BOUNDS = [
  [-80, -180],
  [80, 180],
];

const BASE_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";

function getMarkerRadius(magnitude) {
  const baseArea = 10;
  const scaleFactor = 2.5;
  const area = baseArea * Math.pow(10, (magnitude - 1) / scaleFactor);

  return Math.sqrt(area / Math.PI);
}

const pointToLayer = ({ properties }, latlng) => {
  const radius = getMarkerRadius(properties.mag);
  return L.circleMarker(latlng, {
    radius: radius,
    color: "orange", // Ändern Sie dies nach Bedarf
    fillColor: "orange", // Ändern Sie dies nach Bedarf
    fillOpacity: 0.5,
    weight: 2, // Dicke der Umrandungslinie
  });
};

const onEachFeature = (feature, layer) => {
  if (feature.properties && feature.properties.place) {
    const popup = <Popup {...feature} />;
    layer.bindPopup(renderToString(popup));
  }
};

function Popup({ properties, geometry }) {
  const [lon, lat, depth] = geometry.coordinates;

  return (
    <>
      <Typography variant="h2">{properties.place}</Typography>
      <p>
        <span style={{ fontWeight: "bold" }}>MAGNITUDE</span>: {properties.mag}
        <br />
        <span style={{ fontWeight: "bold" }}>DEPTH</span>: {depth} km
        <br />
        <span style={{ fontWeight: "bold" }}>TYPE</span>: {properties.type}
        <br />
        <span style={{ fontWeight: "bold" }}>Lon/Lat</span>: {lon}, {lat}
      </p>
      <Typography variant="h3">
        <Link variant="h3" target="_blank" href={properties.url}>
          More info
        </Link>
      </Typography>
    </>
  );
}

function Infospalte({
  onMinMagChange,
  onTimespanChange,
  selectedMinMag,
  selectedTimespan,
}) {
  const magnitudeOptions = ["ALL", "M1.0+", "M2.5+", "M4.5+", "SIGNIFICANT"];
  const timePeriodOptions = [
    "LAST HOUR",
    "LAST DAY",
    "LAST 7 DAYS",
    "LAST 30 DAYS",
  ];

  return (
    <Stack direction="row" spacing={2}>
      <Stack direction="column" spacing={1} sx={{ padding: 2 }}>
        <Typography variant="h6">Select Magnitude</Typography>
        <Stack direction="row" spacing={1}>
          {magnitudeOptions.map((option, index) => (
            <Button
              key={index}
              variant={selectedMinMag === option ? "contained" : "outlined"}
              onClick={() => onMinMagChange(option)}
              sx={{
                border: "2px solid black",
                backgroundColor: selectedMinMag === option ? "grey" : "white",
                color: "black",
                "&:hover": {
                  backgroundColor: "lightgray",
                },
              }}
            >
              {option}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Stack direction="column" spacing={1} sx={{ padding: 2 }}>
        <Typography variant="h6">Select Time Period</Typography>
        <Stack direction="row" spacing={1}>
          {timePeriodOptions.map((option, index) => (
            <Button
              key={index}
              variant={selectedTimespan === option ? "contained" : "outlined"}
              onClick={() => onTimespanChange(option)}
              sx={{
                border: "2px solid black",
                backgroundColor: selectedTimespan === option ? "grey" : "white",
                color: "black",
                "&:hover": {
                  backgroundColor: "lightgray",
                },
              }}
            >
              {option}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

function Map() {
  const [quakesJson, setQuakesJson] = useState([]);
  const [selectedMinMag, setSelectedMinMag] = useState("ALL"); // Standardwert gesetzt
  const [selectedTimespan, setSelectedTimespan] = useState("LAST DAY"); // Standardwert gesetzt

  async function fetchQuakeData(url) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Error fetching data from ${url}`);
      }
      const data = await resp.json();
      setQuakesJson(data.features);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!selectedMinMag || !selectedTimespan) return; // Sicherheitsüberprüfung

    // Umwandlung der Werte in API-kompatible Formate
    let magParam =
      selectedMinMag === "ALL"
        ? "all"
        : selectedMinMag.replace("M", "").replace("+", "").toLowerCase();
    magParam = magParam === "significant" ? "significant" : magParam;

    /* const periodParam = selectedTimespan 
      .toLowerCase()
      .replace("last ", "")
      .replace(" ", "_");*/

    let periodParam;
    switch (selectedTimespan) {
      case "LAST HOUR":
        periodParam = "hour";
        break;
      case "LAST DAY":
        periodParam = "day";
        break;
      case "LAST 7 DAYS":
        periodParam = "week";
        break;
      case "LAST 30 DAYS":
        periodParam = "month";
        break;
      default:
        periodParam = "day"; // Fallback-Wert
    }

    const url = `${BASE_URL}${magParam}_${periodParam}.geojson`;
    console.log("Fetching data from URL:", url);
    fetchQuakeData(url);
  }, [selectedMinMag, selectedTimespan]);

  const handleMinMagChange = (option) => {
    setSelectedMinMag(option);
  };

  const handleTimespanChange = (option) => {
    setSelectedTimespan(option);
  };

  return (
    <>
      <CssBaseline />
      <Header />
      <Infospalte
        onMinMagChange={handleMinMagChange}
        onTimespanChange={handleTimespanChange}
        selectedMinMag={selectedMinMag}
        selectedTimespan={selectedTimespan}
      />
      <MapContainer
        style={{ height: "100vh" }}
        center={[0, 0]}
        zoom={3}
        minZoom={2}
        maxBounds={OUTER_BOUNDS}
        maxBoundsViscosity={1}
      >
        <LayersControl position="topright">
          {BASE_LAYERS.map((baseLayer) => (
            <LayersControl.BaseLayer
              key={baseLayer.url}
              checked={baseLayer.checked}
              name={baseLayer.name}
            >
              <TileLayer
                attribution={baseLayer.attribution}
                url={baseLayer.url}
              />
            </LayersControl.BaseLayer>
          ))}

          <LayersControl.Overlay checked name="USGQ Earthquakes">
            <GeoJSON
              data={quakesJson}
              pointToLayer={pointToLayer}
              key={quakesJson.length}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </>
  );
}
export default Map;
