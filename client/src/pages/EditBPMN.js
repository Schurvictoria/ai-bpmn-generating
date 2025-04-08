import React, { useState } from "react";
import axios from "axios";
import Header from 'modules/Header';
import BpmnViewer from "processing/BPMNProcessing";
import { motion } from "framer-motion";

const EditPage = () => {
  const [input, setInput] = useState("");
  const [editedXml, setEditedXml] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessages([...messages, { sender: "user", text: input }]);

    try {
      const res = await axios.post("http://127.0.0.1:5000/edit-bpmn", {
        query: input
      });

      const xml = res.data.edited_bpmn;
      setEditedXml(xml);
      setMessages((prev) => [...prev, { sender: "assistant", text: "✅ Here's your optimized process!" }]);

      const blob = new Blob([xml], { type: "application/xml" });
      setFileUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error("Error editing BPMN:", e);
      setMessages((prev) => [...prev, { sender: "assistant", text: "❌ Failed to edit BPMN." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessages((prev) => [...prev, { sender: "assistant", text: "📤 Uploading and improving BPMN..." }]);

    const formData = new FormData();
    formData.append("bpmn_file", file);

    try {
      const res = await axios.post("http://127.0.0.1:5000/edit-bpmn", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const xml = res.data.edited_bpmn;
      setEditedXml(xml);
      const blob = new Blob([xml], { type: "application/xml" });
      setFileUrl(URL.createObjectURL(blob));

      setMessages((prev) => [...prev, { sender: "assistant", text: "✅ BPMN improved successfully!" }]);
    } catch (e) {
      setMessages((prev) => [...prev, { sender: "assistant", text: "❌ Error while improving BPMN." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />
    <motion.div className="chat-page" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.5 }}>
      

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="upload-section">
          <button onClick={() => document.getElementById("file-upload").click()}>
            📁 Upload BPMN File
          </button>
          <input
            id="file-upload"
            type="file"
            accept=".bpmn,.xml"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Describe your process..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleTextSubmit} disabled={!input || loading}>
            🚀
          </button>
        </div>

        {editedXml && (
          <div className="bpmn-view">
            <BpmnViewer xml={editedXml} />
            {fileUrl && (
              <a href={fileUrl} download="edited_diagram.bpmn">📥 Download Edited BPMN</a>
            )}
          </div>
        )}
      </div>
    </motion.div>
    </>
  );
};

export default EditPage;
