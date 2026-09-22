/**
 * NotesAI - Frontend Application Logic
 * Supports PDF/DOCX/TXT file upload, text pasting, multi-mode summarization,
 * and strictly-grounded Groq AI notes chatbot.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        activeTab: 'upload',        // 'upload' | 'paste'
        uploadedFile: null,         // File object or null
        uploadedText: '',           // Extracted text from file
        pastedText: '',             // Text from paste textarea
        selectedMode: 'short',      // 'short' | 'detailed' | 'points' | 'questions'
        chatHistory: [],            // Array of { role: 'user' | 'assistant', content: string }
        isProcessing: false,
        hasEnvKey: false
    };

    // --- DOM Elements ---
    // Header & Status
    const connectionStatusBadge = document.getElementById('connectionStatusBadge');
    const connectionStatusText = document.getElementById('connectionStatusText');
    const openApiKeyModalBtn = document.getElementById('openApiKeyModalBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    const themeToggleText = document.getElementById('themeToggleText');

    // Tabs
    const tabUploadBtn = document.getElementById('tabUploadBtn');
    const tabPasteBtn = document.getElementById('tabPasteBtn');
    const uploadTabContent = document.getElementById('uploadTabContent');
    const pasteTabContent = document.getElementById('pasteTabContent');

    // Upload & File Info
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseFileBtn = document.getElementById('browseFileBtn');
    const fileInfoCard = document.getElementById('fileInfoCard');
    const fileExtBadge = document.getElementById('fileExtBadge');
    const uploadedFileName = document.getElementById('uploadedFileName');
    const uploadedFileSize = document.getElementById('uploadedFileSize');
    const uploadedWordCount = document.getElementById('uploadedWordCount');
    const removeFileBtn = document.getElementById('removeFileBtn');

    // Paste Area
    const notesTextarea = document.getElementById('notesTextarea');
    const charCount = document.getElementById('charCount');
    const textWordCount = document.getElementById('textWordCount');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const clearTextBtn = document.getElementById('clearTextBtn');

    // Summarizer Modes & Button
    const modeCards = document.querySelectorAll('.mode-card');
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    const summarizeBtnText = document.getElementById('summarizeBtnText');
    const summaryResultContainer = document.getElementById('summaryResultContainer');
    const summaryResultTag = document.getElementById('summaryResultTag');
    const summaryContent = document.getElementById('summaryContent');
    const copySummaryBtn = document.getElementById('copySummaryBtn');

    // Chatbot
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const suggestionChips = document.querySelectorAll('.chip-btn');

    // Modals & Loaders
    const aiLoader = document.getElementById('aiLoader');
    const loaderTitle = document.getElementById('loaderTitle');
    const loaderSubtitle = document.getElementById('loaderSubtitle');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const closeApiKeyModalBtn = document.getElementById('closeApiKeyModalBtn');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
    const toastContainer = document.getElementById('toastContainer');

    // Sample notes content for immediate testing
    const SAMPLE_NOTES = `# Lecture Notes: Artificial Intelligence & Neural Networks

## 1. Introduction to Machine Learning
Machine Learning (ML) is a subset of Artificial Intelligence where algorithms learn patterns from training data rather than relying on hard-coded rules.
There are three main paradigms:
- Supervised Learning: Learning with labeled ground-truth examples (e.g., Regression, Classification).
- Unsupervised Learning: Discovering hidden patterns in unlabeled data (e.g., K-Means Clustering, PCA).
- Reinforcement Learning: Agents learning by interacting with an environment through trial, error, and reward signals.

## 2. Artificial Neural Networks (ANNs)
Artificial Neural Networks are inspired by biological neurons in the human brain.
- Architecture: An input layer, one or more hidden layers, and an output layer.
- Activation Functions: Introduce non-linearity into network predictions. Common functions include ReLU (Rectified Linear Unit), Sigmoid, and Softmax.
- Forward Propagation: The calculation of inputs passing through weights and activation functions to generate predictions.
- Backpropagation: The process of calculating gradients of the loss function with respect to weights using the chain rule to update parameters via gradient descent.

## 3. Large Language Models (LLMs) & Transformers
- Transformers introduced the Self-Attention mechanism in 2017 ("Attention Is All You Need"), allowing models to weigh the significance of words regardless of their positional distance.
- Modern LLMs (like LLaMA, GPT) use transformer decoders trained on vast corpora of text to generate contextually coherent language.

## 4. Key Takeaways & Exam Tips
- Overfitting occurs when a model memorizes training noise instead of general patterns. Techniques to prevent overfitting: Dropout, L1/L2 Regularization, and Early Stopping.
- Underfitting occurs when a model is too simple to capture underlying relationships.`;

    // --- Helper Functions ---

    function getApiKey() {
        return localStorage.getItem('notesai_groq_api_key') || '';
    }

    function setApiKey(key) {
        if (key) {
            localStorage.setItem('notesai_groq_api_key', key);
        } else {
            localStorage.removeItem('notesai_groq_api_key');
        }
        checkApiStatus();
    }

    function getActiveNotesText() {
        if (state.activeTab === 'upload') {
            return state.uploadedText.trim();
        } else {
            return notesTextarea.value.trim();
        }
    }

    function showLoader(title, subtitle) {
        loaderTitle.textContent = title || 'AI is analyzing notes...';
        loaderSubtitle.textContent = subtitle || 'Extracting insights using Groq ultra-fast LLaMA';
        aiLoader.classList.remove('hidden');
    }

    function hideLoader() {
        aiLoader.classList.add('hidden');
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
        
        const iconSvg = type === 'error' 
            ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
            : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;

        toast.innerHTML = `<span>${iconSvg}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function updateCounters(text) {
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        charCount.textContent = `${chars.toLocaleString()} characters`;
        textWordCount.textContent = `${words.toLocaleString()} words`;
    }

    // Check API Status on Load
    async function checkApiStatus() {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();
            state.hasEnvKey = data.has_env_key;
            
            const localKey = getApiKey();
            if (state.hasEnvKey || localKey) {
                connectionStatusBadge.className = 'status-badge connected';
                connectionStatusText.textContent = state.hasEnvKey ? 'Groq Connected (.env)' : 'Groq Connected (Custom Key)';
            } else {
                connectionStatusBadge.className = 'status-badge warning';
                connectionStatusText.textContent = 'API Key Needed';
            }
        } catch (err) {
            connectionStatusBadge.className = 'status-badge warning';
            connectionStatusText.textContent = 'Backend Offline';
        }
    }

    // --- Tab Switching Logic ---
    function switchTab(tab) {
        state.activeTab = tab;
        if (tab === 'upload') {
            tabUploadBtn.classList.add('active');
            tabPasteBtn.classList.remove('active');
            tabUploadBtn.setAttribute('aria-selected', 'true');
            tabPasteBtn.setAttribute('aria-selected', 'false');
            uploadTabContent.classList.remove('hidden');
            pasteTabContent.classList.add('hidden');
        } else {
            tabPasteBtn.classList.add('active');
            tabUploadBtn.classList.remove('active');
            tabPasteBtn.setAttribute('aria-selected', 'true');
            tabUploadBtn.setAttribute('aria-selected', 'false');
            pasteTabContent.classList.remove('hidden');
            uploadTabContent.classList.add('hidden');
        }
    }

    tabUploadBtn.addEventListener('click', () => switchTab('upload'));
    tabPasteBtn.addEventListener('click', () => switchTab('paste'));

    // --- File Upload & Drag-and-Drop ---
    browseFileBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
        if (e.target !== browseFileBtn) fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    async function handleFileUpload(file) {
        const allowedExtensions = ['pdf', 'docx', 'doc', 'txt'];
        const ext = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            showToast(`Unsupported format .${ext}. Please select a PDF, DOCX, or TXT file.`, 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        showLoader(`Uploading & Extracting ${file.name}...`, 'Reading document pages and paragraphs');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract text from document');
            }

            // Update State
            state.uploadedFile = file;
            state.uploadedText = data.text;

            // Update UI Card
            uploadedFileName.textContent = file.name;
            uploadedFileSize.textContent = formatFileSize(file.size);
            uploadedWordCount.textContent = `${data.word_count.toLocaleString()} words`;
            fileExtBadge.textContent = ext.toUpperCase();

            // Display card & hide drop zone prompt
            fileInfoCard.classList.remove('hidden');
            dropZone.classList.add('hidden');

            showToast(`Successfully extracted ${data.word_count.toLocaleString()} words!`, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            hideLoader();
        }
    }

    // Remove Uploaded File
    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.uploadedFile = null;
        state.uploadedText = '';
        fileInput.value = '';

        fileInfoCard.classList.add('hidden');
        dropZone.classList.remove('hidden');
        showToast('Document removed.', 'info');
    });

    // --- Paste Text Controls ---
    notesTextarea.addEventListener('input', () => {
        updateCounters(notesTextarea.value);
    });

    loadSampleBtn.addEventListener('click', () => {
        notesTextarea.value = SAMPLE_NOTES;
        updateCounters(notesTextarea.value);
        showToast('Loaded sample notes on Machine Learning!', 'success');
    });

    clearTextBtn.addEventListener('click', () => {
        notesTextarea.value = '';
        updateCounters('');
        showToast('Text cleared.', 'info');
    });

    // --- Summary Modes ---
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            state.selectedMode = card.getAttribute('data-mode');
        });
    });

    // Mode labels dictionary
    const modeLabels = {
        short: 'Short Summary',
        detailed: 'Detailed Summary',
        points: 'Important Points',
        questions: 'Key Questions & Answers'
    };

    // --- Summarization Action ---
    generateSummaryBtn.addEventListener('click', async () => {
        const text = getActiveNotesText();

        if (!text) {
            if (state.activeTab === 'upload') {
                showToast('Please upload a PDF, DOCX, or TXT file first.', 'error');
            } else {
                showToast('Please paste or type notes in the text area first.', 'error');
            }
            return;
        }

        const mode = state.selectedMode;
        const apiKey = getApiKey();

        showLoader(
            `Generating ${modeLabels[mode]}...`,
            'Processing with Groq ultra-fast LLaMA AI model'
        );

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    mode: mode,
                    api_key: apiKey
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    openApiKeyModal();
                }
                throw new Error(data.error || 'Failed to generate summary');
            }

            // Render Markdown
            summaryResultTag.textContent = modeLabels[mode];
            const rawHtml = marked.parse(data.summary);
            summaryContent.innerHTML = DOMPurify.sanitize(rawHtml);
            summaryResultContainer.classList.remove('hidden');

            // Scroll into view
            summaryResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            showToast('Summary generated successfully!', 'success');

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            hideLoader();
        }
    });

    // Copy Summary to Clipboard
    copySummaryBtn.addEventListener('click', async () => {
        const textToCopy = summaryContent.innerText;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalText = copySummaryBtn.querySelector('span').textContent;
            copySummaryBtn.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
                copySummaryBtn.querySelector('span').textContent = originalText;
            }, 2000);
            showToast('Summary copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy to clipboard', 'error');
        }
    });

    // --- Chatbot Functionality ---
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendChatMessage();
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Suggested Questions Chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.getAttribute('data-question');
            chatInput.value = question;
            sendChatMessage();
        });
    });

    // Clear Chat
    clearChatBtn.addEventListener('click', () => {
        state.chatHistory = [];
        chatMessages.innerHTML = `
            <div class="chat-message assistant-message">
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z"/>
                    </svg>
                </div>
                <div class="message-content">
                    <p><strong>Chat reset.</strong> Ask me anything about your uploaded notes!</p>
                </div>
            </div>
        `;
        showToast('Chat history cleared.', 'info');
    });

    async function sendChatMessage() {
        const question = chatInput.value.trim();
        if (!question) return;

        const notesText = getActiveNotesText();
        if (!notesText) {
            showToast('Please upload notes or paste text before asking questions.', 'error');
            return;
        }

        // 1. Append User Message
        appendMessage('user', question);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 2. Append Typing Indicator
        const typingElement = appendTypingIndicator();
        scrollChatToBottom();

        // 3. Request AI Response
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notes: notesText,
                    question: question,
                    history: state.chatHistory,
                    api_key: getApiKey()
                })
            });

            const data = await response.json();
            typingElement.remove();

            if (!response.ok) {
                if (response.status === 401) {
                    openApiKeyModal();
                }
                throw new Error(data.error || 'Failed to get answer from AI');
            }

            // Append Assistant Message
            appendMessage('assistant', data.reply);
            state.chatHistory.push({ role: 'user', content: question });
            state.chatHistory.push({ role: 'assistant', content: data.reply });

        } catch (err) {
            typingElement.remove();
            appendMessage('assistant', `⚠️ **Error:** ${err.message}`);
        }

        scrollChatToBottom();
    }

    function appendMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${role}-message`;

        const avatarSvg = role === 'user'
            ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
            : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z"/></svg>`;

        const parsedContent = role === 'assistant' 
            ? DOMPurify.sanitize(marked.parse(content))
            : `<p>${escapeHtml(content)}</p>`;

        msgDiv.innerHTML = `
            <div class="message-avatar">${avatarSvg}</div>
            <div class="message-content markdown-body">${parsedContent}</div>
        `;

        chatMessages.appendChild(msgDiv);
        scrollChatToBottom();
    }

    function appendTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message assistant-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z"/>
                </svg>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        return typingDiv;
    }

    function scrollChatToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- API Key Modal Controls ---
    function openApiKeyModal() {
        apiKeyInput.value = getApiKey();
        apiKeyModal.classList.remove('hidden');
    }

    function closeApiKeyModal() {
        apiKeyModal.classList.add('hidden');
    }

    openApiKeyModalBtn.addEventListener('click', openApiKeyModal);
    closeApiKeyModalBtn.addEventListener('click', closeApiKeyModal);

    apiKeyModal.addEventListener('click', (e) => {
        if (e.target === apiKeyModal) closeApiKeyModal();
    });

    saveApiKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        setApiKey(key);
        closeApiKeyModal();
        showToast('API Key saved!', 'success');
    });

    clearApiKeyBtn.addEventListener('click', () => {
        apiKeyInput.value = '';
        setApiKey('');
        closeApiKeyModal();
        showToast('API Key removed.', 'info');
    });

    // Auto-grow textarea for chat
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Theme Toggle (Light / Dark)
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
            if (themeToggleText) themeToggleText.textContent = 'Light';
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
            if (themeToggleText) themeToggleText.textContent = 'Dark';
        }
        localStorage.setItem('notesai_theme', theme);
    }

    const savedTheme = localStorage.getItem('notesai_theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            applyTheme(isDark ? 'light' : 'dark');
            showToast(isDark ? 'Switched to Light Theme' : 'Switched to Dark Theme', 'info');
        });
    }

    // Initialize
    checkApiStatus();
});
