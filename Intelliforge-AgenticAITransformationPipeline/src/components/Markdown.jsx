// import { useEffect, useMemo, useState } from 'react';
// import PropTypes from 'prop-types';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import remarkGfm from 'remark-gfm';
// import remarkBreaks from 'remark-breaks';
// import rehypeRaw from 'rehype-raw';
// import mermaid from 'mermaid';

// const decodeHtmlEntities = (text = '') => {
//   return text
//     .replace(/&amp;/g, '&')
//     .replace(/&gt;/g, '>')
//     .replace(/&lt;/g, '<')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'");
// };

// const normalizeDiagramMarkdown = (text = '') => {
//   let normalized = text || '';

//   /*
//     Converts bad single-line blocks like:

//     ```bpmn graph TD A --> B ```

//     Into:

//     ```bpmn
//     graph TD A --> B
//     ```
//   */
//   normalized = normalized.replace(
//     /```(bpmn|mermaid)\s+((?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|quadrantChart|requirementDiagram|gitGraph)[\s\S]*?)\s*```/gi,
//     (_, lang, diagram) => {
//       return `\`\`\`${lang}\n${diagram.trim()}\n\`\`\``;
//     }
//   );

//   /*
//     Do not blindly replace all single backticks.
//     Single backticks are valid markdown for inline code.
//     Example:
//     This is `data`
//   */

//   return normalized;
// };

// const quoteMermaidNodeLabels = (chart = '') => {
//   let sanitized = chart;

//   /*
//     Converts:
//     A[Service Task: Simulate Data Extraction (using data_extract_mcp)]

//     Into:
//     A["Service Task: Simulate Data Extraction (using data_extract_mcp)"]
//   */
//   sanitized = sanitized.replace(
//     /(\b[A-Za-z][A-Za-z0-9_-]*)\[([^\]\n]+)\]/g,
//     (_, nodeId, label) => {
//       const trimmedLabel = label.trim();

//       if (trimmedLabel.startsWith('"') || trimmedLabel.startsWith("'")) {
//         return `${nodeId}[${trimmedLabel}]`;
//       }

//       return `${nodeId}["${trimmedLabel.replace(/"/g, "'")}"]`;
//     }
//   );

//   /*
//     Converts:
//     B{Decision/Analysis}

//     Into:
//     B{"Decision/Analysis"}
//   */
//   sanitized = sanitized.replace(
//     /(\b[A-Za-z][A-Za-z0-9_-]*)\{([^}\n]+)\}/g,
//     (_, nodeId, label) => {
//       const trimmedLabel = label.trim();

//       if (trimmedLabel.startsWith('"') || trimmedLabel.startsWith("'")) {
//         return `${nodeId}{${trimmedLabel}}`;
//       }

//       return `${nodeId}{"${trimmedLabel.replace(/"/g, "'")}"}`;
//     }
//   );

//   return sanitized;
// };

// const normalizeSingleLineMermaid = (chart = '') => {
//   let normalized = chart.trim();

//   /*
//     If the complete diagram is on one line, make it easier for Mermaid
//     by adding line breaks after semicolons.
//   */
//   normalized = normalized.replace(/;\s*/g, ';\n');

//   /*
//     Ensure graph declaration is followed by a newline.
//     Example:
//     graph TD A --> B
//     becomes:
//     graph TD
//     A --> B
//   */
//   normalized = normalized.replace(
//     /^(graph|flowchart)\s+(TD|TB|BT|RL|LR)\s+/i,
//     '$1 $2\n'
//   );

//   /*
//     Put subgraph and end on separate lines when LLM returns one long line.
//   */
//   normalized = normalized.replace(/\s+(subgraph)\s+/gi, '\n$1 ');
//   normalized = normalized.replace(/\s+(end)\s*/gi, '\n$1\n');

//   return normalized;
// };

// const sanitizeMermaidChart = (chart = '') => {
//   let sanitized = decodeHtmlEntities(chart);

//   sanitized = normalizeSingleLineMermaid(sanitized);
//   sanitized = quoteMermaidNodeLabels(sanitized);

//   return sanitized;
// };

// const MermaidDiagram = ({ chart }) => {
//   const [svg, setSvg] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     let isMounted = true;

