import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatWidget.css'; // We'll create this for specific animations/layout

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you today?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            // Replace with your actual API endpoint
            const response = await axios.post('http://localhost:5000/api/chat', {
                message: input
            }, { withCredentials: true });

            const botResponse = {
                id: Date.now() + 1,
                text: response.data.reply || "I received your message.",
                sender: "bot"
            };
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            const errorResponse = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting right now. Please Contact Customer Support",
                sender: "bot",
                isError: true
            };
            setMessages(prev => [...prev, errorResponse]);
            console.error("Chat API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-widget-container">
            {isOpen && (
                <div className="chat-window stop-propagation">
                    <div className="chat-header">
                        <h3>Support Chat</h3>
                        <button className="close-btn" onClick={toggleChat}>&times;</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                <div className="message-content">{msg.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message bot loading">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={loading}
                        />
                        <button type="submit" disabled={!input.trim() || loading}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            <button className={`chat-toggle-btn ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
                {isOpen ? (
                    <span style={{ fontSize: '24px' }}>&times;</span>
                ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
