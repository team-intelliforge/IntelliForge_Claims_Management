// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// const FlowDiagram = () => {
//   const steps = useSelector((state) => state.chat.flow_diagram);
//   // const [steps, useSteps] = useState(['Collect essential personal information from the customer, including full legal name, date of birth, nationality, complete residential address, and contact information (primary email address, mobile or landline number).', 'Validate all mandatory fields for format and completeness, flagging and correcting incomplete or incorrect entries.', "Obtain government-recognized documents to verify identity and address, such as a passport, national ID card, driver's license for proof of identity, and a utility bill, bank/credit card statement, lease/rental agreement, or government-issued correspondence for proof of address.", 'Instruct customers to submit high-resolution scans or photos with legible and unaltered text, including both front and back sides if applicable.', 'Cross-verify document data (name, DOB, address) with submitted information and validate against government or authorized third-party databases.', 'Perform optional digital verification, including facial recognition and liveness detection.', 'Conduct fraud detection by checking for signs of tampering or forgery and flag suspicious documents for manual review.', 'Generate a response indicating if documental data and provided data match or mismatch, listing the mismatched fields.', 'Assess customer risk profile by screening against international and regional sanctions lists, determining PEP status, and evaluating jurisdiction risk.', 'Assign a risk score based on the risk model.', 'Take action based on risk level: proceed with onboarding for low risk, request further documents/enhanced due diligence for medium risk, and escalate to Compliance for review for high risk.', 'Make a final decision to approve if all data and documents are valid and the risk score is acceptable, or reject if data or document verification fails, or risk is too high/regulatory red flags are raised.', 'Record decisions, rationale, and supporting documents in the customer record system.', 'Maintain compliance and detect suspicious activity post-onboarding through periodic KYC refresh (annually or per risk tier).', 'Monitor transactions to detect unusual activity patterns and trigger alerts when thresholds are breached.', 'Reassess KYC when there are material changes in customer information, regulatory changes, or sanctions updates.']);
//   return (
//     <div style={styles.flowContainer}>
//       {steps.map((step, index) => (
//         <React.Fragment key={index}>
//           <div style={styles.stepBox}>{step}</div>
//           {index !== steps.length - 1 && <div style={styles.arrow}>↓</div>}
//         </React.Fragment>
//       ))}
//     </div>
//   );
// };

// const styles = {
//   flowContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     overflowY: 'auto',
//     padding: '10px',
//     alignItems: 'center',
//     gap: '5px',
//     marginTop: '2vh',
//   },
//   stepBox: {
//     backgroundColor: '#e3f2fd',
//     padding: '4px 6px',
//     border: '1px solid #2196f3',
//     borderRadius: '6px',
//     minWidth: '120px',
//     maxWidth:'90%',
//     textAlign: 'center',
//     fontSize: '14px',
//     fontWeight: 500,
//   },
//   arrow: {
//     fontSize: '15px',
//     color: '#333',
//   },
// };

// export default FlowDiagram;



import React from 'react';
import { useSelector } from 'react-redux';

const FlowDiagram = () => {
  const steps = useSelector((state) => state.chat.flow_diagram || []);
  const leftOpen = useSelector((state) => state.chat.collapse)
  const tagStyles = {
    cognitive_complexity: {
      low: { backgroundColor: '#dff3d7', color: '#1f5e3a' },
      medium: { backgroundColor: '#f7e8b5', color: '#8d6a1d' },
      high: { backgroundColor: '#f7d8d8', color: '#9a3d3d' },
    },
    automation_feasibility: {
      'fully automatable': { backgroundColor: '#dff3d7', color: '#1f5e3a' },
      'semi-automatable': { backgroundColor: '#f7e8b5', color: '#8d6a1d' },
      'manual only': { backgroundColor: '#f7d8d8', color: '#9a3d3d' },
    },
    risk_level: {
      low: { backgroundColor: '#dff3d7', color: '#1f5e3a' },
      medium: { backgroundColor: '#f7e8b5', color: '#8d6a1d' },
      high: { backgroundColor: '#f7d8d8', color: '#9a3d3d' },
    },
    impact_level: {
      low: { backgroundColor: '#dff3d7', color: '#1f5e3a' },
      medium: { backgroundColor: '#f7e8b5', color: '#8d6a1d' },
      high: { backgroundColor: '#f7d8d8', color: '#9a3d3d' },
    },
  };

  const styles = {
    flowContainer: {
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '10px',
      alignItems: 'center',
      gap: '8px',
      marginTop: '2vh',
      width: '100%',
    },
    stepBox: {
      minWidth: (!leftOpen) ? '50vw' : '30vw',
      maxWidth: (!leftOpen) ? '50vw' : '30vw',
      padding: '12px 18px 10px',
      border: '1px solid #d9dfe7',
      borderRadius: '14px',
      backgroundColor: 'white',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
    },
    stepText: {
      fontSize: '1em',
      fontWeight: 500,
      lineHeight: 1.3,
      textAlign: 'left',
      color: '#1e293b',
      marginBottom: '12px',
      letterSpacing: '0.03em',
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      gap: '8px',
    },
    tag: {
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '1.5vh',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: 1.3,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },
    arrow: {
      fontSize: '24px',
      color: '#6b7280',
      margin: '4px 0',
      lineHeight: 1,
    },
  };

  const formatKey = (key) => key.replace(/_/g, ' ');
  const capitalize = (text = '') =>
    text
      .toString()
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div style={styles.flowContainer}>
      {steps.map((stepObj, index) => {
        const { steps: stepText, cognitive_complexity, automation_feasibility, risk_level, impact_level } = stepObj;

        return (
          <React.Fragment key={index}>
            <div style={styles.stepBox}>
              <div style={styles.stepText}>{stepText}</div>

              <div style={styles.tagContainer}>
                {[
                  ['cognitive_complexity', cognitive_complexity],
                  ['risk_level', risk_level],
                  ['impact_level', impact_level],
                  ['automation_feasibility', automation_feasibility],
                ].map(([key, value]) => {
                  const colorStyle = (tagStyles[key] && tagStyles[key][String(value).toLowerCase()]) || {};
                  return (
                    <span
                      key={key}
                      style={{
                        ...styles.tag,
                        ...colorStyle,
                      }}
                    >
                      {`${formatKey(key)} : ${capitalize(value)}`}
                    </span>
                  );
                })}
              </div>
            </div>

            {index !== steps.length - 1 && <div style={styles.arrow}>↓</div>}
          </React.Fragment>
        );
      })}
    </div>
  );
};



export default FlowDiagram;