//     const renderDiagram = async () => {
//       try {
//         setError('');
//         setSvg('');

//         mermaid.initialize({
//           startOnLoad: false,
//           securityLevel: 'strict',
//           theme: 'default'
//         });

//         const diagramId = `mermaid-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2)}`;

//         const result = await mermaid.render(diagramId, chart);

//         if (isMounted) {
//           setSvg(result.svg);
//         }
//       } catch (err) {
//         if (isMounted) {
//           setError(err?.message || 'Unable to render Mermaid diagram');
//           setSvg('');
//         }
//       }
//     };

//     renderDiagram();

//     return () => {
//       isMounted = false;
//     };
//   }, [chart]);

//   if (error) {
//     return (
//       <div className="my-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
//         <div className="mb-2 font-semibold">Diagram render failed</div>
//         <pre className="whitespace-pre-wrap text-xs">{error}</pre>
//       </div>
//     );
//   }

//   if (!svg) {
//     return (
//       <div className="my-4 rounded border border-gray-200 bg-white p-3 text-sm text-gray-500">
//         Rendering diagram...
//       </div>
//     );
//   }

//   return (
//     <div className="my-4 overflow-x-auto rounded border border-gray-200 bg-white p-3">
//       <div dangerouslySetInnerHTML={{ __html: svg }} />
//     </div>
//   );
// };

// MermaidDiagram.propTypes = {
//   chart: PropTypes.string.isRequired
// };

// const Markdown = ({ markdownText }) => {
//   const normalizedMarkdownText = useMemo(() => {
//     return normalizeDiagramMarkdown(markdownText || '');
//   }, [markdownText]);

//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm, remarkBreaks]}
//       rehypePlugins={[rehypeRaw]}
//       components={{
//         h1: ({ children }) => (
//           <h2 className="mb-2 mt-4 text-xl font-bold">{children}</h2>
//         ),

//         h2: ({ children }) => (
//           <h3 className="mb-2 mt-3 text-lg font-semibold">{children}</h3>
//         ),

//         h3: ({ children }) => (
//           <h4 className="mb-1 mt-2 text-base font-semibold">{children}</h4>
//         ),

//         table: ({ children }) => (
//           <div className="my-2 overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-300">
//               {children}
//             </table>
//           </div>
//         ),

//         thead: ({ children }) => <thead>{children}</thead>,

//         th: ({ children }) => (
//           <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold">
//             {children}
//           </th>
//         ),

//         td: ({ children }) => (
//           <td className="border border-gray-300 px-2 py-1">
//             {children}
//           </td>
//         ),

//         ul: ({ children }) => (
//           <ul className="my-1 list-disc pl-6">{children}</ul>
//         ),

//         ol: ({ children }) => (
//           <ol className="my-1 list-decimal pl-6">{children}</ol>
//         ),

//         li: ({ children }) => (
//           <li className="my-1">{children}</li>
//         ),

//         p: ({ children }) => (
//           <p className="mb-1 leading-normal">{children}</p>
//         ),

//         strong: ({ children }) => (
//           <strong className="font-semibold">{children}</strong>
//         ),

//         code({ className, children, ...props }) {
//           const match = /language-([\w-]+)/.exec(className || '');
//           const language = match?.[1]?.toLowerCase();
//           const codeString = String(children).replace(/\n$/, '');

//           const diagramLanguages = ['mermaid', 'bpmn'];

//           /*
//             Important:
//             In some react-markdown versions, the "inline" prop is not reliable.
//             So we treat code as a fenced/block code only when it has a language class.
//             Example fenced code:
//             ```js
//             const a = 1;
//             ```
//             gives className = "language-js"

//             Inline code:
//             `data`
//             usually has no className.
//           */
//           const isFencedCodeBlock = Boolean(language);

//           if (isFencedCodeBlock && diagramLanguages.includes(language)) {
//             const chart = sanitizeMermaidChart(codeString);

//             return <MermaidDiagram chart={chart} />;
//           }

//           if (isFencedCodeBlock) {
//             return (
//               <div className="my-2 overflow-x-auto rounded bg-gray-50">
//                 <SyntaxHighlighter
//                   style={prism}
//                   language={language || 'text'}
//                   PreTag="div"
//                   {...props}
//                 >
//                   {codeString}
//                 </SyntaxHighlighter>
//               </div>
//             );
//           }

