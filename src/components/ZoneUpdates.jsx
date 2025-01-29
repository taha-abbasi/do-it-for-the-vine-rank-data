// src/components/ZoneUpdates.jsx

import React, { useEffect, useState } from "react";

export default function ZoneUpdates() {
  const [zoneData, setZoneData] = useState({ lastRun: "", domains: [] });

  useEffect(() => {
    fetch("/zone_updates.json")
      .then((res) => res.json())
      .then((data) => {
        setZoneData(data);
      })
      .catch((err) => {
        console.error("Error fetching zone updates:", err);
      });
  }, []);

  return (
    <div>
      <h3>DNS Zone Updates</h3>
      <p>Last check: {zoneData.lastRun}</p>
      <ul>
        {zoneData.domains.map((item) => (
          <li key={item.domain}>
            <strong>{item.domain}</strong> — Serial: {item.serial} 
            {item.changed ? " (Changed)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}