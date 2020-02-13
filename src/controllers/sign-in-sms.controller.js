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
            target: '#change-phone',
            callback: (e) => {
                localSignals.emit('change-phone');
            }
        }
    ])
    const input = new InputController({
        target: target.querySelector('#sms-input')
    });

    input.signals.on('on-change', (smsCode) => {
        localSignals.emit('update-code', smsCode)
    });

    localSignals.on('update-error', (errorText) => {
        input.signals.emit('update-props', { errorText });
    })
}

function render(props, state) {
    const { target, country, phoneNumber } = props;
    const { smsCode, errorText } = state;
    const phoneNumberNode = getNode(target, '.phone-number');
    phoneNumberNode.textContent = `${country.code} ${phoneNumber}`;

    const submitBtn = getNode(target, '.btn--submit');
    if (smsCode) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }

    const iconNode = getNode(target, '.signin-icon');
    if (errorText) {
        iconNode.classList.add('monkey-icon-error')
        iconNode.classList.remove('monkey-icon');
    } else {
        iconNode.classList.remove('monkey-icon-error');
        iconNode.classList.add('monkey-icon');
    }
}
/**
 * target
 * template
 * country: { ..., code: string },
 * phoneNumber: string,
 */
function signInSmsController(props) {
    const localSignals = signal();
    const signals = signal();
    const state = {
        smsCode: '',
        errorText: ''
    }
    const renderer = render.bind(this, props, state);
    onInit(props, state, localSignals);
    renderer();

    localSignals.on('update-code', (newSmsCode) => {
        state.smsCode = newSmsCode;
        localSignals.emit('update-error', '');
    });

    localSignals.on('change-phone', () => {
        signals.emit('change-phone');
    });

    localSignals.on('on-submit', () => {
        signals.emit('submit', state.smsCode);
    });

    localSignals.on('update-error', (errorText) => {
        state.errorText = errorText;
        renderer();
    })

    signals.on('update-error', (errorText) => {
        localSignals.emit('update-error', errorText);
    });

    return { signals };
}

export default signInSmsController;