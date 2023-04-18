import * as wishlistService from '../customer/wishlist/wishlist.service';
import * as appoinmentService from '../customer/appointment/appointment.service';

export const addToWishlist = async (reqBody, dbInstance) => {
    try {
        const { firstName, lastName, email, productId } = reqBody;
        
        const wishlistAdded = await wishlistService.addProductToWishlist(productId, {
            dbInstance: dbInstance,
            user: null,
            customerFirstName: firstName, 
            customerLastName: lastName, 
            customerEmail: email
        });

        if (wishlistAdded?.error && wishlistAdded?.message) {
            return wishlistAdded;
        }

        return true;
    } catch(err) {
        console.log('addToWishlistIframeServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const addAppointment = async (reqBody, dbInstance) => {
    try {
        const { firstName, lastName, email, productId, appointmentDate, timeSlotId } = reqBody;
        
        const appoinmentAdd = await appoinmentService.createAppointment({
            user: null,
            body: {
                customerFirstName: firstName, 
                customerLastName: lastName, 
                customerEmail: email,
                property: productId,
                appointmentDate,
                timeSlotId,
                isAssignedToSupervisor: reqBody?.isAssignedToSupervisor ? reqBody.isAssignedToSupervisor : false
            }
        }, dbInstance);

        if (appoinmentAdd?.error && appoinmentAdd?.message) {
            return appoinmentAdd;
        }

        return true;
    } catch(err) {
        console.log('addToWishlistIframeServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const listAvailabilitySlots = async (req) => {
    try {
        if (!req?.query?.agent) {
            return { error: true, message: 'Invalid id.'}
        }

        return await req.dbInstance.agentTimeSlot.findAll({
            include: [{
                model: req.dbInstance.agentAvailability,
                where: { userId: (req?.query?.agent ? req.query.agent : 0) },
                attributes: []
            }]
        });
    } catch(err) {
        console.log('listAvailabilitySlotsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}