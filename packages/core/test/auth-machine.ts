import { StateMachine, stateTarget } from "../src/ir/state-machine";

export const authMachine: StateMachine = {
  name: "AuthFlow",

  initialState: "Login",

  states: {
    Login: {
      name: "Login",
      transitions: [
        {
          event: "success",
          target: stateTarget("MFA"),
        },
        {
          event: "fail",
          target: stateTarget("Error"),
        },
      ],
    },

    MFA: {
      name: "MFA",
      transitions: [
        {
          event: "verified",
          target: stateTarget("Success"),
          guard: "isMfaValid",
          action: "createSession",
        },
      ],
    },

    Success: {
      name: "Success",
      transitions: [],
    },

    Error: {
      name: "Error",
      transitions: [],
    },
  },
};
