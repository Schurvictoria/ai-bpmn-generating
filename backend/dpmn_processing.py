from bpmn_python.bpmn_diagram_rep import BpmnDiagramGraph
import xml.etree.ElementTree as ET

# Общая функция для создания BPMN диаграммы из строки XML
def parse_bpmn_xml_from_string(xml_string):
    root = ET.fromstring(xml_string)  # Парсим XML-строку

    bpmn_diagram = BpmnDiagramGraph()

    # Обработка каждого элемента и добавление в BPMN диаграмму
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

# Функция для получения BPMN в виде строки XML
def bpmn_xml_to_string(xml_string):
    bpmn_diagram = parse_bpmn_xml_from_string(xml_string)
    return bpmn_diagram.to_xml()

# Функция для визуализации BPMN
def visual_bpmn(xml_string):
    bpmn_diagram = parse_bpmn_xml_from_string(xml_string)
    bpmn_diagram.visualize()

# Функция для создания и визуализации BPMN (для дополнительных обработок, если нужно)
def bpmn_(xml_string):
    bpmn_diagram = parse_bpmn_xml_from_string(xml_string)
    bpmn_diagram.visualize()
