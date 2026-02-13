const Groq = require("groq-sdk");
const { COMPONENT_WHITELIST } = require("../schema");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Prompt Logic
const getPlannerPrompt = (userPrompt, currentCode, isEdit) => isEdit 
  ? `You are a UI Architect. The user wants to MODIFY this existing React code:
    ---
    ${currentCode}
    ---
    NEW INTENT: "${userPrompt}"
    
    TASK: Update the structural JSON layout plan. 
    1. KEEP all existing components that weren't specifically asked to be removed.
    2. Add/Remove/Modify ONLY what is requested.
    3. Use ONLY whitelist: ${JSON.stringify(COMPONENT_WHITELIST)}.`
  : `You are a UI Architect. Create a NEW JSON layout plan for: "${userPrompt}". Use ONLY: ${JSON.stringify(COMPONENT_WHITELIST)}.`;

const getGeneratorPrompt = (plan, currentCode, isEdit) => `
  Task: Convert this JSON plan into a React 'App' component string: ${JSON.stringify(plan)}. 
  
  CONTEXT:
  ${isEdit ? `BASE CODE TO MODIFY: \n${currentCode}` : "This is a new generation."}
  
  STRICT RULES:
  1. SURGICAL EDIT: Modify the existing 'App' component. Do NOT delete existing logic unless requested.
  2. NO REDEFINITIONS: Do NOT define 'Navbar', 'Button', etc. They are global.
  3. Define ONLY: const App = () => { ... };
  4. LAST LINE: render(<App />);
  5. OUTPUT: Raw code only. No markdown. No explanations.
  6. For colors, use the 'variant' prop on components.
  7. Button variants: "primary" (blue), "secondary" (gray), "danger" (red), "success" (green).
  8. If a user asks for "red", use variant="danger". `;

// Safety & Validation Requirement
const cleanCode = (code) => {
  return code
    .replace(/```jsx|```javascript|```/g, "") 
    .split('\n')
    .filter(line => !line.includes('const') || line.includes('const App')) // Strip illegal definitions
    .join('\n')
    .trim();
};

async function runGeminiFlow(userPrompt, currentCode, isEdit) {
  const jsonModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", generationConfig: { responseMimeType: "application/json" } });
  const textModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const planResult = await jsonModel.generateContent(getPlannerPrompt(userPrompt, currentCode, isEdit));
  const plan = JSON.parse(planResult.response.text());

  const codeResult = await textModel.generateContent(getGeneratorPrompt(plan, currentCode, isEdit));
  const generatedCode = cleanCode(codeResult.response.text());

  const explanation = (await textModel.generateContent(`Explain why you made these specific changes for: ${userPrompt}`)).response.text();
  return { plan, generatedCode, explanation };
}

async function runGroqFlow(userPrompt, currentCode, isEdit) {
  const plannerResult = await groq.chat.completions.create({
    messages: [{ role: "user", content: getPlannerPrompt(userPrompt, currentCode, isEdit) }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }
  });
  const plan = JSON.parse(plannerResult.choices[0].message.content);

  const generatorResult = await groq.chat.completions.create({
    messages: [{ role: "user", content: getGeneratorPrompt(plan, currentCode, isEdit) }],
    model: "llama-3.3-70b-versatile",
  });
  const generatedCode = cleanCode(generatorResult.choices[0].message.content);

  const explanation = `I updated the UI components to match your request: ${userPrompt}.`;
  return { plan, generatedCode, explanation };
}

// Orchestrator
async function runAgentFlow(userPrompt, currentCode = "") {
  const isEdit = currentCode && currentCode.trim().length > 100; 

  try {
    return await runGeminiFlow(userPrompt, currentCode, isEdit);
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("quota")) {
      return await runGroqFlow(userPrompt, currentCode, isEdit);
    }
    throw error;
  }
}

module.exports = { runAgentFlow };