//           /*
//             Inline code path.
//             This fixes the issue where `data` was taking the complete line.
//           */
//           return (
//             <code className="inline rounded bg-gray-100 px-1 py-0.5 align-baseline font-mono text-sm text-gray-800">
//               {children}
//             </code>
//           );
//         }
//       }}
//     >
//       {normalizedMarkdownText}
//     </ReactMarkdown>
//   );
// };

// Markdown.propTypes = {
//   markdownText: PropTypes.string
// };

// Markdown.defaultProps = {
//   markdownText: ''
// };

// export default Markdown;

// import { useEffect, useMemo, useRef, useState } from 'react';
// import PropTypes from 'prop-types';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import remarkGfm from 'remark-gfm';
// import remarkBreaks from 'remark-breaks';
// import rehypeRaw from 'rehype-raw';
// import mermaid from 'mermaid';

// const decodeHtmlEntities = (text = '') => {
//   return text
//     .replace(/&amp;/g, '&')
//     .replace(/&gt;/g, '>')
//     .replace(/&lt;/g, '<')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'");
// };

// const normalizeEscapedMarkdown = (text = '') => {
//   let normalized = text || '';

//   /*
//     Handles API/LLM responses where markdown is returned as one escaped string:

//     ```html\n&lt;div&gt;Hello&lt;/div&gt;\n```

//     ReactMarkdown needs real newlines, not literal "\n".
//   */
//   if (normalized.includes('\\n')) {
//     normalized = normalized.replace(/\\n/g, '\n');
//   }

//   return normalized;
// };

// const normalizeHtmlBlock = (html = '') => {
//   let normalized = decodeHtmlEntities(html || '').trim();

//   /*
//     Remove JSX fragment wrapper from html code blocks:

//     <>
//       <div>...</div>
//     </>

//     Because this is JSX, not real HTML.
//   */
//   normalized = normalized.replace(/^<>\s*/i, '');
//   normalized = normalized.replace(/\s*<\/>\s*$/i, '');

//   return normalized;
// };

// const normalizeDiagramMarkdown = (text = '') => {
//   let normalized = normalizeEscapedMarkdown(text || '');

//   normalized = normalized.replace(
//     /```(bpmn|mermaid)\s+((?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|quadrantChart|requirementDiagram|gitGraph)[\s\S]*?)\s*```/gi,
//     (_, lang, diagram) => {
//       return `\`\`\`${lang}\n${diagram.trim()}\n\`\`\``;
//     }
//   );

//   return normalized;
// };

// const quoteMermaidNodeLabels = (chart = '') => {
//   let sanitized = chart;

//   sanitized = sanitized.replace(
//     /(\b[A-Za-z][A-Za-z0-9_-]*)\[([^\]\n]+)\]/g,
//     (_, nodeId, label) => {
//       const trimmedLabel = label.trim();

//       if (trimmedLabel.startsWith('"') || trimmedLabel.startsWith("'")) {
//         return `${nodeId}[${trimmedLabel}]`;
//       }

//       return `${nodeId}["${trimmedLabel.replace(/"/g, "'")}"]`;
//     }
//   );

//   sanitized = sanitized.replace(
//     /(\b[A-Za-z][A-Za-z0-9_-]*)\{([^}\n]+)\}/g,
//     (_, nodeId, label) => {
//       const trimmedLabel = label.trim();

//       if (trimmedLabel.startsWith('"') || trimmedLabel.startsWith("'")) {
//         return `${nodeId}{${trimmedLabel}}`;
//       }

//       return `${nodeId}{"${trimmedLabel.replace(/"/g, "'")}"}`;
//     }
//   );

//   return sanitized;
// };

// const normalizeSingleLineMermaid = (chart = '') => {
//   let normalized = chart.trim();

//   normalized = normalized.replace(/;\s*/g, ';\n');

//   normalized = normalized.replace(
//     /^(graph|flowchart)\s+(TD|TB|BT|RL|LR)\s+/i,
//     '$1 $2\n'
//   );

