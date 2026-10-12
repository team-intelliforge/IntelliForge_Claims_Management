// import React, { useEffect, useRef, useMemo } from 'react';
// import { Network } from 'vis-network/standalone';
// import { DataSet } from 'vis-data/standalone';
// import { useSelector } from 'react-redux';
// import Chatbot from './Chatbot';
// const transformData = (data) => {
//   const nodeMap = new Map();
//   const nodes = [];
//   const edges = [];
//   let edgeId = 1;
//   let nodeIdCounter = 1;

//   const getGroup = (label) => {
//     if (label.includes('Agent') || label.includes('agent')) return 'Agent';
    
//     return 'Other';
//   };

//   data.forEach(([source, target]) => {
//     const processNode = (label) => {
//       if (!nodeMap.has(label)) {
//         nodeMap.set(label, nodeIdCounter++);
//         nodes.push({ 
//           id: nodeMap.get(label), 
//           label: label, 
//           group: getGroup(label), 
//           title: label, 
//         });
//       }
//       return nodeMap.get(label);
//     };

//     const sourceId = processNode(source);
//     const targetId = processNode(target);

//     edges.push({
//       id: edgeId++,
//       from: sourceId,
//       to: targetId,
//       width: 2, // Slightly thicker edges for color visibility
//     });
//   });

//   return {
//     nodes: new DataSet(nodes),
//     edges: new DataSet(edges),
//   };
// };

// const GraphVisualization = ({rawData}) => {
//   // const rawData = useSelector((state) => state.chat.graphNodes || []);
//   const visJsContainer = useRef(null);
  
//   // Memoize data so it doesn't recalculate on every render
//   const { nodes, edges } = useMemo(() => transformData(rawData), [rawData]);

//   useEffect(() => {
//     let network = null;

//     if (visJsContainer.current) {
//       const data = { nodes, edges };

//       const options = {
//         layout: {
//           Hubsize: {
//             enabled: true,
//             direction: 'UD',        // ⭐ SPREAD HORIZONTALLY (Left to Right)
//             sortMethod: 'directed', // Preserves the flow of arrows
//             nodeSpacing: 50,       // Distance between nodes in the same column
//             levelSeparation: 50,   // Distance between columns
//           },
//         },
//         nodes: {
//           shape: 'dot',
//           size: 25,
//           font: {
//             size: 20,
//             color: '#222',
//             face: 'Inter, system-ui, sans-serif',
//             // background: 'rgba(255, 255, 255, 0.7)',
//             vadjust: -30, // Move label below the dot
//           },
//           borderWidth: 2,
//           shadow: true,
//         },
//         edges: {
//           arrows: { to: { enabled: true, scaleFactor: 0.8 } },
//           color: { inherit: 'from', opacity: 0.6 },
//           smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 },
//         },
//         physics: {
//           enabled: false, // Hierarchical layout works best with physics off
//         },
//         groups: {
//           Agent: { color: { background: '#ff3caa58', border: '#D1228B' } },
//           Other: { color: { background: '#00d0ff54', border: '#0095B3' } },
//         },
//         interaction: {
//           hover: true,
          
//           keyboard: true,
//         },
//       };

//       network = new Network(visJsContainer.current, data, options);
//     }

//     return () => {
//       if (network) network.destroy();
//     };
//   }, [nodes, edges]);

//   return (
//     <div style={{ width: '100%', height: '70vh', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
//       <div ref={visJsContainer} style={{ width: '100%', height: '100%' }} />
//       <Chatbot bottom={70} right={20} />
//     </div>
//   );
// };

// export default GraphVisualization;


// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------

// not too much version 


// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { Network } from 'vis-network/standalone';
// import { DataSet } from 'vis-data/standalone';

// /**
//  * Supported input format:
//  *
//  * [
//  *   ['Claim_CLM001', 'Member_P9988'],
//  *   ['Claim_CLM001', 'Plan_PL001'],
//  *   ['Plan_PL001', 'Oncology_Services'],
//  * ]
//  *
//  * The component supports both:
//  * 1. Insurance claim evidence graphs
//  * 2. ATM fraud and duplicate-claim graphs
//  */

// const GROUPS = {
//   Claim: {
//     label: 'Claim',
//     background: '#DBEAFE',
//     border: '#2563EB',
//   },

//   Person: {
//     label: 'Member / Customer',
//     background: '#EDE9FE',
//     border: '#7C3AED',
//   },

//   Account: {
//     label: 'Account / Card',
//     background: '#CFFAFE',
//     border: '#0891B2',
//   },

