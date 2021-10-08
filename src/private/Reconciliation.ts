import * as Html from '../Html'

import * as Utils from './Utils'

/** An inmutable HTML virtual node reconciled with a mutable DOM element.
*/
export type Reconciled<Action> = {
    html: Html.Html<Action>,
    node: Element | Text,
}

/** This is how to initialize the virtual DOM loop. It basically ignores the content of the DOM
 * and just replaces the `node` with new DOM nodes.
 * 
 * The `actionCallback` is the function that will be called when an event handler receives an Action.
*/
export function init<Action>(node: Element | Text, html: Html.Html<Action>, actionCallback: (event: Action) => void): Reconciled<Action> {
    const newDomNode = render(html, actionCallback)
    node.replaceWith(newDomNode)
    return Object.freeze({ node: newDomNode, html: html })
}

/** Does the diffing and reconciliation algorithm. It sets a `Reconciled`'s html
 * also applying the DOM mutations necesary to keep them in sync.
 *
 * Not optimized at all.
*/
export function patch<E>(
    virtualDom: Reconciled<E>,
    html: Html.Html<E>,
    actionCallback: (event: E) => void
): Reconciled<E> {
    if (virtualDom.html === html) {
        return virtualDom
    }

    switch (virtualDom.html.nodeType) {
        case 'text':
            return init(virtualDom.node, html, actionCallback)

        case 'node':
            switch (html.nodeType) {
                case 'text':
                    return init(virtualDom.node, html, actionCallback)
                default:
                    if (virtualDom.html.tagName === html.tagName && virtualDom.node instanceof Element) {
                        patchAttributes(
                            virtualDom.node,
                            virtualDom.html.attributes,
                            html.attributes,
                            actionCallback
                        )
                        patchChildren(
                            virtualDom.node,
                            virtualDom.html.children,
                            html.children,
                            actionCallback
                        )
                        return Object.freeze({ html: html, node: virtualDom.node })
                    } else {
                        return init(virtualDom.node, html, actionCallback)
                    }
            }
    }
}

function render<Evt>(html: Html.Html<Evt>, dispatch: (evt: Evt) => void): Element | Text {
    switch (html.nodeType) {
        case 'node':
            const element = document.createElement(html.tagName)

            for (let attribute of html.attributes)
                applyAttribute(attribute, dispatch, element)

            for (let child of html.children)
                element.appendChild(render(child, dispatch))

            return element

        case 'text':
            return document.createTextNode(html.text)
    }
}

function applyAttribute<Evt>(attribute: Html.Attribute<Evt>, dispatch: (evt: Evt) => void, $element: Element): void {
    try {
        switch (attribute.tag) {
            case 'attribute':
                $element.setAttribute(attribute.name, attribute.value)
                return
    
            case 'property':
                ($element as any)[attribute.name] = attribute.value
                return
    
            case 'eventHandler':
                ($element as any)[`on${attribute.eventName}`] = (event: Event) =>
                    dispatch(attribute.handler(event))
    
                return
    
            case 'style':
                // https://github.com/facebook/react/blob/87239321b0609f7bf1edaaba6aab6be24d6717b1/packages/react-dom/src/client/CSSPropertyOperations.js#L59
                if (attribute.property.startsWith('--')) {
                    ($element as any).style.setProperty(attribute.property, attribute.value)
                } else {
                    ($element as any).style[attribute.property] = attribute.value === 'float'
                        ? 'cssFloat'
                        : attribute.value
                }
                return
    
            case 'class':
                if (attribute.value !== '') {
                    $element.classList.add(attribute.value)
                }
        }
    } catch (e) {
        Utils.debugException('applyAttribute', e)
    }
}

// --- Attributes

