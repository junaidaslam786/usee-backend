const fs = require("fs");
const path = require("path");
const {
    ADMIN_PANEL_URL,
    HOME_PANEL_URL
} = process.env;
import { 
    USER_TYPE,
    APPOINTMENT_STATUS
} from '@/config/constants';
import moment from 'moment';
import 'moment-timezone';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

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

export const removeFile = async (file) => {
    try {
        if (!fs.existsSync(`uploads/${file}`)) {
            return ('file is not exist')
        }
        fs.unlink(`uploads/${file}`, (err) => {
            if (err) throw err;
            console.log(`File has been deleted successfully`);
          });
    } catch (error) {
        console.log('fileRemoveCatchError', err);
        return { error: err };
    }
}

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
        case 'admin-forgot-password':
            url = `${url}/admin/update-password`;
            break;
        case 'admin-update-password':
            url = `${url}/login`;
            break;
        case 'admin-login':
            url = `${url}/login`;
            break;
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

export const checkIfTimeIsOld = (user, date, time) => {
    if (user?.timezone) {
        process.env.TZ = user.timezone;
    }
    
    const difdate = date;
    const parts = difdate.split("-");
    const fpdate = parts[0]+'-'+parts[1]+'-'+parts[2];

    const givenDate = new Date(fpdate+'T'+time);
    const currentDate = new Date();

    givenDate.setSeconds(0);
    givenDate.setMilliseconds(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    console.log('givenDateFormat', givenDate.toString());
    console.log('currentDateFormat', currentDate.toString());
    return givenDate < currentDate;
}

export const getCustomDate = (type) => {
    let customDate = "";

    switch(type) {
        case "today":
            customDate = moment().startOf('day').format('YYYY-MM-DD');
            break;
        case "yesterday":
            customDate = moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
            break;
        case "thisMonthStart":
            customDate = moment().startOf('month').format('YYYY-MM-DD');
            break;
        case "thisMonthEnd":
            customDate = moment().endOf('month').format('YYYY-MM-DD');
            break;
        case "lastMonthStart":
            customDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
            break;
        case "lastMonthEnd":
            customDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
            break;
        case "startOfPeriod":
            customDate = moment().subtract(3, 'month').startOf('day').format('YYYY-MM-DD');
            break;
        case "endOfPeriod":
            customDate = moment().format('YYYY-MM-DD');
            break;
    }

    return customDate;
}

export const convertDateTimeToTimestamp = (appointmentDate, fromTime) => {
    return (appointmentDate && fromTime) ? moment(`${appointmentDate} ${fromTime}`).valueOf() : "";
}

export const convertTimeToTimezoneBasedTime = (sourceUserTimezone, targetUserTimezone, time) => {
    if (!sourceUserTimezone || !targetUserTimezone) {
        return false;
    }

    return time ? moment.tz(time, "HH:mm:ss", sourceUserTimezone).tz(targetUserTimezone).format("HH:mm:ss") : "-";
}

export const convertTimeToGmt = (time, timezone, format) => {
    return time ? moment.tz(time, "HH:mm:ss", timezone).tz('GMT').format(format ? format : "HH:mm:ss") : "-";
}
  
export const convertGmtToTime = (time, timezone, format) => {
    return time ? moment.tz(time, "HH:mm:ss", "GMT").tz(timezone).format(format ? format : "HH:mm:ss") : "-";
}

export const availabilityAlgorithm = async (requstedUser, targetUserId, date, timeSlot, type, dbInstance) => {
    const defaultTimezone = requstedUser?.timezone ? requstedUser.timezone : process.env.APP_DEFAULT_TIMEZONE;
    
    const user = await dbInstance.user.findOne({ where: { id: targetUserId } });
    if (!user) {
      return { error: true, message: 'Invalid user selected.' };
    }

    if (type === USER_TYPE.AGENT) {
        // convert the selected slot to selected users timezone
        const timezoneBasedfromTime = convertTimeToTimezoneBasedTime(defaultTimezone, user.timezone, timeSlot.fromTime);
        if (!timezoneBasedfromTime) {
            return { error: true, message: `As per ${process.env.AGENT_ENTITY_LABEL} timezone, selected timeslot is not available. Please select another timeslot.` };
        }
    
        // select target user time slot
        const targetTimeSlot = await dbInstance.agentTimeSlot.findOne({ where: { fromTime: timezoneBasedfromTime } });
        if (!targetTimeSlot) {
            return { error: true, message: `As per ${process.env.AGENT_ENTITY_LABEL} timezone, selected timeslot is not available. Please select another timeslot.` };
        }

        // check if slot is expired or not based on selected users timezone
        const isTimeExpired = checkIfTimeIsOld(user, date, targetTimeSlot.fromTime);
        if (isTimeExpired) {
            return { error: true, message: `As per ${process.env.AGENT_ENTITY_LABEL} timezone, selected timeslot is expired. Please select another timeslot.` };
        }

        // check if agent has enabled the time slot or not
        const isAgentSlotAvailable = await dbInstance.agentAvailability.findOne({
            where: {
                userId: user.id,
                dayId: (new Date(date).getDay() + 6) % 7 + 1,
                timeSlotId: targetTimeSlot.id,
                status: true
            }
        });

        if (!isAgentSlotAvailable) {
            return { error: true, message: `${process.env.AGENT_ENTITY_LABEL} is not available in this timeslot. Please choose another timeslot.` };
        }
    }
    
    let whereClause = {
        appointmentDate: date,
        appointmentTimeGmt: convertTimeToGmt(timeSlot.fromTime, defaultTimezone),
        status: { [OP.in]: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.INPROGRESS] }, 
    };
    
    if (type === USER_TYPE.CUSTOMER) {
        whereClause.customerId = user.id;
    } else {
        whereClause.allotedAgent = user.id;
    }
  
    // Check if there's an existing appointment
    const existingAppointment = await dbInstance.appointment.findOne({ where: whereClause });
    if (existingAppointment) {
      return { error: true, message: `${type === USER_TYPE.CUSTOMER ? process.env.CUSTOMER_ENTITY_LABEL : process.env.AGENT_ENTITY_LABEL} already has an appointment. Please choose another timeslot.` };
    }

    return true;
}