//   Transaction: {
//     label: 'Transaction / ATM',
//     background: '#FFEDD5',
//     border: '#EA580C',
//   },

//   Policy: {
//     label: 'Plan / Policy',
//     background: '#FEF3C7',
//     border: '#D97706',
//   },

//   Clinical: {
//     label: 'Clinical Evidence',
//     background: '#DCFCE7',
//     border: '#16A34A',
//   },

//   Code: {
//     label: 'Medical Code',
//     background: '#CCFBF1',
//     border: '#0F766E',
//   },

//   Rule: {
//     label: 'Rule / Compliance',
//     background: '#FCE7F3',
//     border: '#DB2777',
//   },

//   Validation: {
//     label: 'Validation',
//     background: '#ECFCCB',
//     border: '#65A30D',
//   },

//   PositiveDecision: {
//     label: 'Approval / Payment',
//     background: '#D1FAE5',
//     border: '#059669',
//   },

//   NegativeDecision: {
//     label: 'Denial / Closure',
//     background: '#FEE2E2',
//     border: '#DC2626',
//   },

//   Action: {
//     label: 'Action',
//     background: '#F3E8FF',
//     border: '#9333EA',
//   },

//   Other: {
//     label: 'Other',
//     background: '#F1F5F9',
//     border: '#64748B',
//   },
// };

// const includesAny = (value = '', keywords = []) => {
//   const normalizedValue = String(value).toLowerCase();

//   return keywords.some((keyword) =>
//     normalizedValue.includes(keyword.toLowerCase())
//   );
// };

// /**
//  * Determines the node color based on its label.
//  *
//  * More specific classifications are checked first.
//  * For example, Denied_Duplicate_Claim should be a
//  * decision rather than a generic Claim node.
//  */
// const getGroup = (label = '') => {
//   if (
//     includesAny(label, [
//       'denied',
//       'deny',
//       'rejected',
//       'close_claim',
//       'closed',
//       'closure',
//       'no_financial_adjustment',
//       'additional_payment_not_required',
//     ])
//   ) {
//     return 'NegativeDecision';
//   }

//   if (
//     includesAny(label, [
//       'pay_claim',
//       'pay claim',
//       'payment_recommendation',
//       'payment recommendation',
//       'approved',
//       'approval',
//       'reimbursement_approved',
//     ])
//   ) {
//     return 'PositiveDecision';
//   }

//   if (
//     includesAny(label, [
//       'customer_notification',
//       'notify_customer',
//       'notification_required',
//       'reprocess',
//       'corrective_action',
//       'review_action',
//       'financial_adjustment',
//     ])
//   ) {
//     return 'Action';
//   }

//   if (
//     includesAny(label, [
//       'claim_',
//       'claim-',
//       'original_claim',
//       'duplicate_of',
//     ])
//   ) {
//     return 'Claim';
//   }

//   if (
//     includesAny(label, [
//       'member',
//       'customer',
//       'provider',
//       'physician',
//     ])
//   ) {
//     return 'Person';
//   }

//   if (
//     includesAny(label, [
//       'account',
//       'card',
//       'bank',
//       'wallet',
//     ])
//   ) {
//     return 'Account';
//   }

//   if (
//     includesAny(label, [
//       'transaction',
//       'atm',
//       'debit',
//       'cash_dispense',
//       'terminal',
//       'authorization_code',
//       'entry_mode',
//     ])
//   ) {
//     return 'Transaction';
//   }

//   if (
//     includesAny(label, [
//       'plan',
//       'policy',
//       'benefit',
//       'oncology_services',
//       'coverage_policy',
//       'services_covered',
//     ])
//   ) {
//     return 'Policy';
//   }

//   if (
//     includesAny(label, [
//       'pathology',
//       'adenocarcinoma',
//       'lung_specimen',
//       'clinical',
//       'document',
//       'evidence',
//       'ihc',
//       'surgical_pathology',
//     ])
//   ) {
//     return 'Clinical';
//   }

//   if (
//     includesAny(label, [
//       'cpt',
//       'icd',
//       'diagnostic_code',
//       'procedure_code',
//     ])
//   ) {
//     return 'Code';
//   }

//   if (
//     includesAny(label, [
//       'sop',
//       'reg_e',
//       'rule',
//       'authority',
//       'tier_',
//       'fcrm',
//       'timeliness',
//       'due_date',
//       'required_timeline',
//     ])
//   ) {
//     return 'Rule';
//   }

