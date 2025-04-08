from bpmn_python.bpmn_diagram_rep import BpmnDiagramGraph
import xml.etree.ElementTree as ET

def parse_bpmn_xml_from_string(xml_string):
    root = ET.fromstring(xml_string)
    bpmn_diagram = BpmnDiagramGraph()

    for elem in root.iter():
        if elem.tag.endswith("startEvent"):
            bpmn_diagram.add_start_event(elem.attrib['id'])
        elif elem.tag.endswith("endEvent"):
            bpmn_diagram.add_end_event(elem.attrib['id'])
        elif elem.tag.endswith("userTask"):
            bpmn_diagram.add_task(elem.attrib['id'], elem.attrib['name'])
        elif elem.tag.endswith("sequenceFlow"):
            bpmn_diagram.add_sequence_flow(
                elem.attrib['id'],
                elem.attrib['sourceRef'],
                elem.attrib['targetRef']
            )

    return bpmn_diagram

def bpmn_xml_to_string(xml_string):
    bpmn_diagram = parse_bpmn_xml_from_string(xml_string)
    return bpmn_diagram.to_xml()

def visual_bpmn(xml_string):
    bpmn_diagram = parse_bpmn_xml_from_string(xml_string)
    bpmn_diagram.visualize()

def bpmn_(xml_string):
    bpmn_diagram = parse_bpmn_xml_from_string(xml_string)
    bpmn_diagram.visualize()
