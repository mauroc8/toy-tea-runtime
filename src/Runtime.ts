import { Html } from "./Html"
import { Reconciled, patch, init } from "./private/Reconciliation"

/** Implements a simple [TEA runtime](https://guide.elm-lang.org/architecture/).
 * 
 * The Elm Architecture was popularized by redux. I try to use the same terminology that redux uses
 * except I use `update` instead of `mainReducer` to name my update function.
 * 
 * This function hooks up the runtime. It receives three "callbacks":
 * 
 * - The `init` is just the initial state. It is only used once.
 * - The `render` is the function that, given a `state`, creates the virtual HTML nodes that describe the desired HTML.
 *   These virtual HTML nodes have event listeners that feed the `update` function with actions.
 * - The `update` is the function that, given the current `state` and an `action` (typically, a result of user interaction),
 *   returns the *new* state. This should return a new copy of `state`.
 * 
 * The function returns a `dispatch` callback: a function that asynchronously feeds the `update` with a new action.
 * This is necesary as a callback in network requests, for example.
*/
export function start<State, Action>(
    $root: Element,
    init: State,
    render: (state: State) => Html<Action>,
    update: (state: State, action: Action) => State,
): (action: Action) => void {
    let runtime = initRuntime(init, render, $root, dispatchAsync)

    function dispatchSync(action: Action) {
        try {
            const state = update(runtime.currentState, action)

            /** Update DOM and currentState */
            runtime = updateRuntime(runtime, state, render, dispatchSync)
        } catch (e) {
            console.error(e)
        }
    }

    function dispatchAsync(action: Action) {
        requestAnimationFrame(() => dispatchSync(action))
    }

    return dispatchAsync;
}

/** The state the runtime needs. */
type Runtime<State, Action> = {
    currentState: State,
    dom: Reconciled<Action>,
}

/** Initializes a TEA runtime.
 * (Performs DOM mutations.)
 */
function initRuntime<State, Action>(
    state: State,
    render: (state: State) => Html<Action>,
    $root: Element,
    dispatch: (event: Action) => void,
): Runtime<State, Action> {
    return {
        currentState: state,
        dom: init($root, render(state), dispatch),
    }
}

/** Update the state of the runtime (performing DOM mutations).
 * 
 * Returns a new runtime with the updated states.
*/
function updateRuntime<State, Action>(
    runtime: Runtime<State, Action>,
    state: State,
    render: (state: State) => Html<Action>,
    dispatch: (event: Action) => void,
): Runtime<State, Action> {
    return {
        /* Patch virtual and real DOM */
        dom: runtime.currentState === state
            ? runtime.dom
            : patch(runtime.dom, render(state), dispatch),
        
        /* Update state */
        currentState: state,
    }
}
