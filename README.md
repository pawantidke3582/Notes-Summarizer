# 🔮 NotesAI - Modern Web-based AI Notes Summarizer & Grounded Chatbot

A sleek, purple AI-themed web application that extracts and analyzes study notes from **PDF, DOCX, and TXT** documents or pasted text. It generates structured summaries (**Short Summary, Detailed Summary, Important Points, Key Questions**) and features an interactive chatbot strictly grounded to your uploaded notes powered by the ultra-fast **Groq API (LLaMA 3.3)**.

---

## 🌟 Key Features

1. **Document Upload**: Supports `.pdf`, `.docx`, and `.txt` files with instant text extraction.
2. **Direct Text Paste**: Paste meeting notes, lectures, or articles with real-time word and character counters.
3. **Short & Long Summaries**:
   - ⚡ **Short Summary**: Quick 2-3 sentence overview + 3 key bullet points.
   - 📑 **Detailed Summary**: Structured academic summary with executive overview, core concepts, and takeaways.
   - 🎯 **Important Points**: Bulleted highlights of critical facts, rules, and formulas with bold keywords.
   - ❓ **Key Questions**: Study and review questions with accurate answers derived directly from the text.
4. **Grounded AI Chatbot**:
   - Ask any question about your notes.
   - Guardrails ensure the AI answers **only** using the uploaded notes to prevent hallucinations.
   - Dynamic prompt chips for quick questions (*Main Topic*, *Key Definitions*, *Action Items*, *Quiz Me*).
5. **Modern Purple AI Design**:
   - Futuristic obsidian & neon violet glassmorphism theme.
   - Responsive across laptops, tablets, and mobile screens.
   - Visual file badge with document icon, size, word count, and an instant **Remove** button.
   - Glowing cyber-spinner loading animation during AI processing.
   - Built-in Markdown renderer with syntax formatting and one-click copy button.

---

## 📁 Complete Folder Structure

```
Chatbot/
│
├── app.py                      # Flask server, document parsers, Groq API integration
├── requirements.txt            # Python package dependencies
├── .env.example                # Configuration template
├── .env                        # Local environment file (add GROQ_API_KEY here)
├── README.md                   # Complete documentation & Windows setup guide
│
├── static/
│   ├── css/
│   │   └── style.css           # Modern purple AI theme, glassmorphism & animations
│   └── js/
│       └── app.js              # Client state, file drop, API calls & Markdown rendering
│
└── templates/
    └── index.html              # Clean semantic HTML5 responsive user interface
```

---

## 🚀 Step-by-Step Setup & Run on Windows

Follow these simple steps in **Windows PowerShell** or **Command Prompt**:

### Step 1: Open PowerShell in the Project Folder
Open PowerShell and navigate to the project directory:
```powershell
cd c:\Users\VICTUS\Chatbot
```

### Step 2: (Optional but Recommended) Create a Virtual Environment
```powershell
python -m venv venv
```

Activate the virtual environment:
- **PowerShell**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If you get a script execution policy warning in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*
- **Command Prompt (CMD)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```

### Step 3: Install Required Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Configure Your Groq API Key
1. Get a free API key from [console.groq.com/keys](https://console.groq.com/keys).
2. Open the `.env` file in the project directory and paste your API key:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
   *(Alternatively, you can also enter your API key directly in the web UI by clicking the **"API Key"** button in the top right corner!)*

### Step 5: Start the Application
Run the Flask server:
```powershell
python app.py
```

You should see output similar to:
```
 * AI Notes Summarizer Chatbot starting on http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

### Step 6: Open in Your Web Browser
Open your browser (Chrome, Edge, Firefox, Brave) and navigate to:
```
http://127.0.0.1:5000
```

---

## 💡 How to Use the App

1. **Add Notes**:
   - **Upload File**: Drag and drop any `.pdf`, `.docx`, or `.txt` file into the upload zone, or click **Browse Files**.
   - **Paste Text**: Click the **Paste Text** tab and paste your content, or click **✨ Load Sample Notes** to test immediately.
2. **Inspect or Remove Document**:
   - When a document is loaded, a card displays its name, size, and word count.
   - Click **Remove** anytime to clear the uploaded file.
3. **Generate a Summary**:
   - Select your desired mode (*Short Summary*, *Detailed Summary*, *Important Points*, or *Key Questions*).
   - Click **Generate AI Summary**.
   - Review the formatted summary and click **Copy** to copy it to your clipboard.
4. **Chat with Your Notes**:
   - Use the right panel to ask questions (e.g., *"What is the main finding?"*, *"Summarize section 2"*).
   - Use the suggested prompt pills for one-click questions.
   - Notice that if you ask something not present in your notes, the AI will strictly reply that the information is not found in the notes.

---

## 🛠️ Technology Stack

- **Backend**: Python 3, Flask 3.1, Flask-CORS
- **Text Extraction**: `pypdf` (for PDF documents), `python-docx` (for Word documents)
- **AI Engine**: `groq` Python SDK (`llama-3.3-70b-versatile` with automatic fallback to `llama-3.1-8b-instant`)
- **Frontend**: Vanilla HTML5, Modern CSS3 (Glassmorphism, custom CSS variables, flex/grid), Vanilla JavaScript (ES6+)
- **Markdown & Security**: `marked.js` + `DOMPurify` (sanitized client-side rendering)

---

## ❓ Troubleshooting Common Windows Issues

- **Port 5000 already in use**:
  Change the port in `.env` (e.g. `PORT=5001`) or run `python app.py` with the updated port.
- **`ExecutionPolicy` error when activating venv**:
  Run PowerShell as Administrator and type:
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **"Groq API key not found"**:
  Make sure you pasted your key into `.env` or opened the **API Key** button in the web interface and clicked **Save Key**.
