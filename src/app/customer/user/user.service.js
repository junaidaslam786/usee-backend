import {
  AGENT_TYPE,
  EMAIL_SUBJECT,
  EMAIL_TEMPLATE_PATH,
  USER_TYPE,
} from '@/config/constants';
import { utilsHelper, mailHelper } from '@/helpers';
import db from '@/database';
import * as userService from '../../user/user.service';
const path = require("path")
const ejs = require("ejs");
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import timezoneJson from "../../../../timezones.json";

export async function createProductVisit(req, res) {
  try {
    const { userId: customerId } = req.params;
    const { productId, distance } = req.body;
    // const { id: agentId } = req.user;
    // const { id: customerId } = await userService.getUserById(userId);

    const productVisit = await db.productVisit.create({
      productId,
      agentId,
      customerId,
      distance,
    });

    res.status(200).json({
      success: true,
      message: 'Product visit created successfully',
      data: productVisit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message,
    });
  }
}