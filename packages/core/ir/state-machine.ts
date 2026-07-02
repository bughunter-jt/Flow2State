export interface Transition {
  event: string;
  target: string;

  guard?: string;
  action?: string;
}

export interface StateNode {
  name: string;

  transitions: Transition[];
}

export interface StateMachine {
  name: string;
  initialState: string;

  states: Record<string, StateNode>;
}
