import React, { useState, useEffect } from "react";
import { ReactComponent as PlaneIcon } from "../styles/Icons/Union.svg";
import { motion } from "framer-motion";
import axios from "axios";
import '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/styles/ChatStyles.css'
import { renderBpmnToSvg } from '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/processing/BPMNProcessing.js'
import BpmnViewer from "/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/processing/BPMNProcessing.js";
import Header from '/Users/victoriaschur/Desktop/bpm-generating-course-project/client/src/modules/Header.js'

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [bpmnFileUrl, setBpmnFileUrl] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [initialMessagesAdded, setInitialMessagesAdded] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(true);

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
        { text: "⏳ Processing your input...", sender: "assistant" },
      ]);
      //setIsInputDisabled(true);

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
    } finally {
      //setIsInputDisabled(true);
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
      //setIsInputDisabled(true);

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
    } finally {
      //setIsInputDisabled(false);
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

        <div className="upload-section">
          <button className="upload-button" onClick={() => document.getElementById("bpmn-upload").click()}>
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

        <div className="chat-input">
          <input
            type="text"
            placeholder="Enter your request..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ pointerEvents: isInputDisabled ? 'none' : 'auto' }}
          />
        </div>
        <div className="chat-input">
          <button onClick={handleSend} disabled={input.trim() === "" || isInputDisabled}> {/* Отключаем кнопку при блокировке ввода */}
            <PlaneIcon width="24" height="24" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPage;