//   if (
//     includesAny(label, [
//       'confirmed',
//       'satisfied',
//       'passed',
//       'applicable',
//       'match_status',
//       'previously_investigated',
//       'previously_resolved',
//       'previous_reimbursement',
//       'investigation_not_required',
//       'coverage_conditions',
//     ])
//   ) {
//     return 'Validation';
//   }

//   return 'Other';
// };

// /**
//  * Converts identifiers into readable multiline labels.
//  *
//  * Example:
//  * Previous_Reimbursement_Issued
//  *
//  * Becomes:
//  * Previous Reimbursement
//  * Issued
//  */
// const formatLabel = (label = '') => {
//   const formatted = String(label)
//     .replace(/&amp;/g, '&')
//     .replace(/_/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();

//   const words = formatted.split(' ');
//   const lines = [];
//   let currentLine = '';

//   words.forEach((word) => {
//     const nextLine = currentLine
//       ? `${currentLine} ${word}`
//       : word;

//     if (nextLine.length > 20 && currentLine) {
//       lines.push(currentLine);
//       currentLine = word;
//     } else {
//       currentLine = nextLine;
//     }
//   });

//   if (currentLine) {
//     lines.push(currentLine);
//   }

//   return lines.join('\n');
// };

// /**
//  * Transforms the source-target relationship list into
//  * vis-network nodes and edges.
//  */
// const transformData = (rawData = []) => {
//   const nodeMap = new Map();
//   const nodeItems = [];
//   const edgeItems = [];

//   let nodeId = 1;
//   let edgeId = 1;

//   const createNode = (rawLabel) => {
//     const normalizedLabel = String(rawLabel ?? '').trim();

//     if (!normalizedLabel) {
//       return null;
//     }

//     if (!nodeMap.has(normalizedLabel)) {
//       const id = nodeId++;
//       const group = getGroup(normalizedLabel);

//       nodeMap.set(normalizedLabel, id);

//       nodeItems.push({
//         id,
//         label: formatLabel(normalizedLabel),
//         title: normalizedLabel
//           .replace(/&amp;/g, '&')
//           .replace(/_/g, ' '),
//         group,
//       });
//     }

//     return nodeMap.get(normalizedLabel);
//   };

//   const safeRawData = Array.isArray(rawData)
//     ? rawData
//     : [];

//   safeRawData.forEach((relationship) => {
//     if (
//       !Array.isArray(relationship) ||
//       relationship.length < 2
//     ) {
//       return;
//     }

//     const [source, target] = relationship;

//     if (!source || !target) {
//       return;
//     }

//     const sourceId = createNode(source);
//     const targetId = createNode(target);

//     if (!sourceId || !targetId) {
//       return;
//     }

//     edgeItems.push({
//       id: edgeId++,
//       from: sourceId,
//       to: targetId,
//     });
//   });

//   return {
//     nodeItems,
//     edgeItems,
//     activeGroups: [
//       ...new Set(nodeItems.map((node) => node.group)),
//     ],
//   };
// };

// const GraphVisualization = ({
//   rawData = [],
//   height = '55vh',
//   minHeight = '55vh',
// }) => {
//   const wrapperRef = useRef(null);
//   const graphContainerRef = useRef(null);
//   const networkRef = useRef(null);

//   const [isFullscreen, setIsFullscreen] =
//     useState(false);

//   const {
//     nodeItems,
//     edgeItems,
//     activeGroups,
//   } = useMemo(() => transformData(rawData), [rawData]);

//   /**
//    * Listen for fullscreen changes.
//    *
//    * This also catches the user exiting fullscreen
//    * by pressing the Escape key.
//    */
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const fullscreenElement =
//         document.fullscreenElement ||
//         document.webkitFullscreenElement;

//       const fullscreenActive =
//         fullscreenElement === wrapperRef.current;

//       setIsFullscreen(fullscreenActive);

//       /*
//        * Wait for the browser to finish resizing the
//        * fullscreen element before redrawing the graph.
//        */
//       window.setTimeout(() => {
//         if (!networkRef.current) {
//           return;
//         }

//         networkRef.current.redraw();

//         networkRef.current.fit({
//           animation: {
//             duration: 350,
//             easingFunction: 'easeInOutQuad',
//           },
//         });
//       }, 150);
//     };

//     document.addEventListener(
//       'fullscreenchange',
//       handleFullscreenChange
//     );

//     document.addEventListener(
//       'webkitfullscreenchange',
//       handleFullscreenChange
//     );

//     return () => {
//       document.removeEventListener(
//         'fullscreenchange',
//         handleFullscreenChange
//       );

