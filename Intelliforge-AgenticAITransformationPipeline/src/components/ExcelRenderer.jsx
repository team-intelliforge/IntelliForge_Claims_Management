import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const ExcelRenderer = ({ file, url }) => {
  const [workbookData, setWorkbookData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      readExcelFile(file);
    } else if (url) {
      fetchExcelFromUrl(url);
    }
  }, [file, url]);

  // 🔹 Handle Local File Upload
  const readExcelFile = (file) => {
    const reader = new FileReader();
    setLoading(true);
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      processWorkbook(binaryStr);
    };
    reader.readAsBinaryString(file);
  };

  // 🔹 Handle Remote URL
  const fetchExcelFromUrl = async (fileUrl) => {
    try {
      setLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        processWorkbook(binaryStr);
      };
      reader.readAsBinaryString(blob);
    } catch (err) {
      console.error("Failed to load Excel file:", err);
      setLoading(false);
    }
  };

  // 🔹 Common Processing Function
  const processWorkbook = (binaryStr) => {
    try {
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const allSheets = {};
      workbook.SheetNames.forEach((name) => {
        const sheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        allSheets[name] = jsonData;
      });
      setWorkbookData(allSheets);
      setSheetNames(workbook.SheetNames);
      setActiveSheet(workbook.SheetNames[0]);
    } catch (err) {
      console.error("Error reading Excel data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!file && !url) {
    return <p>Please provide either a file or a URL.</p>;
  }

  if (loading) {
    return <p>Loading Excel data...</p>;
  }

  const currentData = workbookData[activeSheet] || [];

  return (
    <div style={{ padding: "1rem" }}>
      {/* Tabs for each sheet */}
      {sheetNames.length > 1 && (
        <div style={{ display: "flex", marginBottom: "2px" }}>
          {sheetNames.map((name) => (
            <button
              key={name}
              onClick={() => setActiveSheet(name)}
              style={{
                fontSize:'12px',
                padding: "2px 4px",
                color:'black',
                marginRight: "8px",
                border: activeSheet === name ? "1px solid black" : "1px solid #ccc",
                background: activeSheet === name ? "#e9f3ff" : "white",
                cursor: "pointer",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Render selected sheet */}
      {currentData.length > 0 ? (
        <table
          border="1"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            marginTop: "10px",
          }}
        >
          <tbody>
            {currentData.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "6px", textAlign: "left" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data in this sheet.</p>
      )}
    </div>
  );
};

export default ExcelRenderer;