//   normalized = normalized.replace(/\s+(subgraph)\s+/gi, '\n$1 ');
//   normalized = normalized.replace(/\s+(end)\s*/gi, '\n$1\n');

//   return normalized;
// };

// const sanitizeMermaidChart = (chart = '') => {
//   let sanitized = decodeHtmlEntities(chart);

//   sanitized = normalizeSingleLineMermaid(sanitized);
//   sanitized = quoteMermaidNodeLabels(sanitized);

//   return sanitized;
// };

// const MermaidDiagram = ({ chart }) => {
//   const [svg, setSvg] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     let isMounted = true;

//     const renderDiagram = async () => {
//       try {
//         setError('');
//         setSvg('');

//         mermaid.initialize({
//           startOnLoad: false,
//           securityLevel: 'strict',
//           theme: 'default'
//         });

//         const diagramId = `mermaid-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2)}`;

//         const result = await mermaid.render(diagramId, chart);

//         if (isMounted) {
//           setSvg(result.svg);
//         }
//       } catch (err) {
//         if (isMounted) {
//           setError(err?.message || 'Unable to render Mermaid diagram');
//           setSvg('');
//         }
//       }
//     };

//     renderDiagram();

//     return () => {
//       isMounted = false;
//     };
//   }, [chart]);

//   if (error) {
//     return (
//       <div className="my-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
//         <div className="mb-2 font-semibold">Diagram render failed</div>
//         <pre className="whitespace-pre-wrap text-xs">{error}</pre>
//       </div>
//     );
//   }

//   if (!svg) {
//     return (
//       <div className="my-4 rounded border border-gray-200 bg-white p-3 text-sm text-gray-500">
//         Rendering diagram...
//       </div>
//     );
//   }

//   return (
//     <div className="my-4 overflow-x-auto rounded border border-gray-200 bg-white p-3">
//       <div dangerouslySetInnerHTML={{ __html: svg }} />
//     </div>
//   );
// };

// MermaidDiagram.propTypes = {
//   chart: PropTypes.string.isRequired
// };

// const HtmlBlock = ({ html }) => {
//   const containerRef = useRef(null);

//   const normalizedHtml = useMemo(() => {
//     return normalizeHtmlBlock(html);
//   }, [html]);

//   useEffect(() => {
//     let isMounted = true;

//     const renderMermaidInsideHtml = async () => {
//       if (!containerRef.current) return;

//       const mermaidBlocks = containerRef.current.querySelectorAll(
//         'pre.mermaid, code.language-mermaid, code.language-bpmn'
//       );

//       if (!mermaidBlocks.length) return;

//       mermaid.initialize({
//         startOnLoad: false,
//         securityLevel: 'strict',
//         theme: 'default'
//       });

//       for (const block of mermaidBlocks) {
//         try {
//           const chart = sanitizeMermaidChart(block.textContent || '');

//           const diagramId = `html-mermaid-${Date.now()}-${Math.random()
//             .toString(36)
//             .slice(2)}`;

//           const result = await mermaid.render(diagramId, chart);

//           if (!isMounted) return;

//           const wrapper = document.createElement('div');
//           wrapper.className =
//             'my-4 overflow-x-auto rounded border border-gray-200 bg-white p-3';
//           wrapper.innerHTML = result.svg;

//           const parentPre = block.tagName.toLowerCase() === 'code'
//             ? block.closest('pre')
//             : block;

//           if (parentPre && parentPre.parentNode) {
//             parentPre.parentNode.replaceChild(wrapper, parentPre);
//           }
//         } catch (err) {
//           if (!isMounted) return;

//           const errorBox = document.createElement('div');
//           errorBox.className =
//             'my-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700';
//           errorBox.innerHTML = `
//             <div style="font-weight:600;margin-bottom:8px;">Diagram render failed</div>
//             <pre style="white-space:pre-wrap;font-size:12px;">${err?.message || 'Unable to render Mermaid diagram'}</pre>
//           `;

//           const parentPre = block.tagName.toLowerCase() === 'code'
//             ? block.closest('pre')
//             : block;

//           if (parentPre && parentPre.parentNode) {
//             parentPre.parentNode.replaceChild(errorBox, parentPre);
//           }
//         }
//       }
//     };

//     renderMermaidInsideHtml();

