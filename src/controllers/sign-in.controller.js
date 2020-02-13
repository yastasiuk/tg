import signal from 'signal-js';
import { addEventListeners, addChildFromTemplate, getNode } from 'utils/dom';
import DropDownController from './drop-down.controller';
import InputController from 'common/custom-input/custom-input.controller';

function onInit(props, state, localSignals) {
    const { target, template, country, phoneNumber } = props;
    state.country = country || state.country;
    state.phoneNumber = phoneNumber || state.phoneNumber;
    addChildFromTemplate(target, template);
    
    addEventListeners(target, [
        {
            type: 'submit',
            target: '.signin-form',
            callback: (e) => {
                e.preventDefault();
                localSignals.emit('on-submit');
            }
        }
    ])
    const dropDown = new DropDownController({
        target: target.querySelector('#country-dropdown'),
        country: state.country,
    });
    const input = new InputController({
        target: target.querySelector('#phone-input'),
        inputValue: state.phoneNumber,
        prepend: country && country.code,
    });

    dropDown.signals.on('selection-update', (country) => {
        input.signals.emit('update-props', { placeholder: country.name, prepend: country.code });
        localSignals.emit('update-country', country);
    });

    input.signals.on('on-change', (phoneNumber) => {
        localSignals.emit('update-phone', phoneNumber)
    });
    
}

function render(props, state) {
    const { target } = props;
    const submitBtn = getNode(target, '.btn--submit');
    if (state.country && state.phoneNumber) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }
}

function signInPlaceholderController(props) {
    console.log('Props:', props);
    const localSignals = signal();
    const signals = signal();
    const state = {
        country: null,
        phoneNumber: ''
    }
    const renderer = render.bind(this, props, state);
    onInit(props, state, localSignals);
    renderer();

    localSignals.on('update-country', (newCountry) => {
        state.country = newCountry;
        renderer()
    });

    localSignals.on('update-phone', (newPhoneNumber) => {
        state.phoneNumber = newPhoneNumber;
        renderer()
    });

    localSignals.on('on-submit', () => {
        const { country, phoneNumber } = state;
        signals.emit('submit', country, phoneNumber);
    });

    return { signals }
}

export default signInPlaceholderController;