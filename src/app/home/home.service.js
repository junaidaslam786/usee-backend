import { mailHelper } from '@/helpers';
import { EMAIL_TEMPLATE_PATH, EMAIL_SUBJECT } from '@/config/constants';
const path = require("path")
const ejs = require("ejs");

export const bookDemo = async (reqBody, req) => {
    try {
        const { 
            name,
            email,
            jobTitle,
            phoneNumber,
            message
        } = reqBody;

        const { dbInstance } = req;
      
        await dbInstance.bookDemo.create({
            name,
            email,
            jobTitle,
            phoneNumber,
            message
        });

        const emailData = [];
        emailData.name = name;
        emailData.email = email;
        emailData.jobTitle = jobTitle;
        emailData.phoneNumber = phoneNumber;
        emailData.message = message;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.BOOK_DEMO), emailData);

        const payload = {
            to: process.env.DEFAULT_REPLY_SENDER,
            subject: EMAIL_SUBJECT.BOOK_DEMO,
            html: htmlData,
        }
        mailHelper.sendMail(payload);

        return true;
    } catch(err) {
        console.log('bookDemoServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}