//     return () => {
//       isMounted = false;
//     };
//   }, [normalizedHtml]);

//   return (
//     <div
//       ref={containerRef}
//       className="my-4"
//       dangerouslySetInnerHTML={{ __html: normalizedHtml }}
//     />
//   );
// };

// HtmlBlock.propTypes = {
//   html: PropTypes.string.isRequired
// };

// const Markdown = ({ markdownText }) => {
//   const normalizedMarkdownText = useMemo(() => {
//     return normalizeDiagramMarkdown(markdownText || '');
//   }, [markdownText]);

//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm, remarkBreaks]}
//       rehypePlugins={[rehypeRaw]}
//       components={{
//         h1: ({ children }) => (
//           <h2 className="mb-2 mt-4 text-xl font-bold">{children}</h2>
//         ),

//         h2: ({ children }) => (
//           <h3 className="mb-2 mt-3 text-lg font-semibold">{children}</h3>
//         ),

//         h3: ({ children }) => (
//           <h4 className="mb-1 mt-2 text-base font-semibold">{children}</h4>
//         ),

//         table: ({ children }) => (
//           <div className="my-2 overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-300">
//               {children}
//             </table>
//           </div>
//         ),

//         thead: ({ children }) => <thead>{children}</thead>,

//         th: ({ children }) => (
//           <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold">
//             {children}
//           </th>
//         ),

//         td: ({ children }) => (
//           <td className="border border-gray-300 px-2 py-1">
//             {children}
//           </td>
//         ),

//         ul: ({ children }) => (
//           <ul className="my-1 list-disc pl-6">{children}</ul>
//         ),

//         ol: ({ children }) => (
//           <ol className="my-1 list-decimal pl-6">{children}</ol>
//         ),

//         li: ({ children }) => (
//           <li className="my-1">{children}</li>
//         ),

//         p: ({ children }) => (
//           <p className="mb-1 leading-normal">{children}</p>
//         ),

//         strong: ({ children }) => (
//           <strong className="font-semibold">{children}</strong>
//         ),

//         details: ({ children }) => (
//           <details className="my-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
//             {children}
//           </details>
//         ),

//         summary: ({ children }) => (
//           <summary className="cursor-pointer font-semibold">
//             {children}
//           </summary>
//         ),

//         progress: ({ value, max, children, ...props }) => (
//           <progress
//             value={value}
//             max={max || 100}
//             className="h-3 w-full overflow-hidden rounded-full"
//             {...props}
//           >
//             {children}
//           </progress>
//         ),

//         pre({ children }) {
//           return <pre>{children}</pre>;
//         },

//         code({ className, children, ...props }) {
//           const match = /language-([\w-]+)/.exec(className || '');
//           const language = match?.[1]?.toLowerCase();
//           const codeString = String(children).replace(/\n$/, '');

//           const diagramLanguages = ['mermaid', 'bpmn'];
//           const htmlLanguages = ['html', 'htm'];

//           const isFencedCodeBlock = Boolean(language);

//           if (isFencedCodeBlock && diagramLanguages.includes(language)) {
//             const chart = sanitizeMermaidChart(codeString);
//             return <MermaidDiagram chart={chart} />;
//           }

//           /*
//             This renders ```html blocks visually.
//             It also supports escaped HTML like:
//             &lt;div&gt;Hello&lt;/div&gt;
//           */
//           if (isFencedCodeBlock && htmlLanguages.includes(language)) {
//             return <HtmlBlock html={codeString} />;
//           }

//           if (isFencedCodeBlock) {
//             return (
//               <div className="my-2 overflow-x-auto rounded bg-gray-50">
//                 <SyntaxHighlighter
//                   style={prism}
//                   language={language || 'text'}
//                   PreTag="div"
//                   {...props}
//                 >
//                   {codeString}
//                 </SyntaxHighlighter>
//               </div>
//             );
//           }

//           return (
//             <code className="inline rounded bg-gray-100 px-1 py-0.5 align-baseline font-mono text-sm text-gray-800">
//               {children}
//             </code>
//           );
//         }
//       }}
//     >
//       {normalizedMarkdownText}
//     </ReactMarkdown>
//   );
// };

