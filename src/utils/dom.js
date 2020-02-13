import template from 'lodash/template';

export function getNode(node, selector) {
    return node.querySelector(selector);
}

/**
 * templateString - String
 * mapping - Object with template elements
 */
function createNodeFromTemplate(templateString, mapping) {
    const compiled = template(templateString)
    const html = new DOMParser().parseFromString(compiled(mapping), 'text/html');
    
    return html.body.childNodes;
}

export function addChildFromTemplate(target, templateString, mapping) {
    const nodes = createNodeFromTemplate(templateString, mapping);
    nodes.forEach(node => target.appendChild(node));
}

//Returns true if it is a DOM node
function isNode(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
}

//Returns true if it is a DOM element    
function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

/**
 * 
 * @param {*} node 
 * @param {Array<Object>} options - [{ type: 'click|scroll', callback: function, target: 'selector' }]
 */
export const addEventListeners = (node, listeners) => {
    if (!node) return;
    listeners.forEach(listener => {
        (listener.target ? (
            typeof listener.target === 'string' ? node.querySelectorAll(listener.target) : [listener.target]
        ) : [node])
            .forEach(el => {
                if (listener.type) {
                    el.addEventListener(listener.type, listener.callback);
                } else if (listener.types) {
                    listener.types.forEach(listenerType => {
                        el.addEventListener(listenerType, listener.callback);
                    })
                }
            });
    });
}

export function removeChildNodes (node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild)
    }
}

function removeEventListeners(node) {

}