function patchAttributes<T>(
    domNode: Element,
    currentAttributes: Array<Html.Attribute<T>>,
    newAttributes: Array<Html.Attribute<T>>,
    dispatch: (event: T) => void,
): void {
    mergeArraysComparingElements(
        currentAttributes,
        newAttributes,
        (oldAttr, newAttr, _) => {
            if (!attributeEquality(oldAttr, newAttr)) {
                replaceAttribute(oldAttr, newAttr, dispatch, domNode)
            }
        },
        (oldAttr, _) => {
            removeAttribute(oldAttr, domNode)
        },
        (newAttr, _) => {
            applyAttribute(newAttr, dispatch, domNode)
        }
    )
}

/** Helper function. It "zips" or "maps" two arrays into one. */
function mergeArraysComparingElements<A, B>(
    xs: Array<A>,
    ys: Array<A>,
    bothPresent: (x: A, y: A, index: number) => B,
    xPresent: (x: A, index: number) => B,
    yPresent: (y: A, index: number) => B
): Array<B> {
    const array: Array<B> = []

    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        array.push(bothPresent(xs[i], ys[i], i))
    }

    for (let i = ys.length; i < xs.length; i++) {
        array.push(xPresent(xs[i], i))
    }

    for (let i = xs.length; i < ys.length; i++) {
        array.push(yPresent(ys[i], i))
    }

    return array
}

function replaceAttribute<A>(
    oldAttr: Html.Attribute<A>,
    newAttr: Html.Attribute<A>,
    dispatch: (event: A) => void,
    $node: Element
) {
    /** Handle this special case for input.value and similar. */
    if (oldAttr.tag === 'property' && newAttr.tag === 'property') {
        if (oldAttr.name === newAttr.name) {
            if (($node as any)[newAttr.name] !== newAttr.value) {
                ($node as any)[newAttr.name] = newAttr.value;
            }
            return
        }
    }

    removeAttribute(oldAttr, $node)
    applyAttribute(newAttr, dispatch, $node)
}

function attributeEquality<T>(a: Html.Attribute<T>, b: Html.Attribute<T>): boolean {
    if (a.tag === 'attribute' && b.tag === 'attribute') {
        return a.name === b.name && a.value === b.value
    } else if (a.tag === 'property' && b.tag === 'property') {
        return a.name === b.name && Utils.equals(a.value, b.value)
    } else if (a.tag === 'eventHandler' && b.tag === 'eventHandler') {
        // The function comparison will most likely always return false
        // a smarter implementation could optimize this case somehow ?
        return a.eventName === b.eventName && a.handler === b.handler
    } else if (a.tag === 'style' && b.tag === 'style') {
        return a.property === b.property && a.value === b.value
    } else if (a.tag === 'class' && b.tag === 'class') {
        return a.value === b.value
    }

    return false
}

function removeAttribute<T>(attr: Html.Attribute<T>, $node: Element): void {
    try {
        switch (attr.tag) {
            case 'attribute':
                $node.removeAttribute(attr.name)
                return
            case 'property':
                ($node as any)[attr.name] = undefined
                return
            case 'eventHandler':
                ($node as any)[`on${attr.eventName}`] = undefined
                return
            case 'style':
                ($node as any).style[attr.property] = ''
                return
            case 'class':
                $node.classList.remove(attr.value)
                return
        }
    } catch (e) {
        Utils.debugException('removeAttribute', e)
    }
}


// --- CHILDREN

function patchChildren<T>(
    parent: Element,
    currentChildren: Array<Html.Html<T>>,
    newChildren: Array<Html.Html<T>>,
    dispatch: (event: T) => void,
): void {
    const childNodes = Array.from(parent.childNodes)

    mergeArraysComparingElements(
        currentChildren,
        newChildren,
        (currentHtml, newHtml, i) => {
            const $child = childNodes[i]

            if (!($child instanceof Element) && !($child instanceof Text))
                throw { parent, currentHtml, newHtml, $child }

            patch({ node: $child, html: currentHtml }, newHtml, dispatch)
        },
        (_, i) => {
            const $child = childNodes[i]

            $child.remove()
        },
        (newHtml, _) => {
            parent.appendChild(render(newHtml, dispatch))
        }
    )
}