// Markdown.propTypes = {
//   markdownText: PropTypes.string
// };

// Markdown.defaultProps = {
//   markdownText: ''
// };

// export default Markdown;


import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';

const decodeHtmlEntities = (text = '') => {
  let decoded = text || '';

  /*
    Decode multiple times because API/LLM output can be encoded like:
    &lt;div&gt;
    or
    &amp;lt;div&amp;gt;
  */
  for (let i = 0; i < 3; i += 1) {
    decoded = decoded
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  return decoded;
};

const normalizeEscapedMarkdown = (text = '') => {
  let normalized = text || '';

  /*
    Converts literal escaped newlines into real newlines.

    Example:
    ```html\n&lt;div&gt;Hello&lt;/div&gt;\n```

    becomes a real fenced markdown block.
  */
  normalized = normalized.replace(/\\n/g, '\n');
  normalized = normalized.replace(/\\t/g, '\t');

  return normalized;
};

const stripOuterQuotesIfNeeded = (text = '') => {
  let value = text || '';
  const trimmed = value.trim();

  /*
    Sometimes backend/agent returns the entire markdown as a quoted JSON-like string.
    This avoids rendering the leading/trailing quotes.
  */
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    value = trimmed.slice(1, -1);
  }

  return value;
};

const normalizeHtmlBlock = (html = '') => {
  let normalized = decodeHtmlEntities(html || '').trim();

  // 1. Remove global <html> and <body> structural tags
  normalized = normalized.replace(/<\/?(html|body)[^>]*>/gi, '');

  // 2. Keep <style> tags, but strip out any CSS rules targeting 'body' or 'html'
  normalized = normalized.replace(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
    const cleanedCss = cssContent
      // Removes rules like: body { background: #fff; } or html, body { margin: 0; }
      .replace(/(^|\})\s*([^{]*\b(body|html)\b[^{]*)\{[^}]*\}/gi, '$1');
    return `<style>${cleanedCss}</style>`;
  });

  normalized = normalized.replace(/^<>\s*/i, '');
  normalized = normalized.replace(/\s*<\/>\s*$/i, '');

  return normalized;
};

const looksLikeHtmlReport = (text = '') => {
  const trimmed = text.trim();

  return (
    trimmed.startsWith('<div') ||
    trimmed.startsWith('<section') ||
    trimmed.startsWith('<article') ||
    trimmed.startsWith('<main') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<body') ||
    trimmed.startsWith('<table') ||
    trimmed.startsWith('<details') ||
    trimmed.startsWith('<h1') ||
    trimmed.startsWith('<h2')
  );
};

const normalizeDiagramMarkdown = (text = '') => {
  let normalized = text || '';

  normalized = stripOuterQuotesIfNeeded(normalized);
  normalized = normalizeEscapedMarkdown(normalized);

  /*
    Converts bad single-line blocks like:

    ```bpmn graph TD A --> B ```

    Into:

    ```bpmn
    graph TD A --> B
    ```
  */
  normalized = normalized.replace(
    /```(bpmn|mermaid)\s+((?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|quadrantChart|requirementDiagram|gitGraph)[\s\S]*?)\s*```/gi,
    (_, lang, diagram) => {
      return `\`\`\`${lang}\n${diagram.trim()}\n\`\`\``;
    }
  );

  return normalized;
};

const quoteMermaidNodeLabels = (chart = '') => {
  let sanitized = chart || '';

  /*
    Converts:
    A[Service Task: Simulate Data Extraction]

    Into:
    A["Service Task: Simulate Data Extraction"]
  */
  sanitized = sanitized.replace(
    /(\b[A-Za-z][A-Za-z0-9_-]*)\[([^\]\n]+)\]/g,
    (_, nodeId, label) => {
      const trimmedLabel = label.trim();

      if (trimmedLabel.startsWith('"') || trimmedLabel.startsWith("'")) {
        return `${nodeId}[${trimmedLabel}]`;
      }

      return `${nodeId}["${trimmedLabel.replace(/"/g, "'")}"]`;
    }
  );

  /*
    Converts:
    B{Decision/Analysis}

    Into:
    B{"Decision/Analysis"}
  */
  sanitized = sanitized.replace(
    /(\b[A-Za-z][A-Za-z0-9_-]*)\{([^}\n]+)\}/g,
    (_, nodeId, label) => {
      const trimmedLabel = label.trim();

      if (trimmedLabel.startsWith('"') || trimmedLabel.startsWith("'")) {
        return `${nodeId}{${trimmedLabel}}`;
      }

      return `${nodeId}{"${trimmedLabel.replace(/"/g, "'")}"}`;
    }
  );

  return sanitized;
};

