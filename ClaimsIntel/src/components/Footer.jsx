import React from "react";
import gcpIcon from "../assets/gcp.png"; // adjust path as needed

const Footer = () => {
    const services_list = "Cloud Run,   Cloud Storage,   Fire Store,   AlloyDB,   Cloud SQL,   Pub/Sub,   Firebase,   Vertex AI,   Compute Engine,   Spanner Graph,   ADK,   A2A, Google Maps";
  const styles = {
    footer: {
      height: "4vh",
      width: "84vw",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 2rem",
      backgroundColor: "#10263D",
      boxSizing: "border-box",
      position: "fixed",   // remove if you don't want it fixed
      bottom: 0,
      right: 0,
    },
    text: {
      fontSize: "0.7rem",
      color:'white'
    },
    icon: {
      height: "100%",       // scales nicely within 5vh footer
      objectFit: "contain",
      cursor: "pointer",
    },
  };

  return (
    <footer style={styles.footer}>
      <span style={styles.text}>{services_list}</span>
      <img src={gcpIcon} alt="GCP Icon" style={styles.icon} />
    </footer>
  );
};

export default Footer;
