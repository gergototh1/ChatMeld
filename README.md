# ChatMeld Multi-LLM Playground

A free, open-source, client-side application for chatting with AI models and watching them interact with each other. Configure AI personalities, pause and edit conversations, and maintain full control over your data. 

The app runs entirely in your browser locally, only communicating directly with AI platforms using your API keys.

## ✨ Features

- **Multi-Model Chat**: Chat with different AI models simultaneously
- **AI-to-AI Conversations**: Watch AI models interact with each other
- **Customizable AI Personalities**: Use presets or create your own agents
- **Full Conversation Control**: Pause, rewind, edit, and remove AI responses
- **Manual Speaker Selection**: Optionally choose who speaks next in the conversation
- **Client-Side Only**: All data stored locally in your browser
- **Direct API Integration**: Use your own API keys to call AI platforms directly (OpenAI or Google AI Studio)

## 🚀 Getting Started

### For Users (No Installation Required)

1. **Visit the App**: Open [ChatMeld](https://balazspiller.github.io/ChatMeld) in your browser
2. **Set Up API Keys**: Go to Settings and add your OpenAI and/or Google AI Studio API keys
3. **Start Chatting**: Create a new conversation and select your AI agents
4. **Explore**: Try different agent personalities and watch AI-to-AI conversations

### For Developers

#### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

#### Setup Steps

1. Clone the repository.
2. Install dependencies.
3. Start development server.
4. Open in browser.

#### Development Guidelines

- Follow the established TypeScript/React/Vite stack
- Maintain the modular folder structure
- Use Zustand for state management
- Use Dexie.js for all IndexedDB operations
- Apply Tailwind CSS for styling
- Ensure all functionality remains client-side only

## 🎮 How to Use

### Setting Up Your First Conversation

1. **Configure API Keys** (Settings → API Keys)
   - Add your OpenAI API key for GPT models
   - Add your Google AI Studio API key for Gemini models

2. **Create a New Conversation**
   - Click "New Conversation" from the dashboard
   - Select 2-4 AI agents from the available presets
   - Give your conversation a title

3. **Start Chatting**
   - Send a message to kick off the conversation
   - Use "Auto Advance" to let AI agents talk to each other
   - Use "Manual Mode" to control who speaks next

### Advanced Features

- **Edit Any Message**: Click the More > Edit button on any message to modify it
- **Custom Agents**: Design AI personalities with specific traits and behaviors
- **Export Data**: Backup your conversations and agent configurations

## Core Concepts

### Agents
AI personalities that can participate in conversations. Each agent has:
- Name and description
- System prompt and behavior settings
- Model configuration (temperature, max tokens, etc.)

### Conversations
Chat sessions between users and AI agents. Features include:
- Multi-participant conversations (2-4 agents)
- Message history with full editing capabilities
- Turn-based speaking order with manual override
- Automatic advancement of conversation flow

## 🔐 Privacy & Data

ChatMeld is designed with privacy in mind:
- **No Server Required**: Everything runs in your browser
- **Local Storage Only**: All data stored using IndexedDB
- **Your API Keys**: Direct integration with AI providers using your keys
- **No Data Collection**: No telemetry or user tracking
- **Export/Import**: Full control over your data

## 🤝 Contributing

Contributions are welcome! Fork the repository and submit a pull request with your changes. Please ensure your code adheres to the project's coding standards.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Balazs Piller. Please star this project on [GitHub](https://github.com/balazspiller/ChatMeld) if you find it useful!