//       document.removeEventListener(
//         'webkitfullscreenchange',
//         handleFullscreenChange
//       );
//     };
//   }, []);

//   /**
//    * Opens or closes fullscreen mode.
//    */
//   const toggleFullscreen = async () => {
//     const wrapper = wrapperRef.current;

//     if (!wrapper) {
//       return;
//     }

//     try {
//       const fullscreenElement =
//         document.fullscreenElement ||
//         document.webkitFullscreenElement;

//       if (fullscreenElement) {
//         if (document.exitFullscreen) {
//           await document.exitFullscreen();
//         } else if (document.webkitExitFullscreen) {
//           document.webkitExitFullscreen();
//         }

//         return;
//       }

//       if (wrapper.requestFullscreen) {
//         await wrapper.requestFullscreen();
//       } else if (wrapper.webkitRequestFullscreen) {
//         wrapper.webkitRequestFullscreen();
//       }
//     } catch (error) {
//       console.error(
//         'Unable to change graph fullscreen mode:',
//         error
//       );
//     }
//   };

//   /**
//    * Create the vis-network graph.
//    */
//   useEffect(() => {
//     if (
//       !graphContainerRef.current ||
//       nodeItems.length === 0
//     ) {
//       return undefined;
//     }

//     const nodes = new DataSet(nodeItems);
//     const edges = new DataSet(edgeItems);

//     const visGroups = Object.entries(GROUPS).reduce(
//       (result, [groupName, group]) => {
//         result[groupName] = {
//           color: {
//             background: group.background,
//             border: group.border,

//             highlight: {
//               background: group.background,
//               border: group.border,
//             },

//             hover: {
//               background: group.background,
//               border: group.border,
//             },
//           },
//         };

//         return result;
//       },
//       {}
//     );

//     const options = {
//       /*
//        * No hierarchy is used, allowing nodes to move
//        * freely in every direction.
//        */
//       layout: {
//         hierarchical: {
//           enabled: false,
//         },
//         improvedLayout: true,
//         randomSeed: 42,
//       },

//       nodes: {
//         shape: 'dot',
//         size: 28,
//         borderWidth: 2,
//         borderWidthSelected: 4,

//         font: {
//           size: 13,
//           color: '#1E293B',
//           face: 'Inter, Arial, sans-serif',
//           align: 'center',
//           vadjust: 39,
//           strokeWidth: 4,
//           strokeColor: '#FFFFFF',
//         },

//         shadow: {
//           enabled: true,
//           color: 'rgba(15, 23, 42, 0.15)',
//           size: 10,
//           x: 0,
//           y: 4,
//         },
//       },

//       edges: {
//         width: 2,
//         selectionWidth: 3,
//         hoverWidth: 3,

//         arrows: {
//           to: {
//             enabled: true,
//             scaleFactor: 0.75,
//           },
//         },

//         color: {
//           inherit: 'from',
//           opacity: 0.55,
//         },

//         smooth: {
//           enabled: true,
//           type: 'dynamic',
//           roundness: 0.35,
//         },
//       },

//       groups: visGroups,

//       /*
//        * Physics creates the initial layout.
//        * It is disabled after stabilization so that
//        * the graph does not continuously move.
//        */
//       physics: {
//         enabled: true,
//         solver: 'forceAtlas2Based',

//         forceAtlas2Based: {
//           gravitationalConstant: -15,
//           centralGravity: 0.008,
//           springLength: 165,
//           springConstant: 0.055,
//           damping: 0.5,
//           avoidOverlap: 0.85,
//         },

//         stabilization: {
//           enabled: true,
//           iterations: 300,
//           updateInterval: 25,
//           fit: true,
//         },

//         minVelocity: 0.75,
//       },

//       interaction: {
//         hover: true,
//         dragNodes: true,
//         dragView: true,
//         zoomView: true,
//         selectConnectedEdges: true,
//         hoverConnectedEdges: true,
//         tooltipDelay: 150,
//         multiselect: false,
//       },
//     };

//     const network = new Network(
//       graphContainerRef.current,
//       {
//         nodes,
//         edges,
//       },
//       options
//     );

//     networkRef.current = network;

//     network.once(
//       'stabilizationIterationsDone',
//       () => {
//         /*
//          * Disable physics after calculating the initial
//          * layout. Nodes remain freely draggable.
//          */
//         network.setOptions({
//           physics: {
//             enabled: false,
//           },
//         });

//         network.fit({
//           animation: {
//             duration: 450,
//             easingFunction: 'easeInOutQuad',
//           },
//         });
//       }
//     );

