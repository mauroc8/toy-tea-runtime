import { start } from '../src/Runtime'

import { Html, node, text, property, attribute, style, Attribute, on } from '../src/Html'

function $throw(x: any): never {
  throw x
}

const dispatch = start(
  document.querySelector("#root") || $throw("No #root node"),
  init(),
  view,
  update,
)

// --- STATE

type State = {
  newTaskInput: string,
  tasks: Task[]
}

type Task = {
  id: number,
  description: string,
  done: boolean,
}

function task(id: number, description: string): Task {
  return { id, description, done: false }
}

function init(): State {
  return {
    newTaskInput: '',
    tasks: [],
  }
}

// --- UPDATE

type Action =
  | { tag: "onNewTaskInput", value: string }
  | { tag: "createTask", description: string }
  | { tag: "toggleTaskStatus", id: number }
  | { tag: "editTaskDescription", id: number, description: string }
  | { tag: "deleteTask", id: number }

function update(state: State, action: Action): State {
  switch (action.tag) {
    case "onNewTaskInput":
      return { ...state, newTaskInput: action.value }
    case "createTask":
      const id = (new Date()).getUTCMilliseconds()
      return {
        ...state,
        newTaskInput: '',
        tasks: [task(id, action.description), ...state.tasks]
      }
    case "toggleTaskStatus":
      return { ...state, tasks: toggleTaskStatus(action.id, state.tasks) }
    case "editTaskDescription":
      return { ...state, tasks: editTaskDescription(action.id, action.description, state.tasks) }
    case "deleteTask":
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.id) }
  }
}

function toggleTaskStatus(id: number, tasks: Task[]): Task[] {
  return tasks.map(task =>
    task.id === id
      ? { ...task, done: !task.done }
      : task
  )
}

function editTaskDescription(id: number, description: string, tasks: Task[]): Task[] {
  return tasks.map(task =>
    task.id === id
      ? { ...task, description }
      : task
  )
}

// --- VIEW

function view(state: State): Html<Action> {
  return node(
    'div',
    [
      style('font-family', 'sans-serif'),
      style('max-width', '800px'),
      style('margin', '20px auto'),
    ],
    [
      node('h1', [], [text('To Do List')]),
      node('p', [], [node('i', [], [text('Toy Virtual DOM example')])]),
      viewNewTaskInput(state.newTaskInput),
      viewTasks(state.tasks),
    ]
  )
}

function viewNewTaskInput(newTaskInput: string): Html<Action> {
  return flexRow(
    [],
    [
      inputWithLabelAbove({
        id: 'newTaskInput',
        label: text('Create a new task: '),
        inputValue: newTaskInput,
        onChange: value => ({ tag: 'onNewTaskInput', value })
      }),
      button(
        { tag: 'createTask', description: newTaskInput },
        [],
        [text('Create')]
      )
    ]
  )
}

function viewTasks(tasks: Task[]): Html<Action> {
  return node(
    'div',
    [],
    tasks.map(viewTask),
  )
}

function viewTask(task: Task): Html<Action> {
  return flexRow(
    [
      style('margin', '10px 0'),
      style('gap', '10px'),
      style('align-items', 'baseline')
    ],
    [
      statusCheckbox(task.id, task.done),
      descriptionInput(task),
      task.done ? deleteButton(task.id) : text(''),
    ]
  )
}

function statusCheckbox(id: number, done: boolean): Html<Action> {
  return node(
    'input',
    [
      property('type', 'checkbox'),
      on('change', _ => ({ tag: "toggleTaskStatus", id })),
      attribute('aria-label', 'Is done'),
      property('checked', done),
    ],
    []
  )
}

function descriptionInput(task: Task): Html<Action> {
  return task.done
    ? node(
      'div',
      [style('text-decoration', 'line-through')],
      [text(task.description)]
    )
    : inputWithLabelAbove({
      id: `task_${task.id}_description`,
      label: node('div', [style('display', 'none')], [text('Change task description')]),
      inputValue: task.description,
      onChange: value => ({ tag: 'editTaskDescription', id: task.id, description: value })
  })
}

function deleteButton(id: number): Html<Action> {
  return button(
    { tag: 'deleteTask', id },
    [],
    [text('Delete')]
  )
}


// --- HELPERS

function flexRow<Action>(attrs: Attribute<Action>[], children: Html<Action>[]): Html<Action> {
  return node('div', [style('display', 'flex'), style('flex-direction', 'row'), ...attrs], children)
}

function button<Action>(
  onClick: Action,
  attrs: Attribute<Action>[],
  children: Html<Action>[],
): Html<Action> {
  return node('button', [on('click', _ => onClick), ...attrs], children)
}

function inputWithLabelAbove<Action>(
  args: {
    type?: string,
    id: string,
    labelAttributes?: Attribute<Action>[],
    label: Html<Action>,
    inputAttributes?: Attribute<Action>[],
    inputValue: string,
    onChange: (value: string) => Action,
  }
): Html<Action> {
  return node(
    'label',
    [
      property('id', args.id),
      ...(args.labelAttributes || []),
    ],
    [
      args.label,
      node(
        'input',
        [
          property('type', args.type || 'text'),
          property('value', args.inputValue),
          on('change', evt => args.onChange((evt.target as any).value)),
          ...(args.inputAttributes || []),
        ],
        []
      )
    ]
  )
}
