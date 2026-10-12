import React, { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from "xlsx";

const ExcelSheetViewer = ({ file, url }) => {
  const [workbookData, setWorkbookData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) readExcelFile(file);
    else if (url) fetchExcelFromUrl(url);
  }, [file, url]);

  // 🔹 Local file reading
  const readExcelFile = (file) => {
    const reader = new FileReader();
    setLoading(true);
    reader.onload = (e) => processWorkbook(e.target.result);
    reader.readAsBinaryString(file);
  };

  // 🔹 Fetch from remote URL
  const fetchExcelFromUrl = async (fileUrl) => {
    try {
      setLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => processWorkbook(e.target.result);
      reader.readAsBinaryString(blob);
    } catch (error) {
      console.error("Error fetching Excel:", error);
      setLoading(false);
    }
  };

  // 🔹 Parse workbook
  const processWorkbook = (binaryStr) => {
    try {
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const allSheets = {};
      workbook.SheetNames.forEach((name) => {
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Format for react-spreadsheet
        const formatted = data.map((row) => row.map((cell) => ({ value: cell })));
        allSheets[name] = formatted;
      });
      setWorkbookData(allSheets);
      setSheetNames(workbook.SheetNames);
      setActiveSheet(workbook.SheetNames[0]);
    } catch (error) {
      console.error("Error reading Excel data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!file && !url) {
    return <p style={{ padding: "1rem" }}>Please provide either a file or a URL.</p>;
  }

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading Excel data...</p>;
  }

  const currentSheetData = workbookData[activeSheet] || [];

  return (
    <div style={{ padding: "1rem" }}>
      {/* 🔸 Tabs for multiple sheets */}
      {sheetNames.length > 1 && (
        <div style={{ display: "flex", marginBottom: "0.5rem" }}>
          {sheetNames.map((name) => (
            <button
              key={name}
              onClick={() => setActiveSheet(name)}
              style={{
                fontSize: "12px",
                padding: "2px 6px",
                color: "black",
                marginRight: "2px",
                border: activeSheet === name ? "2px solid black" : "1px solid #ccc",
                background: activeSheet === name ? "#e9f3ff" : "white",
                cursor: "pointer",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* 🔸 Spreadsheet display */}
      {currentSheetData.length > 0 ? (
        <div >
          <Spreadsheet data={currentSheetData} onChange={() => {}} />
        </div>
      ) : (
        <p>No data available in this sheet.</p>
      )}
    </div>
  );
};

export default ExcelSheetViewer;
