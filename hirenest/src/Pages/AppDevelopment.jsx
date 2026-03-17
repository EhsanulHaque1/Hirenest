import "./Pages.css";

import { useEffect, useState } from "react";

// Mock data for fallback when API is not available
const mockPlatforms = [
  { icon: "📱", name: "iOS" },
  { icon: "🤖", name: "Android" },
  { icon: "🌐", name: "Cross-Platform" },
  { icon: "📲", name: "React Native" },
];

const mockBenefits = [
  "Expert developers with 5+ years experience",
  "Fast turnaround time",
  "Quality assurance testing included",
  "Post-launch support",
  "Competitive pricing",
];

function AppDevelopment() {
  const [platforms, setPlatforms] = useState(mockPlatforms);
  const [benefits, setBenefits] = useState(mockBenefits);

  useEffect(() => {
    fetch("/api/services/app-development")
      .then((res) => {
        if (!res.ok) {
          throw new Error("API not available");
        }
        return res.json();
      })
      .then((data) => {
        setPlatforms(data.platforms || mockPlatforms);
        setBenefits(data.benefits || mockBenefits);
      })
      .catch((err) => {
        console.log("Using mock data for app development");
      });
  }, []);

  return (
    <div className="page-container">
      <h1>App Development</h1>
      <p className="intro-text">
        Discover expert app developers for iOS, Android, and cross-platform
        projects.
      </p>

      <div className="content-section">
        <h2>Available Platforms</h2>
        <div className="platforms-grid">
          {platforms.map((platform, index) => (
            <div key={index} className="platform-card">
              <div className="platform-icon">{platform.icon}</div>
              <h3>{platform.name}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Why Choose Our Developers?</h2>
        <ul className="benefits-list">
          {benefits.map((item, index) => (
            <li key={index}>✓ {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AppDevelopment;
