import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPlus } from '@fortawesome/free-solid-svg-icons';
import './chatbot.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      setMessages(JSON.parse(savedChatHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    const chatWindow = document.getElementById('chat-history');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message) => {
    const userMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model: 'llama3-8b-8192',
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const botMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className="full-screen-container">
      
      <div className="chat-container mx-auto">
    
        {/* Chatbox Content */}
        <div className="chatbox shadow-lg">
          <div id="chat-history" className="chat-history p-3">
            {messages.length === 0 && !loading && !error && (
              <div className="welcome-message">
                <h2>Welcome to Lean's Co-pilot</h2>
                <p>Type a message to get started</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ))}
            {loading && <div className="loading-indicator"><span>Loading...</span></div>}
            {error && <div className="error-message">{error}</div>}
          </div>
          
          {/* Chat Input Form */}
          <form onSubmit={handleSubmit} className="chat-input-form d-flex">
            <input
              type="text"
              className="chat-input form-control"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary ml-2" disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </button>
            <button onClick={handleNewChat} className="btn btn-outline-primary rounded-circle newChat" 
            style={{
              color: '#5792ff',
              marginLeft: '10px'
            }}
            >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
