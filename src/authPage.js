import SignInController from 'controllers/sign-in.controller';
import SignInSmsController from 'controllers/sign-in-sms.controller';
import SignInPasswordController from 'controllers/sign-in-password.controller';
import SignInProfileController from 'controllers/sign-in-profile.controller';
import { removeChildNodes } from 'utils/dom';
import { sendPhoneNumber, sendSmsCode, sendPassword, sendProfile } from 'services/api';

// TODO: fix that style(huge one)
import './views/authPage/sign-in.scss';
import PhoneInputTemplate from './views/authPage/phone-input.html';
import SMSInputTemplate from './views/authPage/sms-input.html';
import PasswordInputPassword from './views/authPage/password-input.html';
import ProfileInputPassword from './views/authPage/profile-input.html';

function onPhoneEnter(state, country, phoneNumber) {
    console.log('Phone Entered', phoneNumber);
    sendPhoneNumber(phoneNumber)
        .then((response) => {
            state.country = country;
            state.phoneNumber = phoneNumber;
            state.step = 1;
            updateStep(state);
        })
}

function onSmsEnter(state, smsCode) {
    return sendSmsCode(smsCode)
        .then((response) => {
            state.step = 2;
            updateStep(state);
        });
}

function onPasswordSubmit(state, password) {
    return sendPassword(password)
        .then(res => {
            state.step = 3;
            updateStep(state);
        })
}

function onProfileSubmit(state, profile) {
    console.log('onProfileSubmit', profile);
    return sendProfile(profile);
}

function changePhone(state) {
    state.step = 0;
    updateStep(state);
    console.log('changePhone');
}

function updateStep(state) {
    const { step, target, country, phoneNumber } = state;
    removeChildNodes(target);
    switch(step) {
        case 0:
            const signInController = new SignInController({
                template: PhoneInputTemplate,
                target,
                country,
                phoneNumber
            });
            signInController.signals.on('submit', (country, phoneNumber) => onPhoneEnter(state, country, phoneNumber));
            break;
        case 1:
            const signInSmsController = new SignInSmsController({
                template: SMSInputTemplate,
                target,
                country,
                phoneNumber
            });
            signInSmsController.signals.on('submit', (smsCode) => {
                onSmsEnter(state, smsCode)
                    .catch(err => signInSmsController.signals.emit('update-error', err.error));
            });
            signInSmsController.signals.on('change-phone', () => changePhone(state));
            break;
        case 2:
            const signInPasswordController = new SignInPasswordController({
                template: PasswordInputPassword,
                target
            });
            signInPasswordController.signals.on('onSubmit', (password) => {
                onPasswordSubmit(state, password)
                    .catch(err => signInPasswordController.signals.emit('update-error', err.error));
            });
            break;
        case 3:
            const signInProfileController = new SignInProfileController({
                template: ProfileInputPassword,
                target
            });
            signInProfileController.signals.on('onSubmit', (profile) => {
                onProfileSubmit(state, profile);
            });
            break;
        default:
            break;
    }
}

function init(props) {
    const { target } = props;
    const state = {
        target,
        step: 0,
        country: {
            id: '1',
            name: 'Ukraine',
            code: '+380',
            icon: 'ukraine',
        },
        phoneNumber: '1234567',
    }
    updateStep(state);
}
export default init;


