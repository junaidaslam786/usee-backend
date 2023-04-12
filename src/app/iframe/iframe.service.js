import { USER_TYPE } from '@/config/constants';
import * as userService from '../user/user.service';
import * as wishlistService from '../customer/wishlist/wishlist.service';
import { utilsHelper } from '@/helpers';
import db from '@/database';

export const registerAsCustomer = async (reqBody, dbInstance) => {
    try {
        const { firstName, lastName, email, productId } = reqBody;

        const result = await db.transaction(async (transaction) => {
            const tempPassword = utilsHelper.generateRandomString(10);
            const customerDetails = await userService.createUserWithPassword({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: tempPassword,
                status: true,
                userType: USER_TYPE.CUSTOMER,
            }, transaction);

            const newReqObj = {
                dbInstance: dbInstance,
                user: customerDetails
            }
            wishlistService.addProductToWishlist(productId, newReqObj);

            return customerDetails;
        });

        return true;
    } catch(err) {
        console.log('registerAsCustomerError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}