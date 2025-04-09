import React, { useState, useEffect } from "react";
import { ReactComponent as PlaneIcon } from "styles/Icons/Union.svg";
import { motion } from "framer-motion";
import axios from "axios";
import 'styles/ChatStyles.css';
import BpmnViewer from "processing/BPMNProcessing";
import Header from 'modules/Header';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [bpmnFileUrl, setBpmnFileUrl] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [initialMessagesAdded, setInitialMessagesAdded] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);

  useEffect(() => {
    if (!initialMessagesAdded) {
      setMessages([
        { text: "👋 Hello! I'm Flowify AI, your assistant for visualizing and improving business processes.", sender: "assistant" },
        { text: "✨ Just send me a BPMN file, and I'll describe this process in text and give you feedback", sender: "assistant" },
      ]);
      setInitialMessagesAdded(true);
    }
  }, [initialMessagesAdded]);

  const fetchAIResponse = async (userInput) => {
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "⏳ Processing of your request. It may take a few minutes...", sender: "assistant" },
      ]);

      const response = await axios.post("http://127.0.0.1:5000/describe-bpmn", {
        query: userInput,
      });

      const aiMessage = response.data.response.trim();
      setAiMessage(aiMessage);

      const bpmnXmlString = aiMessage;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "🔧 Generating BPMN diagram...", sender: "assistant" },
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

  const handleBpmnUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("bpmn_file", file);

    try {
      setMessages((prev) => [
        ...prev,
        { text: "📤 Uploading and analyzing BPMN file...", sender: "assistant" }
      ]);

      const response = await axios.post("http://127.0.0.1:5000/describe-bpmn", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const description = response.data.description;

      setMessages((prev) => [
        ...prev,
        { text: "📄 Here's the description of the uploaded BPMN process:", sender: "assistant" },
        { text: description, sender: "assistant" }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "❌ Failed to describe BPMN file.", sender: "assistant" }
      ]);
      console.error("Upload error:", error);
    }
  };

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
        </div>

        <div className="input-container">
  <div className="chat-input">
    <input 
      type="text" 
      placeholder="Enter your request..." 
      disabled={!chatEnabled}
      style={{
        backgroundColor: chatEnabled ? "white" : "#f2f2f2",
        cursor: chatEnabled ? "text" : "not-allowed",
        opacity: chatEnabled ? 1 : 0.6,
        paddingRight: '40px',
        flex: 1,
      }}
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  
    <div className="upload-section">
      <button 
        className="upload_button"
        onClick={() => document.getElementById("bpmn-upload").click()}
      >
        📁 Upload BPMN File
      </button>
      <input
        id="bpmn-upload"
        type="file"
        accept=".bpmn, .xml"
        style={{ display: "none" }}
        onChange={handleBpmnUpload}
      />
    </div>
  </div>
</div>

      </div>
    </motion.div>
    </>
  );
};

export default ChatPage;
