export interface MermaidTransitionAstNode {
  from: string;
  to: string;
  event?: string;
  line: number;
}

export interface MermaidStateDiagramAst {
  diagramType: "stateDiagram" | "stateDiagram-v2";
  transitions: MermaidTransitionAstNode[];
}
