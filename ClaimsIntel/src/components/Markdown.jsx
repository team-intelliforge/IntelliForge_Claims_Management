import React, { useEffect, useState } from "react"
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism, atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

const Markdown = ({ markdownText }) => {

  // console.log(markdownText)
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]} // Apply GFM and line breaks plugins
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || 'language-js');
          return !inline ? (
            <SyntaxHighlighter
              {...props}
              style={prism}
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse' }}>
              {children}
            </table>
          );
        },
        th({ children }) {
          return (
            <th
              style={{
                border: '1px solid #ccc',
                padding: '8px',
                textAlign: 'left',
                backgroundColor: '#f4f4f4',
              }}
            >
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td
              style={{
                border: '1px solid #ccc',
                padding: '8px',
              }}
            >
              {children}
            </td>
          );
        },
        tr({ children }) {
          return <tr>{children}</tr>;
        },

      }}
      className="reactmarkdown"
    >
      {markdownText}
    </ReactMarkdown>
  );
};

export default Markdown;

Markdown.propTypes = {
  markdownText: PropTypes.string,
};
