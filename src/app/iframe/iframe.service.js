import * as wishlistService from '../customer/wishlist/wishlist.service';
import * as appoinmentService from '../customer/appointment/appointment.service';
import { utilsHelper } from '@/helpers';
import { USER_TYPE } from '@/config/constants';

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
        const { firstName, lastName, email, productId, appointmentDate, timeSlotId, allotedAgent, timezone } = reqBody;
        
        const appoinmentAdd = await appoinmentService.createAppointment({
            user: null,
            body: {
                customerFirstName: firstName, 
                customerLastName: lastName, 
                customerEmail: email,
                property: productId,
                appointmentDate,
                timeSlotId,
                allotedAgent,
                timezone
            }
        }, dbInstance);

        if (appoinmentAdd?.error && appoinmentAdd?.message) {
            return appoinmentAdd;
        }

        return true;
    } catch(err) {
        console.log('addAppointmentIframeServiceError', err)
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
            }],
            order: [['from_time', 'ASC']],
        });
    } catch(err) {
        console.log('listAvailabilitySlotsIframeServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const checkAvailability = async (req) => {
    try {
      const { dbInstance } = req;
      const { date, time, userId } = req.body;
  
      // check if slot selected by user(agent or customer) is valid
      let timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: time } });
      if (!timeSlot) {
        return { error: true, message: 'Invalid timeslot selected.' };
      }
  
      // if customer is available, check if agent is available or not
      const agentAvailability = await utilsHelper.availabilityAlgorithm(null, userId, date, timeSlot, USER_TYPE.AGENT, dbInstance);
      if (agentAvailability?.error && agentAvailability?.message) {
        return agentAvailability;
      }
  
      // if both are available, then appointment can be created
      return true;
    } catch(err) {
      console.log('checkAvailabilityIframeServiceError', err);
      return { error: true, message: 'Server not responding, please try again later.' }
    }
}