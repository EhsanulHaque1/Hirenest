import "./Pages.css";

import { useEffect, useState } from "react";

// Mock data for fallback when API is not available
const mockServices = [
  "Website Design",
  "Mobile App Design",
  "Landing Pages",
  "UI Kits",
  "Prototyping",
  "User Research",
];

const mockProcess = [
  "Discovery & Research",
  "Wireframing",
  "Visual Design",
  "Prototyping",
  "User Testing",
  "Final Delivery",
];

function UIUXDesign() {
  const [services, setServices] = useState(mockServices);
  const [process, setProcess] = useState(mockProcess);

  useEffect(() => {
    fetch("/api/services/ui-ux-design")
      .then((res) => {
        if (!res.ok) {
          throw new Error("API not available");
        }
        return res.json();
      })
      .then((data) => {
        setServices(data.services || mockServices);
        setProcess(data.process || mockProcess);
      })
      .catch((err) => {
        console.log("Using mock data for UI/UX design");
      });
  }, []);

  return (
    <div className="page-container">
      <h1>UI/UX Design</h1>
      <p className="intro-text">
        Find talented designers who create beautiful and user-friendly
        interfaces.
      </p>

      <div className="content-section">
        <h2>Our Design Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-badge">
              {service}
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Design Process</h2>
        <ol className="process-list">
          {process.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default UIUXDesign;
