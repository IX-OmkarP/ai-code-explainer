# 🧠 AI Code Explainer

A powerful AI-powered tool that explains code in plain English. Paste any code snippet and get instant, beginner-friendly explanations powered by Groq's Llama 3.3 70B model.

## 🌐 Live Demo

**Try it now:** [https://ai-code-explainer-demo.netlify.app](https://ai-code-explainer-demo.netlify.app)

---

## 📸 Quick Demo

```javascript
// Paste this code:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));
```

**AI Explanation:**
> **What this code does:**
> This code calculates the Fibonacci number at position `n` using recursion. The Fibonacci sequence starts with 0, 1, and each subsequent number is the sum of the two preceding ones (0, 1, 1, 2, 3, 5, 8...).
>
> **Explanation:**
> - Base case: If `n` is 0 or 1, return `n` directly
> - Recursive case: Add the result of `fibonacci(n-1)` and `fibonacci(n-2)`
> - `console.log(fibonacci(10))` prints the 10th Fibonacci number (55)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Multi-Language Support** | JavaScript, Python, React/JSX, TypeScript, SQL, C#, PHP, CSS, and more |
| **Auto Language Detection** | Automatically detects programming language from code patterns |
| **Manual Override** | Override auto-detection when incorrect |
| **Syntax Highlighting** | Professional code editor with language-aware highlighting |
| **Theme Support** | Dark, Light, and System preference themes |
| **Sample Code Library** | Try with pre-built code samples (JavaScript, Python, React, SQL, C#) |
| **One-Click Copy** | Copy explanation to clipboard (strips markdown formatting) |
| **Regenerate** | Generate new explanations if not satisfied |
| **Version History** | Navigate between multiple explanation versions |
| **Keyboard Shortcut** | Press `Ctrl+Enter` to explain instantly |
| **Code Validation** | Prevents pasting explanation text instead of code |
| **Responsive Design** | Works on desktop, tablet, and mobile |

---

## 🔧 How It Works

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Input    │ --> │  React Frontend │ --> │   Groq API      │
│   (Code)        │     │  (App.jsx)      │     │  (Llama 3.3)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               v                        v
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Language        │     │ AI Explanation  │
                        │ Detection       │     │ (Markdown)      │
                        └─────────────────┘     └─────────────────┘
```

### Flow

1. **User pastes code** → Code editor captures input with syntax highlighting
2. **Language detection** → Pattern matching identifies language (React hooks, SQL keywords, etc.)
3. **API request** → Code sent to Groq API with system prompt for explanation
4. **AI processing** → Llama 3.3 70B generates structured explanation
5. **Render response** → Markdown parsed and displayed with formatting

### Key Components

| File | Purpose |
|------|---------|
| `App.jsx` | Main React component with state management, UI, and event handlers |
| `App.css` | Complete styling with CSS variables for theming |
| `codeExplainer.js` | Groq API integration and prompt engineering |
| `index.css` | Base styles, scrollbar, and focus states |
| `config.json` | API key configuration (not committed to git) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/IX-OmkarP/ai-code-explainer.git
cd ai-code-explainer
npm install
```

### 2. Get API Key (FREE)

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up/Login and create a new API key
3. Copy the key (starts with `gsk_`)

### 3. Configure

```bash
cp public/config.example.json public/config.json
```

Edit `public/config.json`:
```json
{
  "apiKey": "gsk_your_api_key_here"
}
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
code-explainer/
├── public/
│   ├── config.json          # API key (create from example)
│   └── config.example.json  # Example config template
├── src/
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles with theming
│   ├── index.css            # Base styles and resets
│   ├── main.jsx             # React entry point
│   └── services/
│       └── codeExplainer.js # Groq API integration
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with hooks for state management |
| **Vite** | Fast build tool and dev server |
| **Groq API** | AI inference with Llama 3.3 70B model |
| **@uiw/react-textarea-code-editor** | Syntax-highlighted code editor |
| **react-markdown** | Render AI explanations with formatting |

---

## 🎯 Usage Examples

### Example 1: Python Sorting Algorithm

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

### Example 2: React Component

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Example 3: SQL Query

```sql
SELECT customers.name, orders.total
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id
WHERE orders.total > 100
ORDER BY orders.total DESC;
```

---

## ⚠️ Important Notes

- **AI Disclaimer**: AI-generated explanations may contain errors. Always verify critical information.
- **Code Only**: This tool explains code only. It will not fix, modify, or improve your code.
- **Language Detection**: If auto-detection is wrong, manually type the correct language for better results.
- **API Limits**: Groq free tier has rate limits. Wait a moment if you hit limits.

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing fast AI inference
- [Meta](https://ai.meta.com/) for the Llama 3.3 model
- [Vite](https://vitejs.dev/) for the amazing build tool

---

**Made with ❤️ by [Omkar Pawar](https://github.com/IX-OmkarP)**
