export function filterComponent (component, predicate) {
    var i;
    var j;
    var results = [];
    
    if (predicate(component)) {
        results.push(component);
    }

    if (component && component.props && component.props.children && component.props.children.length) {
        for (i = 0; i < component.props.children.length; i++) {
            results = results.concat(filterComponent(component.props.children[i], predicate));
        }
    } else if (component && component.props && component.props.children) {
        results = results.concat(filterComponent(component.props.children, predicate));
    } else if (Array.isArray(component)) {
        for (j = 0; j < component.length; j++) {
            results = results.concat(filterComponent(component[j], predicate));
        }
    }

    return results;
}

export function find (component, predicate) {
    return filterComponent(component, predicate)[0];
}