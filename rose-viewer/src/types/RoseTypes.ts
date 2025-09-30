export interface RoseObject {
  type: string;
  name?: string;
  properties: Record<string, any>;
  children: RoseObject[];
}

export interface RoseClass {
  name: string;
  quid: string;
  documentation?: string;
  attributes: RoseAttribute[];
  operations: RoseOperation[];
  superclasses: RoseInheritance[];
  classAttributes: RoseClassAttribute[];
  language?: string;
}

export interface RoseAttribute {
  tool: string;
  name: string;
  value: string;
}

export interface RoseOperation {
  name: string;
  quid: string;
  documentation?: string;
  parameters: RoseParameter[];
  result?: string;
  concurrency?: string;
  opExportControl?: string;
  uid?: number;
  attributes: RoseAttribute[];
}

export interface RoseParameter {
  name: string;
  type: string;
}

export interface RoseInheritance {
  quid: string;
  supplier: string;
  quidu: string;
}

export interface RoseClassAttribute {
  name: string;
  quid: string;
  type: string;
}

export interface RoseDiagram {
  title: string;
  quid: string;
  zoom: number;
  items: RoseDiagramItem[];
}

export interface RoseDiagramItem {
  type: string;
  location: [number, number];
  label: string;
  quidu?: string;
  width?: number;
  height?: number;
}