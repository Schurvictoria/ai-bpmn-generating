import React, { useEffect, useRef } from "react";
import BpmnJS from "bpmn-js";

const BpmnViewer = ({ xml }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!xml) return;

    const bpmnViewer = new BpmnJS({
      container: containerRef.current,
    });

    bpmnViewer.importXML(xml)
      .then(() => {
        const canvas = bpmnViewer.get("canvas");
        canvas.zoom("fit-viewport");
      })
      .catch((err) => {
        console.error("Ошибка при импорте BPMN:", err);
      });

    return () => {
      bpmnViewer.destroy();
    };
  }, [xml]);

  return (
    <div>
      {/* <h3>BPMN Diagram</h3> */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "500px"}}
      />
    </div>
  );
};

export default BpmnViewer;