//     return () => {
//       network.destroy();
//       networkRef.current = null;
//     };
//   }, [nodeItems, edgeItems]);

//   if (
//     !Array.isArray(rawData) ||
//     rawData.length === 0
//   ) {
//     return (
//       <div
//         style={{
//           ...styles.emptyState,
//           height,
//           minHeight,
//         }}
//       >
//         No graph relationships available.
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={wrapperRef}
//       style={{
//         ...styles.wrapper,
//         height: isFullscreen ? '100vh' : height,
//         minHeight: isFullscreen ? '100vh' : minHeight,
//         borderRadius: isFullscreen ? 0 : 10,
//         border: isFullscreen
//           ? 'none'
//           : styles.wrapper.border,
//       }}
//     >
//       <div style={styles.legend}>
//         <div style={styles.legendItems}>
//           {activeGroups.map((groupName) => {
//             const group = GROUPS[groupName];

//             if (!group) {
//               return null;
//             }

//             return (
//               <div
//                 key={groupName}
//                 style={styles.legendItem}
//               >
//                 <span
//                   style={{
//                     ...styles.legendColor,
//                     backgroundColor: group.background,
//                     borderColor: group.border,
//                   }}
//                 />

//                 <span>{group.label}</span>
//               </div>
//             );
//           })}
//         </div>

//         <button
//           type="button"
//           onClick={toggleFullscreen}
//           style={styles.fullscreenButton}
//           title={
//             isFullscreen
//               ? 'Exit fullscreen'
//               : 'Open graph in fullscreen'
//           }
//           aria-label={
//             isFullscreen
//               ? 'Exit graph fullscreen'
//               : 'Open graph in fullscreen'
//           }
//         >
//           <span style={styles.fullscreenIcon}>
//             {isFullscreen ? '↙' : '↗'}
//           </span>

//           <span>
//             {isFullscreen
//               ? 'Exit Fullscreen'
//               : 'Fullscreen'}
//           </span>
//         </button>
//       </div>

//       <div
//         ref={graphContainerRef}
//         style={styles.graphContainer}
//       />
//     </div>
//   );
// };

// const styles = {
//   wrapper: {
//     width: '100%',
//     overflow: 'hidden',
//     backgroundColor: '#FFFFFF',
//     border: '1px solid #E2E8F0',
//     borderRadius: 10,
//     fontFamily: 'Inter, Arial, sans-serif',
//   },

//   legend: {
//     minHeight: 49,
//     boxSizing: 'border-box',
//     padding: '8px 12px 8px 16px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 16,
//     backgroundColor: '#F8FAFC',
//     borderBottom: '1px solid #E2E8F0',
//   },

//   legendItems: {
//     display: 'flex',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: '10px 18px',
//     minWidth: 0,
//   },

//   legendItem: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: 7,
//     color: '#475569',
//     fontSize: 12,
//     whiteSpace: 'nowrap',
//   },

//   legendColor: {
//     width: 12,
//     height: 12,
//     boxSizing: 'border-box',
//     display: 'inline-block',
//     flexShrink: 0,
//     borderRadius: '50%',
//     border: '2px solid',
//   },

//   fullscreenButton: {
//     height: 34,
//     padding: '0 12px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 7,
//     flexShrink: 0,
//     color: '#4338CA',
//     backgroundColor: '#FFFFFF',
//     border: '1px solid #C7D2FE',
//     borderRadius: 8,
//     fontFamily: 'Inter, Arial, sans-serif',
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//     boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
//   },

//   fullscreenIcon: {
//     fontSize: 16,
//     lineHeight: 1,
//   },

//   graphContainer: {
//     width: '100%',
//     height: 'calc(100% - 49px)',
//     backgroundColor: '#FFFFFF',
//     backgroundImage:
//       'radial-gradient(circle, #DDE4EE 1px, transparent 1px)',
//     backgroundSize: '22px 22px',
//   },

//   emptyState: {
//     width: '100%',
//     boxSizing: 'border-box',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: '#64748B',
//     backgroundColor: '#FFFFFF',
//     border: '1px solid #E2E8F0',
//     borderRadius: 10,
//     fontFamily: 'Inter, Arial, sans-serif',
//     fontSize: 13,
//   },
// };

// export default GraphVisualization;

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------

// not too much version - left to right
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data/standalone';
import Chatbot from './Chatbot';