const normalizeSingleLineMermaid = (chart = '') => {
  let normalized = chart.trim();

  normalized = normalized.replace(/;\s*/g, ';\n');

  normalized = normalized.replace(
    /^(graph|flowchart)\s+(TD|TB|BT|RL|LR)\s+/i,
    '$1 $2\n'
  );

  normalized = normalized.replace(/\s+(subgraph)\s+/gi, '\n$1 ');
  normalized = normalized.replace(/\s+(end)\s*/gi, '\n$1\n');

  return normalized;
};

const sanitizeMermaidChart = (chart = '') => {
  let sanitized = chart || '';

  sanitized = normalizeEscapedMarkdown(sanitized);
  sanitized = decodeHtmlEntities(sanitized);
  sanitized = normalizeSingleLineMermaid(sanitized);
  sanitized = quoteMermaidNodeLabels(sanitized);

  return sanitized;
};

const MermaidDiagram = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setError('');
        setSvg('');

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'default'
        });

        const diagramId = `mermaid-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        const result = await mermaid.render(diagramId, chart);

        if (isMounted) {
          setSvg(result.svg);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Unable to render Mermaid diagram');
          setSvg('');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        <div className="mb-2 font-semibold">Diagram render failed</div>
        <pre className="whitespace-pre-wrap text-xs">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 rounded border border-gray-200 bg-white p-3 text-sm text-gray-500">
        Rendering diagram...
      </div>
    );
  }

  return (
    <div className="my-4 overflow-x-auto rounded border border-gray-200 bg-white p-3">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};

MermaidDiagram.propTypes = {
  chart: PropTypes.string.isRequired
};

const HtmlRenderer = ({ html }) => {
  const containerRef = useRef(null);

  const normalizedHtml = useMemo(() => {
    return normalizeHtmlBlock(html);
  }, [html]);

  useEffect(() => {
    let isMounted = true;

    const renderMermaidInsideHtml = async () => {
      if (!containerRef.current) return;

      const mermaidBlocks = containerRef.current.querySelectorAll(
        'pre.mermaid, code.language-mermaid, code.language-bpmn'
      );

      if (!mermaidBlocks.length) return;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'default'
      });

      for (const block of mermaidBlocks) {
        try {
          const chart = sanitizeMermaidChart(block.textContent || '');

          const diagramId = `html-mermaid-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

          const result = await mermaid.render(diagramId, chart);

          if (!isMounted) return;

          const wrapper = document.createElement('div');
          wrapper.className =
            'my-4 overflow-x-auto rounded border border-gray-200 bg-white p-3';
          wrapper.innerHTML = result.svg;

          const parentPre =
            block.tagName.toLowerCase() === 'code'
              ? block.closest('pre')
              : block;

          if (parentPre && parentPre.parentNode) {
            parentPre.parentNode.replaceChild(wrapper, parentPre);
          }
        } catch (err) {
          if (!isMounted) return;

          const errorBox = document.createElement('div');
          errorBox.className =
            'my-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700';

          errorBox.innerHTML = `
            <div style="font-weight:600;margin-bottom:8px;">Diagram render failed</div>
            <pre style="white-space:pre-wrap;font-size:12px;">${
              err?.message || 'Unable to render Mermaid diagram'
            }</pre>
          `;

          const parentPre =
            block.tagName.toLowerCase() === 'code'
              ? block.closest('pre')
              : block;

          if (parentPre && parentPre.parentNode) {
            parentPre.parentNode.replaceChild(errorBox, parentPre);
          }
        }
      }
    };

    renderMermaidInsideHtml();

    return () => {
      isMounted = false;
    };
  }, [normalizedHtml]);

  return (
    <div
      ref={containerRef}
      style={{ all: 'revert' }} 
      className="my-4 max-w-none overflow-hidden"
      dangerouslySetInnerHTML={{ __html: normalizedHtml }}
    />
  );
};

