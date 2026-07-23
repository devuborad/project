import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="prose prose-invert prose-red max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            
            if (!inline && match) {
              return (
                <div className="relative my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]">
                  <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
                    <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
                    <button
                      onClick={() => copyToClipboard(codeString)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === codeString ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="overflow-x-auto text-sm">
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }
            
            // Inline code
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-white/10 text-red-300 font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="p-3 bg-white/5 border-b border-white/10 font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="p-3 border-b border-white/5">{children}</td>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
