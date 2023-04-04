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
                    console.log('fileUploadPromiseError', err);
                    reject({ error: err });
                }
                const accessPath = path.join(destPath, fileName);
                resolve(accessPath);
            });
        });
    } catch(err) {
        console.log('fileUploadCatchError', err);
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
        case 'join-meeting':
            url = `${url}/precall`;
            break;
        default:
            break;
    }

    return url;
}

export const createPolygonPath = (coordinates) => {
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

export const calculateDistance = (lat1, lon1, lat2, lon2, unit) => {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

export const checkIfTimeIsOld = (date, time) => {
    const difdate = date;
    const parts = difdate.split("-");
    const fpdate = parts[1]+'-'+parts[2]+'-'+parts[0];

    const givenDate = new Date(fpdate+' '+time);
    const currentDate = new Date();

    givenDate.setSeconds(0);
    givenDate.setMilliseconds(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    return givenDate < currentDate;
}