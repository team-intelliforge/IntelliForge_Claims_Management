import React from 'react';
import PropTypes from 'prop-types';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
    backgroundColor: '#FFFFFF'
  },

  title: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },

  heading: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937'
  },

  subHeading: {
    marginTop: 8,
    marginBottom: 5,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151'
  },

  paragraph: {
    marginBottom: 5,
    fontSize: 10,
    lineHeight: 1.45,
    color: '#111827'
  },

  bold: {
    fontWeight: 'bold'
  },

  inlineCode: {
    fontFamily: 'Courier',
    fontSize: 9,
    backgroundColor: '#F3F4F6',
    color: '#374151'
  },

  unorderedList: {
    marginTop: 2,
    marginBottom: 4
  },

  orderedList: {
    marginTop: 2,
    marginBottom: 4
  },

  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8
  },

  listMarker: {
    width: 16,
    fontSize: 10,
    color: '#111827'
  },

  listText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#111827'
  },

  tableWrapper: {
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'solid',
    width: '100%'
  },

  tableRow: {
    flexDirection: 'row'
  },

  tableHeaderRow: {
    backgroundColor: '#F3F4F6'
  },

  tableCellWrapper: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'solid'
  },

  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 1.3,
    color: '#111827'
  },

  tableCell: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#111827'
  },

  codeWrapper: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid'
  },

  codeLanguage: {
    marginBottom: 5,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4B5563'
  },

  codeText: {
    fontFamily: 'Courier',
    fontSize: 8,
    lineHeight: 1.35,
    color: '#111827'
  },

  diagramWrapper: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'solid'
  },

  diagramTitle: {
    marginBottom: 5,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1D4ED8'
  },

  diagramText: {
    fontFamily: 'Courier',
    fontSize: 8,
    lineHeight: 1.35,
    color: '#1F2937'
  },

  progressWrapper: {
    marginTop: 6,
    marginBottom: 8
  },

  progressOuter: {
    height: 10,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden'
  },

  progressInner: {
    height: 10,
    backgroundColor: '#2563EB'
  },

  progressLabel: {
    marginTop: 3,
    fontSize: 9,
    color: '#374151'
  },

  horizontalRule: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderBottomStyle: 'solid'
  }
});

const decodeHtmlEntities = (text = '') => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

const stripUnsupportedHtml = (text = '') => {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<b[^>]*>/gi, '**')
    .replace(/<\/b>/gi, '**')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<em[^>]*>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/<i[^>]*>/gi, '')
    .replace(/<\/i>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n');
};

const normalizeDiagramMarkdown = (text = '') => {
  let normalized = text || '';

  normalized = decodeHtmlEntities(normalized);
  normalized = stripUnsupportedHtml(normalized);

  normalized = normalized.replace(
    /```(bpmn|mermaid)\s+((?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|mindmap|timeline|quadrantChart|requirementDiagram|gitGraph)[\s\S]*?)\s*```/gi,
    (_, lang, diagram) => {
      return `\`\`\`${lang}\n${diagram.trim()}\n\`\`\``;
    }
  );

  return normalized;
};

const renderInlineMarkdown = (text = '', keyPrefix = 'inline') => {
  const decodedText = decodeHtmlEntities(text);

  const parts = decodedText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts
    .filter(part => part !== '')
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={`${keyPrefix}-bold-${index}`} style={styles.bold}>
            {part.slice(2, -2)}
          </Text>
        );
      }

      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <Text key={`${keyPrefix}-code-${index}`} style={styles.inlineCode}>
            {part.slice(1, -1)}
          </Text>
        );
      }

      return (
        <Text key={`${keyPrefix}-text-${index}`}>
          {part}
        </Text>
      );
    });
};

const isTableSeparator = line => {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
};

const getTableCells = row => {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
};

const isFencedCodeStart = line => {
  return /^```([\w-]+)?/.test(line.trim());
};

const getFenceLanguage = line => {
  const match = /^```([\w-]+)?/.exec(line.trim());
  return match?.[1]?.toLowerCase() || 'text';
};

