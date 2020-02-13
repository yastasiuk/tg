// TODO: implement
export const sendPhoneNumber = (phoneNumber) => Promise.resolve();
export const sendSmsCode = (smsCode) => {
    if (smsCode.length < 7) {
        return Promise.resolve()
    }
    return Promise.reject({ error: 'Invalid code' });
}

export const sendPassword = (password) => {
    if (password === '123') {
        return Promise.resolve()
    }
    return Promise.reject({ error: 'Invalid password' });
}

export const sendProfile = (profile) => {
    return Promise.resolve();
}