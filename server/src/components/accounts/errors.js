export default {
    registerEmailInUse: {
        httpCode: 401,
        name: 'company-register-email-in-use',
        description: 'Email already in use.',
    },
    loginAccountNotFound: {
        httpCode: 404,
        name: 'company-login-account-not-found',
        description: 'There is no account with that email.',
    },
    loginWrongPassword: {
        httpCode: 401,
        name: 'company-login-wrong-password',
        description: 'Wrong password. Please try again.',
    },
    notLoggedIn: {
        httpCode: 401,
        name: 'company-not-logged-in',
        description: 'You must log in in order to continue.',
    },
    invalidSession: {
        httpCode: 401,
        name: 'company-invalid-session-in',
        description: 'You must log in in order to continue.',
    },
    expiredSession: {
        httpCode: 401,
        name: 'company-expired-session-in',
        description: 'You must log in in order to continue.',
    },
}
