import signal from 'signal-js';
import { addEventListeners, addChildFromTemplate, getNode } from 'utils/dom';
import InputController from 'common/custom-input/custom-input.controller';
import ImagePickerController from 'common/image-picker/image-picker.controller';

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
        }
    ]);

    const imagePicker = new ImagePickerController({
        target: target.querySelector('.profile-image--picker')
    });

    imagePicker.signals.on('onChange', (selectedImage, imageTransformations) => {
        console.log('On Image SUbmit:', imageTransformations);
    })

    const nameInput = new InputController({
        target: target.querySelector('#profile-name--input'),
        header: 'Name',
    });

    const surnameInput = new InputController({
        target: target.querySelector('#profile-surname--input'),
        header: 'Last Name (optional)',
    });

    nameInput.signals.on('on-change', (newName) => {
        localSignals.emit('update-name', newName)
    });

    surnameInput.signals.on('on-change', (newSurname) => {
        localSignals.emit('update-surname', newSurname)
    });
    

    localSignals.on('update-error', (errorText) => {
        input.signals.emit('update-props', { errorText });
    })
}

function render(props, state) {
    const { target } = props;
    const { name } = state;
    const submitBtn = getNode(target, '.btn--submit');
    const iconNode = getNode(target, '.signin-icon');

    if (name) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }
}

function signInPlaceholderController(props) {
    const localSignals = signal();
    const signals = signal();
    const state = {
        image: null,
        name: '',
        surname: '',
    }

    const renderer = render.bind(this, props, state);
    onInit(props, state, localSignals);
    renderer();

    localSignals.on('update-name', (newName) => {
        state.name = newName;
        renderer();
    });

    localSignals.on('update-surname', (newSurname) => {
        state.surname = newSurname;
        renderer();
    });

    localSignals.on('on-submit', () => {
        signals.emit('onSubmit', {});
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