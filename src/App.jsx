import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { explainCode } from './services/codeExplainer';
import './App.css';

const sampleCodes = [
  {
    name: 'JavaScript',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`
  },
  {
    name: 'Python',
    code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`
  },
  {
    name: 'React',
    code: `function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`
  },
  {
    name: 'SQL',
    code: `SELECT customers.name, orders.total
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id
WHERE orders.total > 100
ORDER BY orders.total DESC;`
  },
  {
    name: 'C#',
    code: `public class Calculator
{
    public int Add(int a, int b) => a + b;
    
    public async Task<int> GetResultAsync()
    {
        await Task.Delay(1000);
        return Add(5, 10);
    }
}`
  }
];

const langToEditorLang = {
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C#': 'csharp',
  'C++': 'cpp',
  'C': 'c',
  'PHP': 'php',
  'Ruby': 'ruby',
  'Go': 'go',
  'Rust': 'rust',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'React/JSX': 'jsx',
  'SQL': 'sql',
  'HTML': 'html',
  'CSS': 'css',
};

function App() {
  const [code, setCode] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedLang, setDetectedLang] = useState('');
  const [manualLang, setManualLang] = useState('');
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('system');
  const [explanationVersions, setExplanationVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);

  useEffect(() => {
    const envApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
    } else {
      fetch('/config.json')
        .then(res => res.json())
        .then(config => {
          if (config.apiKey) setApiKey(config.apiKey);
        })
        .catch(err => console.error('Failed to load config:', err));
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('codeExplainerTheme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('codeExplainerTheme', theme);
  }, [theme]);

  const detectLanguage = useCallback((code) => {
    if (!code.trim()) return '';
  
    if (code.includes('import React') || code.includes('from "react"') || code.includes("from 'react'") || 
        code.includes('useState') || code.includes('useEffect') || code.includes('useRef') ||
        /<[A-Z][a-zA-Z]*/.test(code) || code.includes('className=') || code.includes('onClick=')) {
      return 'React/JSX';
    }
    if (code.includes(': string') || code.includes(': number') || code.includes(': boolean') ||
        code.includes('interface ') || code.includes('type ') || code.includes('<T>')) {
      return 'TypeScript';
    }
    
    if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN)\b/i.test(code)) {
      return 'SQL';
    }
    
    if (code.includes('<?php') || code.includes('$_') || code.includes('echo ')) {
      return 'PHP';
    }
 
    
    if (code.includes('{') && (code.includes('color:') || code.includes('margin:') || code.includes('display:'))) {
      return 'CSS';
    }

    if (code.includes('function') || code.includes('const ') || code.includes('let ') ||
        code.includes('var ') || code.includes('=>') || code.includes('async') ||
        code.includes('console.') || code.includes('document.') || code.includes('window.')) {
      return 'JavaScript';
    }
    
    return 'Code';
  }, []);

  const isValidCode = (text) => {
    if (!text.trim()) return false;
    
    const explanationPatterns = [
      /\*\*Language:\*\*/i,
      /\*\*What this code does:\*\*/i,
      /\*\*Explanation:\*\*/i,
      /Learn more about \w+/i,
      /^Explanation:/m,
      /^What this code does:/m,
    ];
    
    if (explanationPatterns.some(pattern => pattern.test(text))) return false;
    
    const codePatterns = [/\{[\s\S]*\}/, /\([\s\S]*\)/, /\[[\s\S]*\]/, /;/, /=/,
      /\bfunction\b|\bdef\b|\bclass\b|\bmain\b|\bvoid\b|\bint\b|\bpublic\b/i];
    
    return codePatterns.some(pattern => pattern.test(text));
  };

  const handleCodeChange = (value) => {
    setCode(value);
    setDetectedLang(detectLanguage(value));
    setExplanation('');
    setError(null);
    setDuplicateCount(0);
    setExplanationVersions([]);
    setCurrentVersionIndex(0);
  };



  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please enter some code to explain.');
      return;
    }
    if (!isValidCode(code)) {
      setError('⚠️ This looks like explanation text, not code. Please paste actual programming code.');
      return;
    }
    if (!apiKey) {
      setError('API key not configured. Please check config.json');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const language = manualLang.trim() || detectedLang || 'Code';
      const result = await explainCode(code, apiKey, language);
      
      const isDuplicate = explanationVersions.some(v => 
        v.content.substring(0, 200) === result.substring(0, 200)
      );
      
      if (isDuplicate) {
        setDuplicateCount(prev => prev + 1);
      } else {
        setExplanation(result);
        setDuplicateCount(0);
        setExplanationVersions(prev => [...prev, { content: result, timestamp: Date.now() }]);
        setCurrentVersionIndex(explanationVersions.length);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while explaining the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (duplicateCount > 0) {
      return;
    }
    handleExplain();
  };

  const navigateVersion = (direction) => {
    const newIndex = currentVersionIndex + direction;
    if (newIndex >= 0 && newIndex < explanationVersions.length) {
      setCurrentVersionIndex(newIndex);
      setExplanation(explanationVersions[newIndex].content);
    }
  };

  const handleClear = () => {
    setCode('');
    setExplanation('');
    setError(null);
    setDetectedLang('');
    setManualLang('');
    setCopied(false);
    setExplanationVersions([]);
    setCurrentVersionIndex(0);
    setDuplicateCount(0);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const loadSample = (sampleCode) => {
    setCode(sampleCode);
    setDetectedLang(detectLanguage(sampleCode));
    setExplanation('');
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleExplain();
  };

  const stripMarkdown = (text) => {
    return text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/>\s+/g, '')
      .replace(/---+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleCopy = () => {
    const plainText = stripMarkdown(explanation);
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '💻';
  };

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🧠 AI Code Explainer</h1>
          <p>Paste your code and get instant explanations</p>
        </div>
        <div className="header-controls">
          <button className="theme-toggle" onClick={cycleTheme} title={`Theme: ${theme}`}>
            {getThemeIcon()}
          </button>
        </div>
      </header>

      <div className="sample-section">
        <span className="sample-label">🧪 Try a sample:</span>
        <div className="sample-buttons">
          {sampleCodes.map((sample) => (
            <button key={sample.name} className="sample-btn" onClick={() => loadSample(sample.code)}>
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      <main className="app-main">
        <div className="input-section">
          <div className="input-header">
            <span className="section-label">📝 Your Code</span>
            <div className="lang-input-group">
              <span className="lang-label">Language:</span>
              <input
                type="text"
                value={manualLang}
                onChange={(e) => setManualLang(e.target.value)}
                placeholder={detectedLang && detectedLang !== 'Code' ? detectedLang : 'Auto-detect'}
                className="lang-input"
                title="If auto-detect is wrong, type the correct language for better results"
              />
              {detectedLang && detectedLang !== 'Code' && !manualLang && <span className="lang-detected">✓ {detectedLang}</span>}
              {!manualLang && detectedLang && detectedLang !== 'Code' && <span className="lang-hint">Wrong? Type correct language</span>}
            </div>
          </div>
          
          <div className="code-editor-wrapper" onKeyDown={handleKeyDown}>
            <CodeEditor
              value={code}
              language={langToEditorLang[detectedLang] || 'javascript'}
              placeholder={`// Paste your code here (any language)...`}
              onChange={(e) => handleCodeChange(e.target.value)}
              padding={16}
              className="code-editor"
              style={{ fontSize: 14, fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace', minHeight: '200px' }}
            />
          </div>
          
          <div className="input-footer">
            <span className="shortcut-hint">💡 Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to explain</span>
            <div className="button-group">
              <button className="clear-btn" onClick={handleClear} disabled={!code}>Clear</button>
              <button className="explain-btn" onClick={handleExplain} disabled={isLoading || !code.trim()}>
                {isLoading ? (<><span className="spinner"></span>Analyzing...</>) : '🚀 Explain Code'}
              </button>
            </div>
          </div>
        </div>

        <div className="output-section">
          <div className="output-header">
            <span className="section-label">💡 Explanation</span>
            {explanation && (
              <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
          
          <div className="output-content">
            {error ? (
              <div className="error-message">{error}</div>
            ) : isLoading ? (
              <div className="loading-state">
                <div className="loading-dots"><span></span><span></span><span></span></div>
                <p>AI is analyzing your code...</p>
              </div>
            ) : explanation ? (
              <div className="explanation-text markdown-body">
                <ReactMarkdown>{explanation}</ReactMarkdown>
                
                <div className="regenerate-section">
                  <div className="regenerate-left">
                    <span className="regenerate-label">
                      {duplicateCount > 0 ? '😊 AI gave similar response. Try changing your code!' : 'Not satisfied? Try again:'}
                    </span>
                    <button 
                      className={`regenerate-btn ${duplicateCount > 0 ? 'disabled-hint' : ''}`}
                      onClick={handleRegenerate}
                      disabled={isLoading || duplicateCount > 0}
                      title={duplicateCount > 0 ? 'Change your code to get different results' : 'Generate a new explanation'}
                    >
                      {duplicateCount > 0 ? '🔒 Similar Result' : '🔄 Regenerate'}
                    </button>
                  </div>
                  {explanationVersions.length > 1 && (
                    <div className="version-nav">
                      <button 
                        className="nav-btn"
                        onClick={() => { setCurrentVersionIndex(0); setExplanation(explanationVersions[0].content); }}
                        disabled={currentVersionIndex === 0}
                        title="First version"
                      >
                        ⏮ First
                      </button>
                      <button 
                        className="nav-btn"
                        onClick={() => navigateVersion(-1)}
                        disabled={currentVersionIndex === 0}
                        title="Previous version"
                      >
                        ← Back
                      </button>
                      <span className="version-count">{currentVersionIndex + 1}/{explanationVersions.length}</span>
                      <button 
                        className="nav-btn"
                        onClick={() => navigateVersion(1)}
                        disabled={currentVersionIndex === explanationVersions.length - 1}
                        title="Next version"
                      >
                        Next →
                      </button>
                      <button 
                        className="nav-btn"
                        onClick={() => { setCurrentVersionIndex(explanationVersions.length - 1); setExplanation(explanationVersions[explanationVersions.length - 1].content); }}
                        disabled={currentVersionIndex === explanationVersions.length - 1}
                        title="Last version"
                      >
                        Last ⏭
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state"><p>Your code explanation will appear here</p></div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Supports all programming languages • Auto-detects language</p>
        <p className="ai-disclaimer">⚠️ AI-generated explanations may contain errors. Always verify critical information.</p>
      </footer>
    </div>
  );
}

export default App;
