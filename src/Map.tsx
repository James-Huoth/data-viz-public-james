import React, {useEffect, useState} from "react"
import {PieDataRow} from "../types"
import { RMap, ROSM, RLayerVector, RFeature, ROverlay } from "rlayers";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Style, Text, Fill } from "ol/style";

//map component 
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
                      */}
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