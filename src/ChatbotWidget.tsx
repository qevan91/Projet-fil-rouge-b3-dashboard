import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, ShieldCheck } from 'lucide-react';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
        { sender: 'bot', text: "Bonjour ! Je suis Resili-IA. Une vague de chaleur approche, avez-vous besoin que je contacte des prestataires pour des brumisateurs ?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userText = input;
        setMessages(prev => [...prev, { sender: 'user', text: userText }]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: userText })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: "Erreur de connexion au serveur IA." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {isOpen && (
                <div className="bg-slate-900 border border-slate-700 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
                    <div className="bg-indigo-600 p-4 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-2 text-white">
                            <ShieldCheck size={20} className="text-teal-300" />
                            <div>
                                <h3 className="font-bold leading-tight">Resili-IA</h3>
                                <p className="text-[10px] text-indigo-200">Propulsé par Mistral AI</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
                        {messages.map((msg, idx) => (
                            <div key={idx}
                                 className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap ${
                                    msg.sender === 'user'
                                        ? 'bg-indigo-500 text-white rounded-br-sm'
                                        : 'bg-slate-700 text-slate-100 rounded-bl-sm border border-slate-600'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-sm text-slate-400">
                                <Loader2 size={16} className="animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-slate-900 border-t border-slate-700 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Demander un plan d'action..."
                            className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-4 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}