/*
Expected input:

[
  ['Claim_CLM001', 'Member_P9988'],
  ['Claim_CLM001', 'Plan_PL001'],
  ['Plan_PL001', 'Oncology_Services'],
  ['Coverage_Conditions_Satisfied', 'Pay_Claim_Recommendation'],
]

The first/root entity should be used as the source in the
initial relationships so that it appears on the left.
*/

const GROUPS = {
  Claim: {
    label: 'Claim',
    background: '#DBEAFE',
    border: '#2563EB',
  },

  Person: {
    label: 'Member / Customer',
    background: '#EDE9FE',
    border: '#7C3AED',
  },

  Account: {
    label: 'Account / Card',
    background: '#CFFAFE',
    border: '#0891B2',
  },

  Transaction: {
    label: 'Transaction / ATM',
    background: '#FFEDD5',
    border: '#EA580C',
  },

  Policy: {
    label: 'Plan / Policy',
    background: '#FEF3C7',
    border: '#D97706',
  },

  Clinical: {
    label: 'Clinical Evidence',
    background: '#DCFCE7',
    border: '#16A34A',
  },

  Code: {
    label: 'Medical Code',
    background: '#CCFBF1',
    border: '#0F766E',
  },

  Rule: {
    label: 'Rule / Compliance',
    background: '#FCE7F3',
    border: '#DB2777',
  },

  Validation: {
    label: 'Validation',
    background: '#ECFCCB',
    border: '#65A30D',
  },

  PositiveDecision: {
    label: 'Approval / Payment',
    background: '#D1FAE5',
    border: '#059669',
  },

  NegativeDecision: {
    label: 'Denial / Closure',
    background: '#FEE2E2',
    border: '#DC2626',
  },

  Action: {
    label: 'Action',
    background: '#F3E8FF',
    border: '#9333EA',
  },

  Other: {
    label: 'Other',
    background: '#F1F5F9',
    border: '#64748B',
  },
};

const includesAny = (value = '', keywords = []) => {
  const normalizedValue = String(value).toLowerCase();

  return keywords.some((keyword) =>
    normalizedValue.includes(keyword.toLowerCase())
  );
};

const getGroup = (label = '') => {
  if (
    includesAny(label, [
      'denied',
      'deny',
      'rejected',
      'close_claim',
      'closed',
      'closure',
      'no_financial_adjustment',
      'additional_payment_not_required',
    ])
  ) {
    return 'NegativeDecision';
  }

  if (
    includesAny(label, [
      'pay_claim',
      'pay claim',
      'payment_recommendation',
      'payment recommendation',
      'approved',
      'approval',
      'reimbursement_approved',
    ])
  ) {
    return 'PositiveDecision';
  }

  if (
    includesAny(label, [
      'customer_notification',
      'notify_customer',
      'notification_required',
      'reprocess',
      'corrective_action',
      'review_action',
      'financial_adjustment',
    ])
  ) {
    return 'Action';
  }

  if (
    includesAny(label, [
      'claim_',
      'claim-',
      'original_claim',
      'duplicate_of',
    ])
  ) {
    return 'Claim';
  }

  if (
    includesAny(label, [
      'member',
      'customer',
      'provider',
      'physician',
    ])
  ) {
    return 'Person';
  }

  if (
    includesAny(label, [
      'account',
      'card',
      'bank',
      'wallet',
    ])
  ) {
    return 'Account';
  }

  if (
    includesAny(label, [
      'transaction',
      'atm',
      'debit',
      'cash_dispense',
      'terminal',
      'authorization_code',
      'entry_mode',
    ])
  ) {
    return 'Transaction';
  }

  if (
    includesAny(label, [
      'plan',
      'policy',
      'benefit',
      'oncology_services',
      'coverage_policy',
      'services_covered',
    ])
  ) {
    return 'Policy';
  }

  if (
    includesAny(label, [
      'pathology',
      'adenocarcinoma',
      'lung_specimen',
      'clinical',
      'document',
      'evidence',
      'ihc',
      'surgical_pathology',
    ])
  ) {
    return 'Clinical';
  }

  if (
    includesAny(label, [
      'cpt',
      'icd',
      'diagnostic_code',
      'procedure_code',
    ])
  ) {
    return 'Code';
  }

  if (
    includesAny(label, [
      'sop',
      'reg_e',
      'rule',
      'authority',
      'tier_',
      'fcrm',
      'timeliness',
      'due_date',
      'required_timeline',
    ])
  ) {
    return 'Rule';
  }

  if (
    includesAny(label, [
      'confirmed',
      'satisfied',
      'passed',
      'applicable',
      'match_status',
      'previously_investigated',
      'previously_resolved',
      'previous_reimbursement',
      'investigation_not_required',
      'coverage_conditions',
    ])
  ) {
    return 'Validation';
  }

  return 'Other';
};

