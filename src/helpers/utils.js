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
        if (!fs.existsSync(`uploads/${destPath}`)) {
            fs.mkdirSync(`uploads/${destPath}`, { recursive: true });
        }

        const filePath = path.join(`uploads/${destPath}`, fileName);
        return new Promise((resolve, reject) => {
            file.mv(filePath, (err) => {
                if (err) {
                    reject({ error: err });
                }
                const accessPath = path.join(destPath, fileName);
                resolve(accessPath);
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
        case 'agent-login':
            url = `${url}/agent/login`;
            break;
        case 'customer-login':
            url = `${url}/customer/login`;
            break;
        case 'agent-reset-password':
            url = `${url}/agent/reset-password`;
            break;
        case 'customer-reset-password':
            url = `${url}/customer/reset-password`;
            break;
        case 'property-url':
            url = `${url}/property`;
            break;
        default:
            break;
    }

    return url;
}

export function createPolygonPath(coordinates) {
    if (coordinates.length < 3) {
      return null;
    }
    
    let polygonPath = 'POLYGON((';
    for (let i = 0; i < coordinates.length; i++) {
      polygonPath += `${coordinates[i]}`;
      if (i !== coordinates.length - 1) {
        polygonPath += ',';
      }
    }
    polygonPath += `))`;
    
    return polygonPath;
}
