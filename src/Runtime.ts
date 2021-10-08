import { Html } from "./Html"
import { VirtualDom, patch, replace } from "./VirtualDom"

import * as Date from '../Utils/Date'
import * as Task from "../Utils/Task"
import { Update } from "../Utils/Update"

/** The state the runtime needs. */
type Runtime<State, Event> = {
    currentState: State,
    virtualDom: VirtualDom<Event>,
}

/** The initial state of the runtime. (Performs DOM mutations.) */
function initRuntime<State, Event>(
    state: State,
    view: (state: State) => Html<Event>,
    $root: Element,
    dispatch: (event: Event) => void,
): Runtime<State, Event> {
    if (process.env.NODE_ENV === 'development') {
        (window as any).currentState = state
    }

    return {
        currentState: state,
        virtualDom: replace($root, view(state), dispatch),
    }
}

/** Update the state of the runtime (performing DOM mutations). */
function updateRuntime<State, Event>(
    runtime: Runtime<State, Event>,
    state: State,
    view: (state: State) => Html<Event>,
    dispatch: (event: Event) => void,
): Runtime<State, Event> {
    if (process.env.NODE_ENV === 'development') {
        (window as any).currentState = state
    }

    return {
        /* Patch virtual Dom */
        virtualDom: runtime.currentState === state
            ? runtime.virtualDom
            : patch(runtime.virtualDom, view(state), dispatch),
        
        /* Update state */
        currentState: state,
    }
}

export function startRuntime<State, Event>(
    $root: Element,
    init: Update<State, Event>,
    view: (state: State) => Html<Event>,
    update: (state: State, event: Event, timestamp: Date.Javascript) => Update<State, Event>,
) {
    requestAnimationFrame(() => {
        executeTasks(init.tasks)
    })

    let runtime = initRuntime(init.state, view, $root, dispatchAsync)

    function dispatchSync(event: Event): void {
        try {
            const { state, tasks } = update(runtime.currentState, event, new window.Date())

            /** Update DOM and currentState */
            runtime = updateRuntime(runtime, state, view, dispatchSync)

            /* Execute side effects */
            executeTasks(tasks)
        } catch (e) {
            console.error(e)
        }
    }

    function executeTasks(
        tasks: Array<Task.Task<Event>>,
    ): void {
        for (const task of tasks) {
            task.execute(dispatchAsync)
        }
    }

    function dispatchAsync(event: Event) {
        requestAnimationFrame(() => dispatchSync(event))
    }
}
