import { createNodeFromTemplate, getNode } from 'utils/dom';
import DropDown from '../../components/drop-down/DropDown';

import './sign-in.scss';
import signInTemplate from './sign-in.html';

function remove(node) {
    node.remove();
}

function init(target) {
    const dropDownComponent = DropDown({ styles: ['line-input'] });
    
    const node = createNodeFromTemplate(signInTemplate,  { DropDown: dropDownComponent });
    
    target.appendChild(node);
    return {
        _node: node,
        remove: remove.bind(this, node),
    }
}

export default init
