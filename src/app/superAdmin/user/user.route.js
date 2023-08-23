/* eslint-disable max-len */
import { Router } from "express";

import { isAuthenticated, validate } from "@/middleware";
import * as userController from "./user.controller";
import * as userValidations from "./user.request";

const router = Router();
router.post("/upload-image", isAuthenticated, userController.uploadUserProfileImage);

router.get("/superadmin-details", isAuthenticated, userController.getSuperAdminDetails);
// router.put('/update',isAuthenticated, userController.updateSuperAdminDetails)
// router.put('/update', isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser);
router.put("/update", isAuthenticated, userController.updateCurrentUser);
router.get("/list-all", isAuthenticated, userController.listAdminUsers);
router.get("/customer/list-customer", isAuthenticated, userController.listCustomerUsers);
router.get("/total-customer", isAuthenticated, userController.totalCustomers);
router.post("/user/:id", isAuthenticated, userController.getUserById);
router.delete("/user/:id", isAuthenticated, userController.deleteCurrentUser);

export default router;