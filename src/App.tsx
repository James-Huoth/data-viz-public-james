 
import React, { useEffect, useState } from "react";
import papa from 'papaparse'
import "./App.css";
import type { CrashDataArray, DemoDataRow, PieDataRow } from "./types";
import { BarChart, Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend, Cell, LabelList } from "recharts";
import { RMap, ROSM, RLayerVector, RFeature, ROverlay } from "rlayers";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Style, Text, Fill } from "ol/style";

/* map component
const Lowell_LAT = 42.640999;
const Lowell_LON = -71.31671; 
export const MapComponent = ({ data }: { data: PieDataRow[] }) => {
 // const getLabel = (row: PieDataRow) => row.vulnerableUserType[0].toUpperCase();          Unneeded label //
  const [theDataPoint, setTheDataPoint] = useState<PieDataRow | null>(null);

  const toggleVisibleDataPoint = (row: PieDataRow, event: any) => {
    if (row == theDataPoint) {
      setTheDataPoint(null);
    } else {
      setTheDataPoint(row);
    }
  };

  return (
    <section className="map-section">
      {data.length ? (
        <RMap
          className="map"
          initial={{ center: fromLonLat([Lowell_LON, Lowell_LAT]), zoom: 11 }}
        >
          <ROSM />
          <RLayerVector>
            {data.map((row, idx) => (
              <RFeature
                onClick={(event) => toggleVisibleDataPoint(row, event)}
                key={idx}
                geometry={new Point(fromLonLat([row.longitude, row.latitude]))}
                style={
                  new Style({
                    text: new Text({
                      text: getLabel(row),
                      fill: row.fatalities
                        ? new Fill({ color: "#f00" })
                        : new Fill({ color: "#000" }),
                      scale: 1.5,
                      backgroundFill:
                        row == theDataPoint
                          ? new Fill({ color: "#ccc" })
                          : undefined,
                    }),
                  })
                }
              >
                <ROverlay>
                  {theDataPoint === row ? (
                    <div
                      className="map-popup"
                      style={{
                        position: "absolute",
                        padding: 8,
                        left: -90,
                        top: 10,
                        width: 180,
                        backgroundColor: "#fff8",
                        color: "#222",
                      }}
                    >
                      {/* 
                        This next line is just a lazy way to spit a data point out in the console
                        for inspection. Makes it easy to see a given data point if I decide I want
                        to change up what I'm doing with it.
                      */}
                      {console.log("theDataPoint", theDataPoint) ? "" : ""}
                      {/*
                      End lazy console log code :-)
                      */} /*
                      {theDataPoint.crashDate.toDateString()}
                      <br />
                      {theDataPoint.cityTownName}
                      <br />
                      {theDataPoint.vulnerableUserTypes.join(", ")}
                      <br />
                      Injury:{" "}
                      {theDataPoint.fatalities
                        ? "Fatal"
                        : theDataPoint.nonFatalInjuries
                        ? theDataPoint.severity
                        : "No injury"}
                      <br />
                      {theDataPoint.weatherConditions}
                      <br />
                      <a
                        href={`https://www.google.com/maps?layer=c&cbll=${row.latitude},${row.longitude}`}
                        target="_STREET"
                      >
                        Open Google Street View
                      </a>
                    </div>
                  ) : (
                    <div />
                  )}
                </ROverlay>
              </RFeature>
            ))}
          </RLayerVector>
        </RMap>
      ) : (
        <div>No data</div>
      )}
    </section>
  );
};

export default MapComponent;
*/

const App = () => { 
  const [csvData,setCsvData] = useState<CrashDataArray[]>([]);
  const [pieData,setPieData] = useState<PieDataRow[]>([]);
  const [pieData2,setPieData2] = useState<PieDataRow[]>([]);
  const csvFileUrl = '/data/GroupData.csv'; // FIX ME
let distancethreshold = [{ name : "origin" ,lat :42.626077, long :-71.322993}, { name: "threshold" ,lat : 42.628650, long : -71.321861}]
let crashlist = []
let distance = (a:number,b:number,c:number,d:number) => {

  let x = a-b 
  let y = c-d 

return Math.sqrt(Math.pow(x,2) + Math.pow(y,2))

}

let benchmark = distance(distancethreshold[0].lat,distancethreshold[1].lat,distancethreshold[1].long,distancethreshold[1].long)
csvData.forEach((row) => {
let targetdist = distance(distancethreshold[0].lat,Number(row.Latitude),distancethreshold[0].long,Number(row.Longitude))

if (targetdist <= benchmark) {
crashlist.push(row)


}

})

  const getData = async () => {
    let response = await fetch(csvFileUrl);
    let text = await response.text();
    let parsed = await papa.parse<CrashDataArray>(text,{header:true});
    console.log('Successfully parsed data:',parsed); // Log to make it easy to inspect shape of our data in the inspector
    setCsvData(parsed.data.filter((row)=>row["Near Intersection Roadway"])); // Only keep rows that have a name, so we avoid blank row at end of file
  }




  useEffect(
    ()=>{getData()},[]
  );

  useEffect(
    ()=>{
      // Update whenever data changes...
      let newPieCounts : {[key : string] : number} = {};
      let newPieData : PieDataRow[] = [];
      let newPieCounts2 : {[key : string] : number} = {};
      let newPieData2 : PieDataRow[] = [];

      csvData.forEach(
        (row)=>{
          if (!newPieCounts[row["Manner of Collision"]]) {
            newPieCounts[row["Manner of Collision"]] = 0; // initialize if not there...
          }
          newPieCounts[row["Manner of Collision"]]++ // Add one!
        }
      )
      for (let key in newPieCounts) {
        newPieData.push(
          {name : key, crashes : newPieCounts[key]}
        )
      }
      crashlist.forEach(
        (row)=>{
          if (!newPieCounts2[row["Manner of Collision"]]) {
            newPieCounts2[row["Manner of Collision"]] = 0; // initialize if not there...
          }
          newPieCounts2[row["Manner of Collision"]]++ // Add one!
        }
      )
      for (let key in newPieCounts2) {
        newPieData2.push(
          {name : key, crashes : newPieCounts2[key]}
        )
      }
     
      setPieData(newPieData);
      setPieData2(newPieData2);
      console.log('Set new pie data!',newPieData)
    }
  ,[csvData])


  return (
    <main style={{maxWidth:800,margin:'auto'}}>
      <h1>Types of Crashes near Intersectios </h1>
      <p>Loaded {csvData.length} rows of CSV Data!</p>
      <h2>Lowell</h2>
      <BarChart width={2500} height={500} data={pieData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis dataKey= "crashes" />
  <Tooltip />
  <Legend />
  <Bar dataKey="crashes" fill="#8884d8" />
  <Bar dataKey="uv" fill="#82ca9d" />
</BarChart>

<h2>Crashes near Chelmsford St/Plain St Intersection</h2>
<BarChart width={2500} height={500} data={pieData2}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis dataKey= "crashes" />
  <Tooltip />
  <Legend />
  <Bar dataKey="crashes" fill="#8884d8" />
  <Bar dataKey="uv" fill="#82ca9d" />
</BarChart>
      {csvData.map(
        (row,idx)=><div class="crashData" key={idx}>{row.Name} City Town Name : {row["City Town Name"] }| Crash Number : {row["Crash Number"]}| Manner of Collision : {row["Manner of Collision"]} | Latitude : {row["Latitude"]} | Longitude : {row["Longitude"]}</div>
      )}
    </main>
  );
  
};

export default App;
