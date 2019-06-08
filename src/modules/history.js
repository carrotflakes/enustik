const UNDO = 'enustik/history/UNDO';
const REDO = 'enustik/history/REDO';

export function undo() {
  return {
    type: UNDO
  };
}

export function redo() {
  return {
    type: REDO
  };
}

const history = 'history/history';
const i = 'history/i';

const limit = 100; // TODO

export function undoable(reducer) {
  return (state, action) => {
    switch (action.type) {
      case UNDO:
        if (0 < state[i]) {
          return {
            ...state[history][state[i] - 1],
            [history]: state[history],
            [i]: state[i] - 1
          };
        } else {
          return state;
        }
      case REDO:
        if (state[i] + 1 < state[history].length) {
          return {
            ...state[history][state[i] + 1],
            [history]: state[history],
            [i]: state[i] + 1
          };
        } else {
          return state;
        }
    }

    const postState = reducer(state, action);

    if (!state) {
      // initial state:
      return {
        ...postState,
        [history]: [postState],
        [i]: 0
      };
    } else if (action.UNDOABLE) {
      // push state to history
      return {
        ...postState,
        [history]: [
          ...state[history].slice(0, state[i] + 1),
          {
            ...postState,
            [history]: undefined,
            [i]: undefined
          }
        ],
        [i]: state[i] + 1
      };
    }
    return postState;
  };
}
