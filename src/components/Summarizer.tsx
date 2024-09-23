import React, { useState, useEffect, useRef } from 'react';
import { CreateMLCEngine } from "@mlc-ai/web-llm";

const Summarizer: React.FC = () => {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const engineRef = useRef<any>(null);

  useEffect(() => {
    initEngine();
  }, []);

  const initEngine = async () => {
    setIsLoading(true);
    setProgress('Initializing Summarizer...');
    
    try {
      engineRef.current = await CreateMLCEngine(
        "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
        {
          initProgressCallback: (p) => {
            setProgress(`Loading model: ${(p.progress * 100).toFixed(2)}%`);
          }
        }
      );
      setProgress('Model loaded successfully!');
    } catch (error) {
      console.error('Error initializing WebLLM engine:', error);
      setProgress('Error loading model. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setSummary('');

    const systemPrompt = {
      role: 'system',
      content: 'You are a JSON summarizer. Given a JSON file containing whatsapp data, provide a concise summary in the following format: { "total_messages": , "total_words": , "total_emojis": }'
    };

    try {
      const response = await engineRef.current.chat.completions.create({
        messages: [
          systemPrompt,
          { role: 'user', content: input }
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const summaryObj = JSON.parse(response.choices[0].message.content);
      setSummary(JSON.stringify(summaryObj, null, 2));
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded h-40 mb-2"
          placeholder="Paste your JSON here..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          Summarize JSON
        </button>
      </form>
      <div className="flex-grow overflow-y-auto p-2 border rounded">
        <h2 className="text-xl font-bold mb-2">Summary:</h2>
        {isLoading ? (
          <div>{progress}</div>
        ) : (
          <pre className="whitespace-pre-wrap">{summary}</pre>
        )}
      </div>
    </div>
  );
};

export default Summarizer;