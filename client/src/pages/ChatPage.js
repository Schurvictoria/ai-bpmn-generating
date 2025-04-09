import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as PlaneIcon } from "styles/Icons/Union.svg";
import { motion } from "framer-motion";
import axios from "axios";
import 'styles/ChatStyles.css'
import BpmnViewer from "processing/BPMNProcessing";
import Header from 'modules/Header'

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [bpmnFileUrl, setBpmnFileUrl] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [initialMessagesAdded, setInitialMessagesAdded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!initialMessagesAdded) {
      setMessages([
        { text: "👋 Hello! I'm Flowify AI, your assistant for visualizing and improving business processes.", sender: "assistant" },
        { text: "✨ Just enter a detailed description of your process, and I'll model it and give you feedback", sender: "assistant" },
      ]);
      setInitialMessagesAdded(true);
    }
  }, [initialMessagesAdded]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchAIResponse = async (userInput) => {
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "⏳ Processing of your request. It may take a few minutes...", sender: "assistant" },
      ]);

      const response = await axios.post("http://127.0.0.1:5000/ask", {
        query: userInput,
      });

      const aiMessage = response.data.response.trim();
      setAiMessage(aiMessage);

      const bpmnXmlString = aiMessage;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "🔧 Generating BPMN diagram...", sender: "assistant" },
      ]);

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "📦 Preparing file for download...", sender: "assistant" },
      ]);

      const blob = new Blob([bpmnXmlString], { type: 'application/xml' });
      const fileUrl = URL.createObjectURL(blob);
      setBpmnFileUrl(fileUrl);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "",
          sender: "assistant",
          isBpmn: true,
        },
      ]);
    } catch (error) {
      console.error("Ошибка при получении ответа от AI:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "❌ Something went wrong when creating the BPMN chart. Please try again. Check your internet connection and whether your input relates to the description of the process.",
          sender: "assistant"
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (input.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
      ]);
      setInput("");
      await fetchAIResponse(input);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div>
        <Header />
      </div>

      <motion.div
        className="chat-page"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.sender === "assistant" ? "assistant" : "user"}`}
              >
                {message.text}
                {message.isBpmn && aiMessage && (
                  <div>
                    <BpmnViewer xml={aiMessage} />
                    {bpmnFileUrl && (
                      <a href={bpmnFileUrl} download="diagram.bpmn">
                        Download BPMN File
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Enter your request..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() !== "") {
                  handleSend();
                }
              }}
              disabled={messages.length === 0}
            />
            <button onClick={handleSend} disabled={input.trim() === ""}>
              <PlaneIcon width="24" height="24" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChatPage;
