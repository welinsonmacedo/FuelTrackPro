import React from "react";
import logoImg from "../assets/logo.png";

export default function Logo({ width = 150, height = 50, alt = "FuelTrack Logo" }) {
  return (
    <img
      src={logoImg}
      alt={alt}
      width={width}
      height={height}
      style={{ display: "block" }}
    />
  );
}
