import React, { useState, useEffect, useRef } from 'react';
import { CreateMLCEngine } from "@mlc-ai/web-llm";

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const engineRef = useRef<any>(null);

    useEffect(() => {
        initEngine();
    }, []);

    const initEngine = async () => {
        setIsLoading(true);
        setProgress('Initializing WebLLM engine...');

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

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await engineRef.current.chat.completions.create({
                messages: [...messages, userMessage],
                temperature: 0.7,
                max_tokens: 800,
            });

            const assistantMessage = response.choices[0].message;
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error generating response:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                            {msg.content}
                        </span>
                    </div>
                ))}
                {isLoading && <div className="text-center">{progress}</div>}
            </div>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="Type your message..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isLoading}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
