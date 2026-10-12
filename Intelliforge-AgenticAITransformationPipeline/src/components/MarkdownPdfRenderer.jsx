// import React from 'react';
// import {
//     Document,
//     Page,
//     Text,
//     View,
//     StyleSheet,
//     PDFDownloadLink
// } from '@react-pdf/renderer';

// // --- 1. Enhanced Styles ---
// const styles = StyleSheet.create({
//     page: { padding: 40, fontFamily: 'Helvetica' },
//     title: { fontSize: 22, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
//     heading: { fontSize: 16, marginTop: 15, marginBottom: 8, borderBottom: 1, paddingBottom: 2, fontWeight: 'bold' },
//     subHeading: { fontSize: 13, marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
//     text: { fontSize: 10, marginBottom: 5, lineHeight: 1.5 },
//     list: { fontSize: 10, marginBottom: 3, marginLeft: 15 },
//     bold: { fontWeight: 'bold' },

//     // Table Styles
//     table: { display: "table", width: "100%", marginTop: 10, marginBottom: 10, borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
//     tableRow: { flexDirection: "row", minHeight: 20 },
//     tableColHeader: { backgroundColor: '#f0f0f0' },
//     tableCol: { flex: 1, borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
//     tableCell: { fontSize: 9, fontWeight: 'normal' },
//     tableCellHeader: { fontSize: 9, fontWeight: 'bold' },

//     // Code Block Style
//     codeBlock: { backgroundColor: '#f4f4f4', padding: 8, borderRadius: 4, marginVertical: 10, fontFamily: 'Courier' },
//     codeText: { fontSize: 9, color: '#333' }
// });

// // --- 2. The PDF Document Component ---
// const PatientReportDocument = ({ markdownContent }) => {
//     const lines = markdownContent.split('\n');
//     const elements = [];

//     for (let i = 0; i < lines.length; i++) {
//         let line = lines[i].trim();
//         if (!line) continue;

//         // 1. Handle Headers
//         if (line.startsWith('# ')) {
//             elements.push(<Text key={i} style={styles.title}>{line.replace('# ', '')}</Text>);
//             continue;
//         }
//         if (line.startsWith('## ')) {
//             elements.push(<Text key={i} style={styles.heading}>{line.replace('## ', '')}</Text>);
//             continue;
//         }
//         if (line.startsWith('### ')) {
//             elements.push(<Text key={i} style={styles.subHeading}>{line.replace('### ', '')}</Text>);
//             continue;
//         }

//         // 2. Handle Tables (Lines starting with |)
//         if (line.startsWith('|')) {
//             const tableRows = [];
//             while (i < lines.length && lines[i].trim().startsWith('|')) {
//                 // Skip the separator line (e.g., |---|---|)
//                 if (!lines[i].includes('---')) {
//                     tableRows.push(lines[i]);
//                 }
//                 i++;
//             }

//             elements.push(
//                 <View key={i} style={styles.table}>
//                     {tableRows.map((row, rowIndex) => (
//                         <View key={rowIndex} style={[styles.tableRow, rowIndex === 0 ? styles.tableColHeader : {}]}>
//                             {row.split('|').filter(cell => cell.trim() !== '').map((cell, cellIndex) => (
//                                 <View key={cellIndex} style={styles.tableCol}>
//                                     <Text style={rowIndex === 0 ? styles.tableCellHeader : styles.tableCell}>
//                                         {cell.trim()}
//                                     </Text>
//                                 </View>
//                             ))}
//                         </View>
//                     ))}
//                 </View>
//             );
//             i--; // Adjust index because the while loop overshot
//             continue;
//         }

//         // 3. Handle Lists
//         if (line.startsWith('* ') || line.startsWith('- ')) {
//             const content = line.substring(2).trim();
//             const parts = content.split('**');
//             elements.push(
//                 <Text key={i} style={styles.list}>
//                     • {parts.map((part, pIndex) => (
//                         <Text key={pIndex} style={pIndex % 2 === 1 ? styles.bold : {}}>
//                             {part}
//                         </Text>
//                     ))}
//                 </Text>
//             );
//             continue;
//         }

//         // 4. Default Paragraph
//         const parts = line.split('**');
//         elements.push(
//             <Text key={i} style={styles.text}>
//                 {parts.map((part, pIndex) => (
//                     <Text key={pIndex} style={pIndex % 2 === 1 ? styles.bold : {}}>
//                         {part}
//                     </Text>
//                 ))}
//             </Text>
//         );
//     }

//     return (
//         <Document>
//             <Page size="A4" style={styles.page}>
//                 <View>{elements}</View>
//             </Page>
//         </Document>
//     );
// };

// // --- 3. Main Export ---
// const MarkdownPdfGenerator = ({ markdownStrings, fileName }) => {
//     return (
//         <PDFDownloadLink
//             document={<PatientReportDocument markdownContent={markdownStrings} />}
//             fileName={fileName || "report.pdf"}
//             style={{
//                 textDecoration: "none",
//                 alignSelf: "flex-end",
//                 padding: "5px 10px",
//                 color: "#fff",
//                 backgroundColor: "#FD5F07",
//                 borderRadius: "5px"
//             }}
//         >
//             {({ loading }) => (loading ? 'Preparing PDF...' : 'Save')}
//         </PDFDownloadLink>
//     );
// };

// export default MarkdownPdfGenerator;



import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import Markdown from './Markdown';
import { Button } from '@mui/material';

const MarkdownPdfGenerator = ({ markdownStrings, fileName }) => {
    const pdfRef = useRef(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const [shouldRenderPdfContent, setShouldRenderPdfContent] = useState(false);

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleDownload = async () => {
        try {
            setIsPreparing(true);
            setShouldRenderPdfContent(true);

            /*
              Wait for React to mount the hidden PDF content.
            */
            await wait(100);

            /*
              Wait for Markdown.jsx async rendering.
              Mermaid especially needs time because it renders inside useEffect.
            */
            await wait(1500);

            const element = pdfRef.current;

            if (!element) {
                console.error('PDF content element not found');
                return;
            }

            await html2pdf()
                .set({
                    filename: fileName || 'report.pdf',
                    margin: [10, 10, 10, 10],
                    image: {
                        type: 'jpeg',
                        quality: 1
                    },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: element.scrollWidth,
                        windowHeight: element.scrollHeight
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    },
                    pagebreak: {
                        mode: ['css', 'legacy']
                    }
                })
                .from(element)
                .save();

        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setShouldRenderPdfContent(false);
            setIsPreparing(false);
        }
    };

    return (
        <>
            <Button
                variant="contained" 
                color="secondary" 
                size="small" 
                sx={{maxHeight:'5vh'}}
                onClick={handleDownload}
                disabled={isPreparing}
                sx={{
                    cursor: isPreparing ? 'not-allowed' : 'pointer',
                }}
            >
                {isPreparing ? 'Preparing PDF...' : 'Save'}
            </Button>

            {shouldRenderPdfContent && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                        zIndex: 99999,
                        overflow: 'auto',
                        padding: '24px',
                        opacity:0

                    }}
                >
                    <div
                        ref={pdfRef}
                        id="pdf-content"
                        style={{
                            width: '794px',
                            minHeight: '1123px',
                            padding: '24px',
                            backgroundColor: '#ffffff',
                            color: '#111827',
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        <Markdown markdownText={markdownStrings} />
                    </div>
                </div>
            )}
        </>
    );
};

export default MarkdownPdfGenerator;