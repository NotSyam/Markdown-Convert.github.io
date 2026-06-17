import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
import { Sun, Moon, Copy, Download, Check, Type, AlignLeft, Hash } from 'lucide-react';

export default function App() {
  const [markdown, setMarkdown] = useState(
`# Selamat Datang di Markdown Pro

Aplikasi ini mendukung live rendering markdown dengan fitur:
- **Word**, **Sentence**, **Paragraph** counter
- Export ke \`.doc\`, \`.txt\`, dan \`.pdf\`
- Dark theme yang telah disesuaikan contrast-nya

## Contoh Tabel

| Fitur | Status | Keterangan |
| :--- | :---: | :--- |
| Dark Mode | ✅ | Tabel tetap terlihat jelas | 
| PDF Export | ✅ | Menggunakan html2pdf.js |
| Word Export| ✅ | Format basic HTML ke doc |
`);
  const [fileName, setFileName] = useState('Dokumen_Baru');
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync dark mode HTML class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const countWords = (text: string) => text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const countSentences = (text: string) => text.split(/[.?!]+/).filter(s => s.trim().length > 0).length;
  const countParagraphs = (text: string) => text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  
  const stats = {
    chars: markdown.length,
    words: countWords(markdown),
    sentences: countSentences(markdown),
    paragraphs: countParagraphs(markdown),
  };

  const copyToClipboard = () => {
    if (!previewRef.current) return;
    navigator.clipboard.writeText(previewRef.current.innerText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadTxt = () => {
    if (!markdown) return alert("Teks masih kosong!");
    const blob = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const downloadWord = () => {
    if (!previewRef.current) return;
    const content = previewRef.current.innerHTML;
    if (!content) return alert("Teks masih kosong!");

    const styles = `
        <style>
            body { font-family: "Arial", sans-serif; font-size: 11pt; line-height: 1.5; color: #000; background: #fff; }
            h1 { font-size: 16pt; color: #2b579a; }
            h2 { font-size: 14pt; color: #2b579a; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            td, th { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            code { background-color: #f8f9fa; padding: 2px 4px; border-radius: 4px; font-family: monospace; color: #d63384; }
            pre { background-color: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
            blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; font-style: italic; }
        </style>
    `;

    const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset="utf-8">${styles}</head>
        <body>${content}</body>
        </html>`;
    
    // Add BOM for proper UTF-8 encoding in MS Word
    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setIsDropdownOpen(false);
  };

  const downloadPdf = () => {
    if (!previewRef.current) return;
    if (!markdown) return alert("Teks masih kosong!");
    
    // Temporarily turn off dark mode so PDF generates with black text on white background
    const wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) {
      document.documentElement.classList.remove('dark');
    }
    
    setTimeout(() => {
      const opt = {
        margin:       0.5,
        filename:     `${fileName}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(previewRef.current).save().then(() => {
        if (wasDark) {
          document.documentElement.classList.add('dark');
        }
      });
      setIsDropdownOpen(false);
    }, 200); // Slight delay to ensure restyle applied
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-col md:flex-row justify-between items-center z-10 gap-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl tracking-tight">
          <Type className="w-6 h-6" />
          <span>Markdown Pro</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filename Input */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 w-full md:w-auto">
            <input 
              type="text" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="nama-file"
              className="bg-transparent border-none outline-none text-sm font-medium w-full md:w-40 dark:text-gray-200"
            />
          </div>

          {/* Action Buttons */}
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Download Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden">
                <button onClick={downloadWord} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between">
                  <span>To Word (.doc)</span>
                </button>
                <button onClick={downloadPdf} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between">
                  <span>To PDF (.pdf)</span>
                </button>
                <button onClick={downloadTxt} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between">
                  <span>To Text (.txt)</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden gap-4 p-4">
        
        {/* Editor Box */}
        <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex-shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Editor</span>
            {/* Quick stats for editor */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1" title="Words"><AlignLeft className="w-3.5 h-3.5" /> {stats.words}</span>
              <span className="flex items-center gap-1" title="Characters"><Hash className="w-3.5 h-3.5" /> {stats.chars}</span>
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Tulis markdown di sini..."
            className="flex-1 w-full bg-transparent p-6 outline-none resize-none font-mono text-sm leading-relaxed overflow-y-auto text-gray-800 dark:text-gray-300 focus:ring-0 whitespace-pre-wrap"
          />
        </section>

        {/* Preview Box */}
        <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex-shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Preview</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900" id="preview-container">
            <div ref={previewRef} className="markdown-body h-full">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Wrap table to allow horizontal scrolling
                  table: ({node, ...props}) => <div className="table-wrapper"><table {...props} /></div>
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Stats */ }
      <footer className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 flex flex-wrap justify-between md:justify-end gap-x-6 gap-y-1">
         <span>Words: {stats.words}</span>
         <span>Sentences: {stats.sentences}</span>
         <span>Paragraphs: {stats.paragraphs}</span>
         <span>Characters: {stats.chars}</span>
      </footer>
    </div>
  );
}

