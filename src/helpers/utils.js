const fs = require("fs");
const path = require("path");
const {
    ADMIN_PANEL_URL,
    HOME_PANEL_URL
} = process.env;

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

export const fileUpload = async (file, destPath, fileName) => {
    try {
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }

        const filePath = path.join(destPath, fileName);
        return new Promise((resolve, reject) => {
            file.mv(filePath, (err) => {
                if (err) {
                    reject({ error: err });
                }

                resolve(filePath);
            });
        });
    } catch(err) {
        console.log('fileUploaderr', err);
        return { error: err };
    }
}

export const generateUrl = (type, userType) => {
    let url = (userType && userType == 'admin' ? ADMIN_PANEL_URL : HOME_PANEL_URL);
    switch (type) {
        case 'login':
            url = `${url}/auth/login`;
            break;
        case 'reset-password':
            url = `${url}/reset-password`;
            break;
        case 'property-url':
            url = `${url}/property`;
            break;
        default:
            break;
    }

    return url;
}
