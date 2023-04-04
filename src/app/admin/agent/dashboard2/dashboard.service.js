/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-console */

import { APPOINTMENT_TYPES, USER_TYPE } from '@/config/constants';

const path = require('path');
const ejs = require('ejs');

export const agentCount = async (dbInstance) => {
  try {
    const whereClause = USER_TYPE == 'agent';
    const { count, rows } = await dbInstance.agent.findAndCountAll({
      where: whereClause,
      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listAppointmentsServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const customerCount = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;

    const whereClause = APPOINTMENT_TYPES == 'completed';
    const { count, rows } = await dbInstance.appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: dbInstance.product,
          attributes: ['id'],
          through: { attributes: [] },
        },
        {
          model: dbInstance.user,
          as: 'customerUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },

      ],
      order: [['id', 'DESC']],
      offset: (itemPerPage * (page - 1)),
      limit: itemPerPage,
    });

    return {
      data: rows,
      page,
      size: itemPerPage,
      totalPage: Math.ceil(count / itemPerPage),
      totalItems: count,
    };
  } catch (err) {
    console.log('listAppointmentsServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const propertyCount = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;

    const whereClause = APPOINTMENT_TYPES == 'completed';
    const { count, rows } = await dbInstance.appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: dbInstance.product,
          attributes: ['id'],
          through: { attributes: [] },
        },
        {
          model: dbInstance.user,
          as: 'customerUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },

      ],
      order: [['id', 'DESC']],
      offset: (itemPerPage * (page - 1)),
      limit: itemPerPage,
    });

    return {
      data: rows,
      page,
      size: itemPerPage,
      totalPage: Math.ceil(count / itemPerPage),
      totalItems: count,
    };
  } catch (err) {
    console.log('listAppointmentsServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const appointmentDate = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;

    const whereClause = APPOINTMENT_TYPES == 'completed';
    const { count, rows } = await dbInstance.appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: dbInstance.product,
          attributes: ['id'],
          through: { attributes: [] },
        },
        {
          model: dbInstance.user,
          as: 'customerUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },

      ],
      order: [['id', 'DESC']],
      offset: (itemPerPage * (page - 1)),
      limit: itemPerPage,
    });

    return {
      data: rows,
      page,
      size: itemPerPage,
      totalPage: Math.ceil(count / itemPerPage),
      totalItems: count,
    };
  } catch (err) {
    console.log('listAppointmentsServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const dashboardData = async (reqBody, req) => {
  try {
    // const { user: agentInfo, dbInstance } = req;
    // const {
    //     filter,
    //     startDate,
    //     endDate
    // } = reqBody;


    // return {
    //     totalProperty,
    //     totalCompleted,
    //     totalSold,
    //     ttotalUpcoming,
    // };
  } catch (err) {
    console.log('dashboardDataServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

/**
   * agentCount
customerCount
propertyCount
appointmentCount
   */
