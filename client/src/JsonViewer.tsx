import { useState } from 'react';

interface Props {
  data: unknown;
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (match.startsWith('"')) {
        if (match.endsWith(':')) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (match === 'null') {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export function JsonViewer({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const jsonStr = JSON.stringify(data, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="json-viewer">
      <button className="copy-btn" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonStr) }} />
    </div>
  );
}
