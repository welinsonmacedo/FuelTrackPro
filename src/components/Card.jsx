import React from "react";

const Card = ({ title, children, style = {} }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        padding: "20px",
        minWidth: "150px",
        margin:"20px",
        ...style,
      }}
    >
      {title && <h3 style={{ marginBottom: "10px" }}>{title}</h3>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
