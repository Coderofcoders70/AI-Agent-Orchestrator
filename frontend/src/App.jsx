import axios from 'axios';
import { useState, useEffect } from 'react'; 
import { MessageSquare, Code, Play, RotateCcw, Download, Copy, Trash2 } from 'lucide-react';
import { LiveProvider, LivePreview, LiveError } from 'react-live';
import Editor from '@monaco-editor/react'; 
import * as Library from './components/Library';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [generatedCode, setGeneratedCode] = useState(`
    const App = () => (
      <Container>
        <Navbar title="Welcome to Ryze AI" />
        <div className="p-10 text-center border-2 border-dashed rounded-xl mt-4 text-gray-400">
          Your generated UI will appear here. Describe something in the chat to begin!
        </div>
      </Container>
    );
    render(<App />);
  `);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load history on initial mount 
  useEffect(() => {
    fetchHistory();
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/versions`);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleRollback = (version) => {
    setGeneratedCode(version.generatedCode);
    setExplanation(`Rolled back to version from ${new Date(version.timestamp).toLocaleString()}`);
  };

  const handleGenerate = async () => { 
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/generate`, {
        prompt,
        currentCode: generatedCode 
      });
      setGeneratedCode(data.generatedCode);
      setExplanation(data.explanation);
      fetchHistory(); 
      setPrompt(''); 
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Generation failed!";
      if (errorMessage.includes("limit")) {
        alert("⚠️ Rate limit reached! Please wait 60 seconds before your next generation.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      try {
        setHistory([]);
        setExplanation('');
        setPrompt('');
        
        setGeneratedCode(`const App = () => (<Container><Navbar title="Ryze AI" /></Container>); render(<App />);`);
      } catch (err) {
        console.error("Failed to clear history", err);
      }
    }
  };

  const handleDeleteVersion = async (id, e) => {
    e.stopPropagation(); 

    if (window.confirm("Delete this version permanently?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/versions/${id}`);
        fetchHistory(); 
      } catch (err) {
        alert("Failed to delete version", err);
      }
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;

    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `ryze-component-${Date.now()}.jsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedCode) return;

    navigator.clipboard.writeText(generatedCode)
      .then(() => {
        alert("Code copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  };

  const latestHistory = history.slice(0, 4);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Left Panel: Chat & History */}
      <div className="w-1/3 flex flex-col border-r bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2 font-bold text-blue-600">
          <MessageSquare size={20} /> Ryze AI Agent
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {explanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 italic text-sm">
              <p className="font-semibold mb-1 text-blue-800">AI Reasoning:</p>
              {explanation}
            </div>
          )}

          {/* History / Rollback Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <RotateCcw size={14} /> Recent Versions
              </h3>
              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2">
              {latestHistory.map((v, i) => (
                <div className="relative group"> 
                  <button
                    onClick={() => handleRollback(v)}
                    className="w-full text-left p-3 text-xs rounded-lg hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all truncate shadow-sm bg-white"
                  >
                    <div className="font-bold text-blue-600 mb-1 flex justify-between">
                      <span>Version {history.length - i}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-gray-500 italic pr-6">"{v.prompt}"</div>
                  </button>

                  <button
                    onClick={(e) => handleDeleteVersion(v._id, e)}
                    className="absolute mt-2 right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 invisible group-hover:visible transition-all"
                    title="Delete version"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {history.length > 4 && (
                <div className="text-center text-[10px] text-gray-400 italic">
                  + {history.length - 4} older versions hidden
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
            rows="3"
            placeholder="Describe your UI or modification..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Thinking..." : "Generate / Update UI"}
          </button>
        </div>
      </div>

      {/* Right Panel: Code & Preview */}
      <div className="flex-1 flex flex-col">
        {/* Code Editor (Editable)  */}
        <div className="h-1/2 p-4">
          <div className="bg-white rounded-xl shadow-lg h-full flex flex-col border overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Code size={14} /> Generated Code
              </span>
              <div className="flex gap-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] font-bold text-gray-300 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <Copy size={12} /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors"
                >
                  <Download size={12} /> Download .jsx
                </button>
              </div>
            </div>
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              value={generatedCode}
              onChange={(value) => setGeneratedCode(value || '')}
              options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 10 } }}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="h-1/2 p-4 pt-0">
          <div className="bg-white rounded-xl shadow-lg h-full flex flex-col border overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Play size={14} /> Live Preview
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <LiveProvider code={generatedCode} scope={Library} noInline={true}>
                <LivePreview />
                <LiveError className="text-red-500 bg-red-50 p-3 text-xs mt-2 rounded border border-red-200" />
              </LiveProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;