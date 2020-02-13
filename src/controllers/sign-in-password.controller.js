import signal from 'signal-js';
import { addEventListeners, addChildFromTemplate, getNode } from 'utils/dom';
import InputController from 'common/custom-input/custom-input.controller';

function onInit(props, state, localSignals) {
    const { target, template } = props;
    addChildFromTemplate(target, template);

    addEventListeners(target, [
        {
            type: 'submit',
            target: '.signin-form',
            callback: (e) => {
                e.preventDefault();
                localSignals.emit('on-submit');
            }
        },
        {
            type: 'click',
            target: '.show-password',
            callback: (e) => {
                localSignals.emit('toggle-password-visibility');
            }
        }
    ]);

    const input = new InputController({
        target: target.querySelector('#password-input'),
        header: 'Password',
    });

    input.signals.on('on-change', (newPassword) => {
        localSignals.emit('update-password', newPassword)
    });
    
    localSignals.on('update-visibility', (isShown) => {
        input.signals.emit('update-props', { type: isShown ? 'text' : 'password' });
    });

    localSignals.on('update-error', (errorText) => {
        input.signals.emit('update-props', { errorText });
    })
}

function render(props, state) {
    const { target } = props;
    const { password, isShown } = state;
    const submitBtn = getNode(target, '.btn--submit');
    const iconNode = getNode(target, '.signin-icon');

    if (password) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }

    if (isShown) {
        iconNode.classList.add('monkey-icon-seesyou');
        iconNode.classList.remove('monkey-icon');
    } else {
        iconNode.classList.remove('monkey-icon-seesyou')
        iconNode.classList.add('monkey-icon');
    }
}

function signInPlaceholderController(props) {
    const localSignals = signal();
    const signals = signal();
    const state = {
        password: '',
        isShown: false
    }

    const renderer = render.bind(this, props, state);
    onInit(props, state, localSignals);
    renderer();

    localSignals.on('toggle-password-visibility', () => {
        state.isShown = !state.isShown;
        localSignals.emit('update-visibility', state.isShown);
        renderer();
    })

    localSignals.on('update-password', (newPassword) => {
        state.password = newPassword;
        renderer();
    });

    localSignals.on('on-submit', () => {
        signals.emit('onSubmit', state.password);
    });

    localSignals.on('update-error', (errorText) => {
        state.errorText = errorText;
        renderer();
    })

    signals.on('update-error', (errorText) => {
        localSignals.emit('update-error', errorText);
    })

    return { signals };
}

export default signInPlaceholderController;