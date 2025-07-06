import React from "react";

export default function Logo({ src, width = 180, height = 80, alt = "Logotipo" }) {
  console.log("Logo src recebido:", src); // Debug

  if (!src) return <p>Logotipo não encontrado.</p>;

  return (
    <div  style={{
    
      margin:"40px",   
      maxWidth: "100%",    
    
    }}>
          <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    style={{
      objectFit: "contain",
      display: "block", 
      margin:"0 auto",   
      maxWidth: "100%",    
      maxHeight: height,
    }}
  />
    </div>
 
  );
}
