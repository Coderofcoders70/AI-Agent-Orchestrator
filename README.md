# AI-Agent-Orchestrator
A production-ready AI agent workspace that converts natural language intent into functional, deterministic React code using a multi-agent orchestration layer.

🚀 Links
Live Application: https://ai-agent-orchestrator-nine.vercel.app/

Backend Live Link: https://ai-agent-orchestrator-i9dz.onrender.com

🏗️ Architecture Overview
The system is built on a MERN stack (MongoDB, Express, React, Node.js) with a specialized Multi-Agent AI Orchestration layer.

The AI Pipeline
To ensure reliability and accuracy, every user prompt passes through a three-stage sequential pipeline:

The Planner: Analyzes user intent and current code context to produce a structured JSON layout plan.

The Generator: Converts the JSON plan into valid React code, performing "surgical edits" on the existing codebase to ensure incremental updates rather than full rewrites.

The Explainer: Provides a natural language summary of the changes made, ensuring transparency and trust.

Resilience & Failover
The application implements a Dual-API Failover Strategy. If the primary model (Gemini 1.5 Flash) encounters rate limits (429 errors), the system automatically switches to Llama-3.3-70b (via Groq) to maintain uninterrupted service.

🧠 Agent Design & Prompts
The agents are designed to be Context-Aware and Deterministic.

Surgical Editing: Unlike standard LLM chat, our Generator agent is explicitly instructed to modify the existing App component. It uses the currentCode as a base to ensure components are preserved unless removal is requested.

Prompt Engineering: We utilize strict system instructions to enforce component whitelist compliance and prevent the AI from generating custom CSS or unauthorized imports.

🧩 Component System Design
The application uses a Deterministic UI System. The AI is forbidden from writing component implementations; it can only compose them using a fixed library.

Fixed Library: A suite of Tailwind-styled components (Navbar, Sidebar, Card, Table, Button, etc.) is defined in Library.jsx.

Prop-Driven Styling: Visual changes (like color or size) are handled via pre-defined variant props (e.g., variant="danger" for red buttons).

Safety Sandbox: The frontend uses react-live to render code in a isolated scope, with a backend Regex Cleaner that strips unauthorized const redefinitions.

📜 Features
Incremental Edits: Modify specific UI elements without losing previous progress.

Version History & Rollback: View recent versions and instantly revert to any previous state.

Export Options: One-click Download .jsx and Copy to Clipboard for seamless developer handoff.

Live Preview: Real-time rendering with integrated error handling for invalid AI outputs.

⚠️ Known Limitations
Rate Limits: On the Free Tier, rapid sequential prompts may trigger API cooldowns.

Complex Logic: The AI is optimized for UI layout and composition; it may struggle with complex state-driven business logic within the generated component.

Viewport Handling: While components are responsive, complex multi-column layouts are optimized for desktop viewing.

🛠️ Future Improvements
With more time, I would implement:

Diff View: A visual comparison between the current code and the proposed AI changes.

Custom Component Creation: A tool for the user to define their own components for the AI to reuse.

Project Persistence: The ability for users to save multiple separate projects to their account.

Drag-and-Drop: Merging AI generation with manual positioning for a true "Low-Code" experience.
