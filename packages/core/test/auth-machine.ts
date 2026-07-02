import { StateMachine } from "../src/ir/state-machine";

export const authMachine: StateMachine = {
  name: "AuthFlow",

  initialState: "Login",

  states: {
    Login: {
      name: "Login",
      transitions: [
        {
          event: "success",
          target: "MFA",
        },
        {
          event: "fail",
          target: "Error",
        },
      ],
    },

    MFA: {
      name: "MFA",
      transitions: [
        {
          event: "verified",
          target: "Success",
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
