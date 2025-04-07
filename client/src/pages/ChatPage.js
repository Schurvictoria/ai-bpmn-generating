import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!initialMessagesAdded) {
      setMessages([
        { text: "👋 Hello! I'm Flowify AI, your assistant for visualizing and improving business processes.", sender: "assistant" },
        { text: "✨ Just enter a detailed description of your process, and I'll model it and give you feedback", sender: "assistant" },
      ]);
      setInitialMessagesAdded(true);
    }
  }, [initialMessagesAdded]);

  const fetchAIResponse = async (userInput) => {
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "⏳ Processing your input...", sender: "assistant" },
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
        { text: "❌ Something went wrong while generating the BPMN diagram. Please try again.", sender: "assistant" },
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

  return (
    <motion.div
      className="chat-page"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <Header />
      </div>
      {/* <div className = "chat-text"><h2>Chat with Flowify AI</h2></div> */}
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
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Enter your request..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={messages.length === 0}
          />
        </div>
        <div className="chat-input">
          <button onClick={handleSend} disabled={input.trim() === ""}>
            <PlaneIcon width="24" height="24" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;