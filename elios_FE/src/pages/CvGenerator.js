// FRONT-END: cv-generate-module/src/pages/Editor.js
import React, { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

const  CvGenerator =  () => {
  const [cvData, setCvData] = useState({
    name: "",
    jobTitle: "",
    about: "",
  });

  const cvRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCvData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = () => {
    const element = cvRef.current;
    const options = {
      margin: 0.5,
      filename: `${cvData.name || "cv"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* --- CV Editor Form --- */}
      <div style={{ flex: 1 }}>
        <h2>Edit CV</h2>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={cvData.name}
          onChange={handleChange}
        />
        <br />
        <input
          type="text"
          name="jobTitle"
          placeholder="Job Title"
          value={cvData.jobTitle}
          onChange={handleChange}
        />
        <br />
        <textarea
          name="about"
          placeholder="About Me"
          value={cvData.about}
          onChange={handleChange}
        />
        <br />
        <button onClick={handleDownload}>Download PDF</button>
      </div>

      {/* --- CV Preview --- */}
      <div
        ref={cvRef}
        style={{
          flex: 1,
          border: "1px solid #ddd",
          padding: "1rem",
          background: "#fff",
        }}
      >
        <h1>{cvData.name || "Your Name"}</h1>
        <h3>{cvData.jobTitle || "Your Job Title"}</h3>
        <p>{cvData.about || "Write something about yourself..."}</p>
      </div>
    </div>
  );
}

export default CvGenerator;
