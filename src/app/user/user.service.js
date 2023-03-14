export const updateCurrentUser = async (reqBody, dbInstance) => {
    try {
        await dbInstance.update(reqBody, {
            fields: ['firstName', 'lastName', 'email'],
        });

        return true;
    } catch(err) {
        console.log('updateCurrentUserServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updatePassword = async (user, reqBody) => {
    try {
        const { current, password } = reqBody;

        // Check user password
        const isValidPassword = await user.validatePassword(current);
        if (!isValidPassword) {
            return { error: true, message: 'Incorrect password!'}
        }

        // Update password
        user.password = password;
        await user.save();

        return true;
    } catch(err) {
        console.log('updatePasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}