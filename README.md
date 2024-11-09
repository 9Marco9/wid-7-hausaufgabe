# WID 7 - Hausaufgabe

## Getting started

### 1.Forken

- dieses Repo in das eigene GitHub Konto forken

<img src="public/image.png" width=200/>

### 2. Installieren

```sh
git clone <repo-url>
cd <repo-name>
```

`npm` Abhängigkeiten installieren und Dev-Server starten:

```sh
npm install && npm run dev
```

## Aufgabe

- API Dokumentation: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- die App sollte mittels geeigneter UI Elemente (_MUI_) alle Endpoints (Zeitintervalle und Magnituden) implementieren
  - **Zeitinterval**: "_Past Hour_", "_Past Day_", ...
  - **Min. Magnitude**: "_All_", "_M1.0+_", "_M2.5+_", etc.

**Beispiel Screenshot einer finalen App**

![](/public/final-app-screenshot.png)

**Tipps**

- Schaue zuerst in der [MUI Dokumentation](https://mui.com/material-ui/all-components/) welche UI Komponente dafür geeignet wären (z.B. die Komponente [`Stack`](https://mui.com/material-ui/react-stack/) ist geeignet um verktikale oder horozontale Layouts zu erstellen).
- um Datenabruf mittels `fetch` API nach Änderung der State-Variablen (z.B. Magnitude, Zeitinterval) zu starten kannst du den `useEffect` Hook verwenden
- Beachte, dass in `react-leaflet` die `GeoJSON` Komponente von einem _immutable_ `data` Attribut ausgeht (d.h. Änderungen in `data` lösen kein Re-Render in React aus). Ein Re-Render können wir aber z.B. durch das Setzen eines neuen `key` Attributs erzielen (z.B. `<GeoJSON data={...} key={newKey} ...` - siehe Skript)
- für den Zeitinterval "Past 30 Days" (`month`), können in Kombination mit den Magnitude-Optionen "All" oder "M1.0+" unter Umständed sehr große Daten zusammen kommen. Du könntest für diese Zeitinterval-Option, nur die Magnituden "M2.5+" und größer erlauben. Dies kann man auch in der UI abbilden (z.B. mit `<Button disabled={true}>` kann ein Button deaktiviert werden).

**Meine App Ansicht**
![](Screenshot_Webseite_Marco_Klaus.png)
