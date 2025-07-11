'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Enhanced markdown parser for headings, basic formatting, links, phone numbers, and emails
const parseMarkdown = (text: string) => {
    return text
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-2">$1</h1>')
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<button onclick="window.open(\'$2\', \'_blank\')" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mt-2 mr-2">$1 <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11M15 3H21V9M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>')
        .replace(/(\+\d{12,15})/g, '<span class="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-sm">$1 <button onclick="navigator.clipboard.writeText(\'$1\'); this.innerHTML=\'✓\'; setTimeout(()=>this.innerHTML=\'📋\',1000)" class="text-green-600 hover:text-green-800 transition-colors" title="Copy number">📋</button></span>')
        .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">$1 <button onclick="navigator.clipboard.writeText(\'$1\'); this.innerHTML=\'✓\'; setTimeout(()=>this.innerHTML=\'📋\',1000)" class="text-blue-600 hover:text-blue-800 transition-colors" title="Copy email">📋</button></span>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hello! Welcome to Zawa Solar Energy. I can help you with:\n• Product information (solar panels, specifications)\n• Contact details (WhatsApp, email, phone)\n• Company information\n• Office location\n\nWhat would you like to know?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.reply || 'Sorry, I couldn\'t process your request.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = ['Show all products', 'WhatsApp number', 'Office location'];

    return (
        <>
            {/* Chat Button */}
            <div className="fixed bottom-0 right-4 mb-4 z-50 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-muted text-foreground rounded-full p-4 shadow-lg hover:bg-muted/80 transition-all duration-300 border relative"
                    aria-label="Open chat"
                >
                    <div className="relative">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="transition-transform group-hover:scale-110"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.35 17L2 22L7 20.65C8.45 21.5 10.15 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8 11H16V13H8V11ZM8 7H16V9H8V7ZM8 15H13V17H8V15Z"
                                fill="currentColor"
                            />
                        </svg>
                        {!isOpen && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </div>
                </button>
                {/* Hover Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                        Chat with AI
                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-foreground"></div>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 animate-slideUp">
                    {/* Header */}
                    <div className="bg-muted/40 text-foreground p-4 rounded-t-lg flex justify-between items-center border-b">
                        <div>
                            <h3 className="font-semibold text-lg">Zawa Solar Energy</h3>
                            <p className="text-sm opacity-90">Your Solar Solution Expert</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:bg-muted/20 rounded-full p-2 transition-colors"
                            aria-label="Close chat"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                        ? 'bg-muted text-foreground rounded-br-none border'
                                        : 'bg-background text-foreground shadow-sm rounded-bl-none border'
                                        }`}
                                >
                                    <p 
                                        className="text-sm whitespace-pre-wrap" 
                                        dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                                    />
                                    <p className="text-xs mt-1 opacity-70">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-fadeIn">
                                <div className="bg-background p-3 rounded-lg shadow-sm border rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-3 border-t bg-background">
                        <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInput(action)}
                                    className="text-xs bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-all duration-200"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-background rounded-b-lg">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-muted bg-background"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
