
# Toy TEA Runtime (virtual DOM with event loop)

> The **demo** is just a really ugly [To Do List app](https://mauroc8.github.io/toy-tea-runtime).

Many frontend frameworks, like React, Elm (language) and Vue, use a **virtual DOM**, a technical breakthrough to describe HTML declaratively that also has implications in the architecture of the app.

This repository was born out of the curiosity of how a [Virtual DOM Reconciliation and Diffing Algorithm](https://hackernoon.com/virtual-dom-reconciliation-and-diffing-algorithm-explained-simply-ycn34gr) works.

I made a toy implementation, hooked up with the simplest event loop I can think of, all heavily inspired by [Elm](https://elm-lang.org/).

The code is heavily inspired by Elm, especially [The Elm Architecture runtime](https://guide.elm-lang.org/architecture/) and
[Elm's HTML package](https://package.elm-lang.org/packages/elm/html/latest/). The Elm Architecture refers to the idea,
popularized by React/Redux, of having one centralized state and one centralized "update" function (reducer), and then declaratively
describing how the HTML should look-like.
React, Vue and other popular frontend frameworks implement a virtual DOM, but with more
features like components (virtual DOM with local state and lifecycle hooks) and implicit context.

## About the example

We start the runtime by providing the initial state and the "callbacks" `render` and `update`.

```ts
import { start } from '../src/Runtime'

const dispatch = start(
  document.querySelector("#root") || $throw("No #root node"),
  init(),
  render,
  update,
)
```

Init is just the initial state, for example for a counter app we would use:

```ts
function init(): number {
  return 0
}
```

Render is just a function that returns the Html representation (virtual DOM nodes) of a given state:

```ts
import { Html, node, text, on } from '../src/Html'

function render(state: number): Html<Action> {
  return node(
    'div',
    [],
    [
      text('Counter: '),
      text(String(state)),
      button('Increase'),
      button('Decrease'),
    ]
  )
}

function button(action: Action): Html<Action> {
  return node(
    'button',
    [
      on('click', _ => action),
    ],
    [text(action)]
  )
}
```

Finally, `update` creates an updated state in response of an action:

```ts
type Action = 'Increase' | 'Decrease'

function update(state: number, action: Action): number {
  switch (action) {
    case 'Increase':
      return state + 1
    case 'Decrease':
      return state - 1
  }
}
```

## About the API

The core implementation consists of two parts:

- [Html](src/Html.ts) contains the definitions necesary to create virtual DOM nodes.
- [Runtime](src/Runtime.ts) contains the `start` function that receives a few callbacks and starts the render
  loop.

> Most exported functions have documentation comments explaining some details.

## About the Virtual DOM

The functions defined in [src/Html.ts](src/Html.ts) create virtual DOM nodes (of type `Html<A>`).
The file [src/private/Reconciliation.ts](src/private/Reconciliation.ts) contains the simplest and unoptimized
[Reconciliation And Diffing Algorithm](https://hackernoon.com/virtual-dom-reconciliation-and-diffing-algorithm-explained-simply-ycn34gr)
I could came up with. It figures out how a way to make the *real* DOM resemble the virtual DOM (`Html<A>` objects).

The API for creating HTML nodes is heavily inspired by [Elm's HTML package](https://package.elm-lang.org/packages/elm/html/latest/).

It differs in most virtual DOM API's (like React's, Vue's, Jsx, etc) because it receives the "attributes/properties" as a list instead of
an object:

```ts
// React-like
el('div', { className: 'foo' }, [])
// Elm-like
el('div', [property('className', 'foo')], [])
```

This makes a simpler, more minimal API, because there's no need to
[conflate attribute and property](https://github.com/elm/html/blob/master/properties-vs-attributes.md)
or create large typescript records describing all possible attributes.

## Known reasons why the example might be broken or slower than expected

- Extensions that mutate the DOM like Grammarly's or Google Translate don't work nicely with virtual DOM implementations.
- Because of implementation details, every frame, all event handlers are overriden with newer versions. This might be slow.
- The virtual DOM doesn't support *keyed* nodes, that's why deleting the first element of the list forces an update in all the
  other unchanged elements.

Remember this is a **toy** repository, not suitable for production.
