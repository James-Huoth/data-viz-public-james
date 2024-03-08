 
import React, { useEffect, useState } from "react";
import papa from 'papaparse'
import "./App.css";
import type { CrashDataRow, DemoDataRow, PieDataRow } from "./types";
import { BarChart, Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend, Cell, LabelList } from "recharts";
import MapComponent from "./Map";


const App = () => { 
  const [csvData,setCsvData] = useState<CrashDataRow[]>([]);
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
    let parsed = await papa.parse<CrashDataRow>(text,{header:true});
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

<h2>Map of all crashes in Lowell</h2>
      <MapComponent data={csvData}></MapComponent> 
      <h2>Map of all crashes near Chelmsford St/Plain St Intersection</h2>
      <MapComponent data={crashlist}></MapComponent>
    </main>
  );
  
};

export default App;
