
import { useEffect, useState } from "react";
import papa from 'papaparse'
import "./App.css";
import type { CrashDataArray, DemoDataRow, PieDataRow } from "./types";
import { BarChart, Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend, Cell, LabelList } from "recharts";


const App = () => {
  const [csvData,setCsvData] = useState<CrashDataArray[]>([]);
  const [pieData,setPieData] = useState<PieDataRow[]>([]);
  const csvFileUrl = '/data/GroupData.csv'; // FIX ME

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
     
      setPieData(newPieData);
      console.log('Set new pie data!',newPieData)
    }
  ,[csvData])


  return (
    <main style={{maxWidth:800,margin:'auto'}}>
      <h1>Types of Crashes near Intersections </h1>
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
      {csvData.map(
        (row,idx)=><div key={idx}>{row.Name} City Town Name : {row["City Town Name"] }| Crash Number : {row["Crash Number"]}| Manner of Collision : {row["Manner of Collision"]} | Latitude : {row["Latitude"]} | Longitude : {row["Longitude"]}</div>
      )}
    </main>
  );
};

export default App;
