import signal from 'signal-js';
import { addEventListeners } from 'utils/dom';

function onInit(props, state, localSignals) {
    const {
        inputValue,
        target,
    } = props;
    const inputNode = target.querySelector('.input__field');

    if (inputValue) {
        inputNode.value = inputValue;
    }

    addEventListeners(target, [
        {
            target: '.input__field',
            type: 'focus',
            callback: (e) => {
                event.stopPropagation();
                localSignals.emit('input-active', true);
            }
        },
        {
            target: '.input__field',
            type: 'blur',
            callback: (e) => {
                event.stopPropagation();
                localSignals.emit('input-active', false);
            }
        },
        {
            target: '.input__field',
            type: 'keydown',
            callback: (e) => {
                // TODO: make this one more generic(?)
                setTimeout(function () {
                    console.log('keydown', e.target.value);
                    localSignals.emit('input-change', e.target.value);
                }, 0);
                
            }
        },
        {
            target: '.input__field',
            type: 'change',
            callback: (e) => {
                localSignals.emit('input-change', e.target.value);
            }
        }
    ]);

    localSignals.on('update-type', (newType) => {
        inputNode.type = newType;
    })
}

// TODO: HoC and memo query selectors(?)
function render(props, state) {
    const { target } = props;
    const inputGroup = target.querySelector('.line-input');
    const prependNode = target.querySelector('.input__prepend');
    const headerNode = target.querySelector('.input__header');
    const { header, prepend, selected, errorText, type } = state;
    
    if (prepend) {
        prependNode.textContent = prepend;
        prependNode.classList.remove('hidden');
    } else {
        prependNode.classList.add('hidden');
    }
    
    switch (type) {
        case 0:
            break
        default:
            
    }

    if (selected) {
        inputGroup.classList.add('active');
    } else {
        inputGroup.classList.remove('active');
    }
    
    if (header && selected || errorText) {
        if (errorText) {
            headerNode.textContent = errorText;
            headerNode.classList.add('error');
            inputGroup.classList.add('error');
        } else {
            headerNode.textContent = header;
            headerNode.classList.remove('error');
            inputGroup.classList.remove('error');
        }
        headerNode.classList.add('active');
    } else {
        headerNode.classList.remove('active');
        inputGroup.classList.remove('error');
    }
}
// TODO: Add animation(header's transition animation)
function InputController(props) {
    const localSignals = signal();
    const signals = signal();
    const state = {
        prepend: props.prepend || null,
        selected: false,
        header: props.header || null,
        inputValue: '',
    }

    onInit(props, state, localSignals);

    const renderer = render.bind(this, props, state);
    renderer();
    
    localSignals.on('update-header', (newHeader) => {
        state.header = newHeader;
        renderer();
    });

    localSignals.on('update-prepend', (newPrepend) => {
        state.prepend = newPrepend;
        renderer();
    });

    localSignals.on('input-active', (isActive) => {
        if (state.selected === isActive) { return }
        state.selected = isActive;
        renderer();
    });
    
    localSignals.on('input-change', (newInputValue) => {
        if (state.inputValue === newInputValue) { return }
        state.errorText = '';
        state.inputValue = newInputValue;
        signals.emit('on-change', state.inputValue);
        renderer();
    })

    signals.on('update-props', (props) => {
        console.log('update-props', props);
        const { header, prepend, errorText, type } = props;
        if (header) {
            state.header = header;
        }
        if (prepend) {
            state.prepend = prepend;
        }
        if (errorText) {
            state.errorText = errorText;
        }
        if (type) {
            state.type = type;
            localSignals.emit('update-type', type);
        }
        renderer();
    });


    return { signals };
}

export default InputController;