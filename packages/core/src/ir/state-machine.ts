export interface StateTransitionTarget {
  kind: "state";
  stateName: string;
}

export interface FinalTransitionTarget {
  kind: "final";
}

export type TransitionTarget = StateTransitionTarget | FinalTransitionTarget;

export interface Transition {
  event: string;
  target: TransitionTarget;

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

export function stateTarget(stateName: string): StateTransitionTarget {
  return {
    kind: "state",
    stateName,
  };
}

export function finalTarget(): FinalTransitionTarget {
  return {
    kind: "final",
  };
}

export function isFinalTarget(
  target: TransitionTarget,
): target is FinalTransitionTarget {
  return target.kind === "final";
}

export function formatTarget(target: TransitionTarget): string {
  return isFinalTarget(target) ? "[*]" : target.stateName;
}