HtmlRenderer.propTypes = {
  html: PropTypes.string.isRequired
};

const markdownComponents = {
  h1: ({ children }) => (
    <h2 className="mb-2 mt-4 text-xl font-bold">{children}</h2>
  ),

  h2: ({ children }) => (
    <h3 className="mb-2 mt-3 text-lg font-semibold">{children}</h3>
  ),

  h3: ({ children }) => (
    <h4 className="mb-1 mt-2 text-base font-semibold">{children}</h4>
  ),

  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => <thead>{children}</thead>,

  th: ({ children }) => (
    <th className="border border-gray-300 bg-gray-100 px-2 py-1 text-left font-semibold">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border border-gray-300 px-2 py-1">{children}</td>
  ),

  ul: ({ children }) => <ul className="my-1 list-disc pl-6">{children}</ul>,

  ol: ({ children }) => <ol className="my-1 list-decimal pl-6">{children}</ol>,

  li: ({ children }) => <li className="my-1">{children}</li>,

  p: ({ children }) => <p className="mb-1 leading-normal">{children}</p>,

  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),

  details: ({ children, ...props }) => (
    <details
      className="my-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
      {...props}
    >
      {children}
    </details>
  ),

  summary: ({ children, ...props }) => (
    <summary className="cursor-pointer font-semibold" {...props}>
      {children}
    </summary>
  ),

  progress: ({ value, max, children, ...props }) => (
    <progress
      value={value}
      max={max || 100}
      className="h-3 w-full overflow-hidden rounded-full"
      {...props}
    >
      {children}
    </progress>
  ),

  pre: ({ children }) => <>{children}</>,

  code({ className, children, ...props }) {
    const match = /language-([\w-]+)/.exec(className || '');
    const language = match?.[1]?.toLowerCase();
    const codeString = String(children).replace(/\n$/, '');

    const diagramLanguages = ['mermaid', 'bpmn'];
    const htmlLanguages = ['html', 'htm'];

    const isFencedCodeBlock = Boolean(language);

    if (isFencedCodeBlock && diagramLanguages.includes(language)) {
      const chart = sanitizeMermaidChart(codeString);
      return <MermaidDiagram chart={chart} />;
    }

    /*
      Renders this visually:

      ```html
      &lt;div&gt;Hello&lt;/div&gt;
      ```

      and this:

      ```html
      <div>Hello</div>
      ```
    */
    if (isFencedCodeBlock && htmlLanguages.includes(language)) {
      return <HtmlRenderer html={codeString} />;
    }

    if (isFencedCodeBlock) {
      return (
        <div className="my-2 overflow-x-auto rounded bg-gray-50">
          <SyntaxHighlighter
            style={prism}
            language={language || 'text'}
            PreTag="div"
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    /*
      Inline code path.
      Keeps `data` inline instead of full-width block.
    */
    return (
      <code className="inline rounded px-1 py-0.5 align-baseline font-mono text-sm text-gray-800">
        {children}
      </code>
    );
  }
};

const Markdown = ({ markdownText }) => {
  const normalizedMarkdownText = useMemo(() => {
    const normalized = normalizeDiagramMarkdown(markdownText || '');

    /*
      Important:
      Decode the complete response, not only fenced html blocks.

      This fixes responses like:

      &lt;div&gt;
        &lt;h2&gt;2. Operational Assessment&lt;/h2&gt;
      &lt;/div&gt;

      where the whole report is escaped HTML.
    */
    return decodeHtmlEntities(normalized);
  }, [markdownText]);

  /*
    If the full response is an HTML dashboard/report, bypass ReactMarkdown.
    This is the most reliable path for your agent-generated visual HTML.
  */
  if (looksLikeHtmlReport(normalizedMarkdownText)) {
    return <HtmlRenderer html={normalizedMarkdownText} />;
  }

  return (
    
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
      components={markdownComponents}
    >
      {normalizedMarkdownText}
    </ReactMarkdown>
  );
};

Markdown.propTypes = {
  markdownText: PropTypes.string
};

Markdown.defaultProps = {
  markdownText: ''
};

export default Markdown;