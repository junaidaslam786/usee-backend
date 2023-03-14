export const generateRandomString = (length, isApiCode = false) => {
    try {
        let result = "";
        const characters = isApiCode ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random()
     * charactersLength));
        }
        return result;
    } catch(err) {
        console.log('err', err);
    }
};