const getProgressData = line => {
  const progressRegex =
    /<progress\s+value=["']?(\d+)["']?\s+max=["']?(\d+)["']?\s*>\s*<\/progress>\s*(.*)?/i;

  const match = line.match(progressRegex);

  if (!match) return null;

  const value = Number(match[1]);
  const max = Number(match[2]);
  const label = match[3]?.trim();

  if (!max || Number.isNaN(value) || Number.isNaN(max)) return null;

  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return {
    value,
    max,
    percent,
    label: label || `${percent}%`
  };
};

const renderProgress = (progress, key) => {
  return (
    <View key={key} style={styles.progressWrapper}>
      <View style={styles.progressOuter}>
        <View
          style={[
            styles.progressInner,
            {
              width: `${progress.percent}%`
            }
          ]}
        />
      </View>
      <Text style={styles.progressLabel}>
        {progress.label}
      </Text>
    </View>
  );
};

const renderTable = (tableRows, key) => {
  return (
    <View key={key} style={styles.tableWrapper}>
      {tableRows.map((row, rowIndex) => {
        const cells = getTableCells(row);
        const isHeaderRow = rowIndex === 0;

        return (
          <View
            key={`${key}-row-${rowIndex}`}
            style={[
              styles.tableRow,
              isHeaderRow ? styles.tableHeaderRow : {}
            ]}
          >
            {cells.map((cell, cellIndex) => (
              <View
                key={`${key}-cell-${rowIndex}-${cellIndex}`}
                style={styles.tableCellWrapper}
              >
                <Text
                  style={
                    isHeaderRow
                      ? styles.tableHeaderCell
                      : styles.tableCell
                  }
                >
                  {renderInlineMarkdown(
                    cell,
                    `${key}-cell-content-${rowIndex}-${cellIndex}`
                  )}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const ReportDocument = ({ markdownContent }) => {
  const normalizedMarkdownContent = normalizeDiagramMarkdown(markdownContent || '');
  const lines = normalizedMarkdownContent.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) continue;

    const progressData = getProgressData(line);

    if (progressData) {
      elements.push(renderProgress(progressData, `progress-${i}`));
      continue;
    }

    if (line === '---' || line === '***' || line === '___') {
      elements.push(
        <View key={`hr-${i}`} style={styles.horizontalRule} />
      );
      continue;
    }

    if (isFencedCodeStart(line)) {
      const language = getFenceLanguage(line);
      const codeLines = [];

      i++;

      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }

      const codeString = decodeHtmlEntities(codeLines.join('\n'));
      const diagramLanguages = ['mermaid', 'bpmn'];
      const isDiagram = diagramLanguages.includes(language);

      if (isDiagram) {
        elements.push(
          <View key={`diagram-${i}`} style={styles.diagramWrapper}>
            <Text style={styles.diagramTitle}>
              Diagram: {language}
            </Text>
            <Text style={styles.diagramText}>
              {codeString}
            </Text>
          </View>
        );
      } else {
        elements.push(
          <View key={`code-${i}`} style={styles.codeWrapper}>
            <Text style={styles.codeLanguage}>
              {language}
            </Text>
            <Text style={styles.codeText}>
              {codeString}
            </Text>
          </View>
        );
      }

      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${i}`} style={styles.title}>
          {renderInlineMarkdown(line.replace(/^#\s+/, ''), `h1-${i}`)}
        </Text>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${i}`} style={styles.heading}>
          {renderInlineMarkdown(line.replace(/^##\s+/, ''), `h2-${i}`)}
        </Text>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${i}`} style={styles.subHeading}>
          {renderInlineMarkdown(line.replace(/^###\s+/, ''), `h3-${i}`)}
        </Text>
      );
      continue;
    }

    if (line.startsWith('|')) {
      const tableRows = [];

      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const currentLine = lines[i].trim();

        if (!isTableSeparator(currentLine)) {
          tableRows.push(currentLine);
        }

        i++;
      }

      elements.push(renderTable(tableRows, `table-${i}`));

      i--;
      continue;
    }

    if (line.startsWith('* ') || line.startsWith('- ')) {
      const content = line.substring(2).trim();

      elements.push(
        <View key={`ul-${i}`} style={styles.listItem}>
          <Text style={styles.listMarker}>•</Text>
          <Text style={styles.listText}>
            {renderInlineMarkdown(content, `ul-${i}`)}
          </Text>
        </View>
      );

      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const number = line.match(/^(\d+)\./)?.[1];
      const content = line.replace(/^\d+\.\s+/, '');

      elements.push(
        <View key={`ol-${i}`} style={styles.listItem}>
          <Text style={styles.listMarker}>{number}.</Text>
          <Text style={styles.listText}>
            {renderInlineMarkdown(content, `ol-${i}`)}
          </Text>
        </View>
      );

      continue;
    }

    elements.push(
      <Text key={`p-${i}`} style={styles.paragraph}>
        {renderInlineMarkdown(line, `p-${i}`)}
      </Text>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          {elements}
        </View>
      </Page>
    </Document>
  );
};

ReportDocument.propTypes = {
  markdownContent: PropTypes.string
};

ReportDocument.defaultProps = {
  markdownContent: ''
};

export default ReportDocument;