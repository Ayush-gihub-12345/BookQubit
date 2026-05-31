"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaSpinner, FaRobot, FaUser } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";

const BookQubit_AI = () => {
  const { theme, themeName } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello 👋

BookQubit AI | Your Intelligent Reading Assistant

Status: Under Development 🚧

How can I help you today?`,
      sender: "ai",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: `BookQubit AI Response:

I am currently under development, but here's a helpful insight related to your query:

"${userMessage.text}" is an interesting topic in reading and learning.

More intelligent features coming soon 🚀`,
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dynamic styles based on theme
  const getBgColor = () => {
    if (isDarkMode) return "bg-gray-900";
    return theme.background?.section || "bg-white";
  };

  const getHeaderBg = () => {
    if (isDarkMode) return "bg-gray-800";
    return theme.background?.navigationDots || "bg-gray-50";
  };

  const getInputBg = () => {
    if (isDarkMode) return "bg-gray-700";
    return "bg-gray-100";
  };

  const getMessageBg = (sender) => {
    if (sender === "user") {
      return theme.buttonColors?.primaryButton?.background || "bg-blue-600";
    }
    if (isDarkMode) return "bg-gray-800";
    return "bg-gray-100";
  };

  const getMessageTextColor = (sender) => {
    if (sender === "user") return "text-white";
    if (isDarkMode) return "text-white";
    return "text-gray-900";
  };

  const getBorderColor = () => {
    if (isDarkMode) return "border-gray-700";
    return theme.border?.default || "border-gray-200";
  };

  const styles = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse-custom {
      animation: pulse 2s infinite;
    }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .animate-bounce-custom {
      animation: bounce 1.4s infinite ease-in-out;
    }
    .animate-bounce-custom-delay-1 { animation-delay: -0.32s; }
    .animate-bounce-custom-delay-2 { animation-delay: -0.16s; }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-custom {
      animation: spin 1s linear infinite;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease;
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className={`min-h-screen flex items-center justify-center p-8 ${getBgColor()}`}>
        <div className={`w-full max-w-4xl h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-lg ${getBgColor()} ${isDarkMode ? 'dark:shadow-2xl' : ''}`}>
          {/* Header */}
          <div className={`px-8 py-6 flex items-center justify-between border-b ${getBorderColor()} ${getHeaderBg()}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center text-2xl`}>
                <FaRobot className={theme.textColors?.highlight || "text-blue-600"} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${theme.textColors?.primary || "text-gray-900 dark:text-white"}`}>
                  BookQubit AI
                </h2>
                <p className={`flex items-center gap-2 text-sm ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse-custom"></span>
                  Under Development
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <span className={`text-sm font-semibold ${theme.textColors?.highlight || "text-blue-600"}`}>
                v0.1.0
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-8 space-y-6 ${getBgColor()}`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 items-start animate-fadeIn ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.sender === "ai" && (
                  <div className={`w-9 h-9 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                    <FaRobot className={theme.textColors?.highlight || "text-blue-600"} />
                  </div>
                )}
                <div
                  className={`relative max-w-[70%] p-5 rounded-2xl shadow-sm ${
                    msg.sender === "user"
                      ? `${getMessageBg("user")} ${getMessageTextColor("user")} rounded-br-none`
                      : `${getMessageBg("ai")} ${getMessageTextColor("ai")} rounded-bl-none`
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed m-0">
                    {msg.text}
                  </pre>
                  <span
                    className={`absolute bottom-[-1.2rem] text-xs opacity-70 ${
                      msg.sender === "user" ? "left-2" : "right-2"
                    } ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
                  >
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {msg.sender === "user" && (
                  <div className={`w-9 h-9 rounded-full ${theme.buttonColors?.primaryButton?.background || "bg-blue-600"} flex items-center justify-center flex-shrink-0`}>
                    <FaUser className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 items-start animate-fadeIn">
                <div className={`w-9 h-9 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                  <FaRobot className={theme.textColors?.highlight || "text-blue-600"} />
                </div>
                <div className={`p-5 rounded-2xl ${getMessageBg("ai")} rounded-bl-none`}>
                  <div className="flex gap-2 py-1">
                    <span className={`w-2 h-2 ${theme.textColors?.highlight || "bg-blue-600"} rounded-full animate-bounce-custom animate-bounce-custom-delay-1`}></span>
                    <span className={`w-2 h-2 ${theme.textColors?.highlight || "bg-blue-600"} rounded-full animate-bounce-custom animate-bounce-custom-delay-2`}></span>
                    <span className={`w-2 h-2 ${theme.textColors?.highlight || "bg-blue-600"} rounded-full animate-bounce-custom`}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className={`px-8 py-6 border-t ${getBorderColor()} ${getHeaderBg()}`}>
            <div className={`flex items-center gap-4 p-2 rounded-full ${getInputBg()} focus-within:ring-3 focus-within:ring-blue-300`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message BookQubit AI..."
                className={`flex-1 px-5 py-3 bg-transparent text-sm resize-none max-h-30 outline-none ${theme.textColors?.primary || "text-gray-900 dark:text-white"} placeholder-gray-400 dark:placeholder-gray-500`}
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-11 h-11 rounded-full ${theme.buttonColors?.primaryButton?.background || "bg-blue-600"} hover:${theme.buttonColors?.primaryButton?.hoverBackground || "bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 mr-1`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin-custom" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
            <p className={`text-right text-xs opacity-70 mt-3 ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}>
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>

          {/* Footer */}
          <div className={`px-8 py-4 text-center text-sm border-t opacity-70 ${getBorderColor()} ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}>
            <span>
              BookQubit AI is in development • Responses are simulated
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookQubit_AI;