const decodeHtml = (value = '') => {
  if (typeof document === 'undefined') {
    return String(value)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = String(value);

  return textarea.value;
};

const formatLabel = (label = '') => {
  const formatted = decodeHtml(label)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = formatted.split(' ');
  const lines = [];

  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (nextLine.length > 22 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
};

const transformData = (rawData = []) => {
  const nodeMap = new Map();
  const nodeItems = [];
  const edgeItems = [];

  let nodeId = 1;
  let edgeId = 1;

  const createNode = (rawLabel) => {
    const normalizedLabel = String(rawLabel ?? '').trim();

    if (!normalizedLabel) {
      return null;
    }

    if (!nodeMap.has(normalizedLabel)) {
      const id = nodeId++;
      const group = getGroup(normalizedLabel);

      nodeMap.set(normalizedLabel, id);

      nodeItems.push({
        id,
        label: formatLabel(normalizedLabel),
        title: decodeHtml(normalizedLabel).replace(/_/g, ' '),
        group,
      });
    }

    return nodeMap.get(normalizedLabel);
  };

  const safeRawData = Array.isArray(rawData)
    ? rawData
    : [];

  safeRawData.forEach((relationship) => {
    if (
      !Array.isArray(relationship) ||
      relationship.length < 2
    ) {
      return;
    }

    const [source, target] = relationship;

    if (!source || !target) {
      return;
    }

    const sourceId = createNode(source);
    const targetId = createNode(target);

    if (!sourceId || !targetId) {
      return;
    }

    edgeItems.push({
      id: edgeId++,
      from: sourceId,
      to: targetId,
    });
  });

  return {
    nodeItems,
    edgeItems,
    activeGroups: [
      ...new Set(nodeItems.map((node) => node.group)),
    ],
  };
};

const GraphVisualization = ({
  rawData = [],
  height = '75vh',
  minHeight = '70vh',
}) => {
  const wrapperRef = useRef(null);
  const graphContainerRef = useRef(null);
  const networkRef = useRef(null);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const {
    nodeItems,
    edgeItems,
    activeGroups,
  } = useMemo(() => transformData(rawData), [rawData]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement;

      const fullscreenActive =
        fullscreenElement === wrapperRef.current;

      setIsFullscreen(fullscreenActive);

      window.setTimeout(() => {
        const network = networkRef.current;

        if (!network) {
          return;
        }

        network.redraw();

        network.fit({
          animation: {
            duration: 350,
            easingFunction: 'easeInOutQuad',
          },
        });
      }, 150);
    };

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    );

    document.addEventListener(
      'webkitfullscreenchange',
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      );

      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    try {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement;

      if (fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }

        return;
      }

      if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen({
          navigationUI: 'hide',
        });
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } catch (error) {
      console.error(
        'Unable to change graph fullscreen mode:',
        error
      );
    }
  };

  useEffect(() => {
    if (
      !graphContainerRef.current ||
      nodeItems.length === 0
    ) {
      return undefined;
    }

    const nodes = new DataSet(nodeItems);
    const edges = new DataSet(edgeItems);

    const visGroups = Object.entries(GROUPS).reduce(
      (result, [groupName, group]) => {
        result[groupName] = {
          color: {
            background: group.background,
            border: group.border,

            highlight: {
              background: group.background,
              border: group.border,
            },

            hover: {
              background: group.background,
              border: group.border,
            },
          },
        };

        return result;
      },
      {}
    );

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'LR',
          sortMethod: 'directed',
          shakeTowards: 'roots',
          levelSeparation: 190,
          nodeSpacing: 130,
          treeSpacing: 180,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
        },
      },

      nodes: {
        shape: 'dot',
        size: 28,
        borderWidth: 2,
        borderWidthSelected: 4,

        font: {
          size: 13,
          color: '#1E293B',
          face: 'Inter, Arial, sans-serif',
          align: 'center',
          vadjust: 1,
          strokeWidth: 4,
          strokeColor: '#FFFFFF',
        },

        shadow: {
          enabled: true,
          color: 'rgba(15, 23, 42, 0.15)',
          size: 10,
          x: 0,
          y: 4,
        },
      },

      edges: {
        width: 2,
        selectionWidth: 3,
        hoverWidth: 3,

        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.75,
          },
        },

        color: {
          inherit: 'from',
          opacity: 0.55,
        },

        smooth: {
          enabled: true,
          type: 'cubicBezier',
          forceDirection: 'horizontal',
          roundness: 0.42,
        },
      },

      groups: visGroups,

      physics: {
        enabled: false,
      },

      interaction: {
        hover: true,
        dragNodes: true,
        dragView: true,
        zoomView: true,
        selectConnectedEdges: true,
        hoverConnectedEdges: true,
        tooltipDelay: 150,
        multiselect: false,
      },
    };

    const network = new Network(
      graphContainerRef.current,
      {
        nodes,
        edges,
      },
      options
    );

    networkRef.current = network;

    network.once('afterDrawing', () => {
      network.fit({
        animation: {
          duration: 450,
          easingFunction: 'easeInOutQuad',
        },
      });

      network.setOptions({
        layout: {
          hierarchical: {
            enabled: false,
          },
        },

        physics: {
          enabled: false,
        },

        edges: {
          smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0.35,
          },
        },
      });
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [nodeItems, edgeItems]);

  if (
    !Array.isArray(rawData) ||
    rawData.length === 0
  ) {
    return (
      <div
        style={{
          ...styles.emptyState,
          height,
          minHeight,
        }}
      >
        No graph relationships available.
      </div>
    );
  }

  return (
    <>
    <div
      ref={wrapperRef}
      style={{
        ...styles.wrapper,
        height: isFullscreen ? '100vh' : height,
        minHeight: isFullscreen ? '100vh' : minHeight,
        borderRadius: isFullscreen ? 0 : 10,
        zIndex: 999,
        border: isFullscreen
          ? 'none'
          : styles.wrapper.border,
      }}
    >
      <div style={styles.legend}>
        <div style={styles.legendItems}>
          {activeGroups.map((groupName) => {
            const group = GROUPS[groupName];

            if (!group) {
              return null;
            }

            return (
              <div
                key={groupName}
                style={styles.legendItem}
              >
                <span
                  style={{
                    ...styles.legendColor,
                    backgroundColor: group.background,
                    borderColor: group.border,
                  }}
                />

                <span>{group.label}</span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          style={styles.fullscreenButton}
          title={
            isFullscreen
              ? 'Exit fullscreen'
              : 'Open graph in fullscreen'
          }
          aria-label={
            isFullscreen
              ? 'Exit graph fullscreen'
              : 'Open graph in fullscreen'
          }
        >
          <span style={styles.fullscreenIcon}>
            {isFullscreen ? '↙' : '↗'}
          </span>

          <span>
            {isFullscreen
              ? 'Exit Fullscreen'
              : 'Fullscreen'}
          </span>
        </button>
      </div>

      <div style={styles.graphWrapper}>
        <div
          ref={graphContainerRef}
          style={styles.graphContainer}
        />
        {/* Powered by Watermark */}
        <div style={styles.watermark}>
          Powered by <strong>Spanner Graph</strong>
        </div>
      </div>
    </div>
    <Chatbot bottom={70} right={20}/>
    </>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    fontFamily: 'Inter, Arial, sans-serif',
  },

  legend: {
    minHeight: 49,
    boxSizing: 'border-box',
    padding: '8px 12px 8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },

  legendItems: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px 18px',
    minWidth: 0,
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: '#475569',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },

  legendColor: {
    width: 12,
    height: 12,
    boxSizing: 'border-box',
    display: 'inline-block',
    flexShrink: 0,
    borderRadius: '50%',
    border: '2px solid',
  },

  fullscreenButton: {
    height: 34,
    padding: '0 12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flexShrink: 0,
    color: '#4338CA',
    backgroundColor: '#FFFFFF',
    border: '1px solid #C7D2FE',
    borderRadius: 8,
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
  },

  fullscreenIcon: {
    fontSize: 16,
    lineHeight: 1,
  },

  graphWrapper: {
    position: 'relative',
    width: '100%',
    height: 'calc(100% - 49px)',
  },

  graphContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    backgroundImage:
      'radial-gradient(circle, #DDE4EE 1px, transparent 1px)',
    backgroundSize: '22px 22px',
  },

  watermark: {
    position: 'absolute',
    bottom: 25,
    left: 16,
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid #E2E8F0',
    borderRadius: 6,
    fontSize: 11,
    color: '#64748B',
    pointerEvents: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    backdropFilter: 'blur(4px)',
    zIndex: 10,
  },

  emptyState: {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748B',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    fontFamily: 'Inter, Arial, sans-serif',
    fontSize: 13,
  },
};

export default GraphVisualization;