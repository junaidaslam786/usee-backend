export const PRODUCT_CATEGORIES = {
    PROPERTY: 1,
};

export const PRODUCT_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    UNDER_OFFER: "under_offer",
    SOLD: "sold",
    REMOVED: "removed"
};

export const USER_TYPE = {
    ADMIN: "admin",
    AGENT: "agent",
    CUSTOMER: "customer",
};

export const AGENT_TYPE = {
    AGENT: "agent",
    MANAGER: "manager",
    STAFF: "staff",
};

export const PROPERTY_ROOT_PATHS = {
    FEATURE_IMAGE: "properties/images",
    VIDEO_TOUR: "properties/vrvideos",
    DOCUMENT: "properties/documents",
    PROFILE_LOGO: "user/images",
    PROFILE_DOCUMENT: "user/document",
    CHAT_PATH: "chat"
}

export const VIRTUAL_TOUR_TYPE = {
    VIDEO: "video",
    URL: "url",
    SLIDESHOW: "slideshow"
}

export const USER_ALERT_MODE = {
    WISHLIST: "wishlist",
    INTEREST: "interest",
    OFFER: "offer",
    APPOINTMENT: "appointment",
    SNAGLIST: "snag_list",
}

export const USER_ALERT_TYPE = {
    WISHLIST_ADDED: 1,
    WISHLIST_REMOVED: 2,
    INTERESTED: 1,
    NOT_INTERESTED: 2,
    OFFER: 1,
    OFFER_DELETED: 2,
    APPOINTMENT: 1,
    SNAGLIST_UPDATED: 1,
    SNAGLIST_APPROVED: 2,
}

export const OFFER_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
}

export const APPOINTMENT_TYPES = {
    UPCOMING: "upcoming",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
}

export const EMAIL_SUBJECT = {
    REGISTER_AGENT: "You have registered as trader at Usee360",
    ADMIN_REGISTER_AGENT: "Usee360 admin added you as a trader",
    REGISTER_CUSTOMER: "You have registered as customer at Usee360",
    ADMIN_REGISTER_CUSTOMER: "Usee360 admin added you as a customer",
    FORGOT_PASSWORD: "Your password change request has been received",
    ADMIN_FORGOT_PASSWORD: "Your password change request has been received",
    RESET_PASSWORD: "Your password on Usee360 has been changed",
    ADMIN_RESET_PASSWORD: "Your password on Usee360 has been changed",
    AGENT_ADDED_CUSTOMER: "Trader has added you as a customer at Usee360",
    AGENT_ADDED_AS: "Trader has added you as ",
    WISHLIST_ADD: "Customer has added your property to wishlist",
    WISHLIST_REMOVE: "Customer has removed your property to wishlist",
    OFFER: "Customer has made an offer to the property",
    OFFER_UPDATE: "Trader has made an update on your offer",
    JOIN_APPOINTMENT: "Usee 360 Appointment",
    UPDATE_JOIN_APPOINTMENT: "Usee 360 Appointment updated",
    BOOK_DEMO: "Usee 360 Demo",
    SNAGLIST_UPDATE: "Trader has made an update in the snaglist",
    SNAGLIST_APPROVE: "Trader has approved the snaglist",
    COMPLETED_APPOINTMENT: "Usee 360 Appointment Completed",
    CANCELLED_APPOINTMENT: "Usee 360 Appointment Cancelled",
    SEND_OTP: "Usee 360 One Time Passcode (OTP)",
}

export const EMAIL_TEMPLATE_PATH = {
    REGISTER_AGENT: "email-template/register-agent.ejs",
    REGISTER_CUSTOMER: "email-template/register-customer.ejs",
    FORGOT_PASSWORD: "email-template/forgot-password.ejs",
    ADMIN_FORGOT_PASSWORD: "email-template/admin-forgot-password.ejs",
    RESET_PASSWORD: "email-template/reset-password.ejs",
    ADMIN_RESET_PASSWORD: "email-template/admin-reset-password.ejs",
    REGISTER_TEMP_PASSWORD: "email-template/register-temp-password.ejs",
    ADMIN_REGISTER_TEMP_PASSWORD: "email-template/admin-register-temp-password.ejs",
    WISHLIST_ADD: "email-template/wishlist-add.ejs",
    WISHLIST_REMOVE: "email-template/wishlist-remove.ejs",
    OFFER: "email-template/property-offer.ejs",
    OFFER_UPDATE: "email-template/property-offer-update.ejs",
    JOIN_APPOINTMENT: "email-template/join-appointment.ejs",
    UPDATE_JOIN_APPOINTMENT: "email-template/update-join-appointment.ejs",
    AGENT_JOIN_APPOINTMENT: "email-template/agent-join-appointment.ejs",
    ALLOTED_AGENT_JOIN_APPOINTMENT: "email-template/alloted-agent-join-appointment.ejs",
    BOOK_DEMO: "email-template/book-demo.ejs",
    SNAGLIST_UPDATE: "email-template/property-snaglist-update.ejs",
    AGENT_STATUS_UPDATE_APPOINTMENT: "email-template/agent-status-update-appointment.ejs",
    CUSTOMER_STATUS_UPDATE_APPOINTMENT: "email-template/customer-status-update-appointment.ejs",
    SEND_OTP: "email-template/send-otp.ejs",
}

export const DASHBOARD_FILTER = {
    CUSTOM: "custom",
    TODAY: "today",
    YESTERDAY: "yesterday",
    CURRENT_MONTH: "this_month",
    PAST_MONTH: "past_month",
    PAST_3_MONTH: "past_3_months"
};

export const APPOINTMENT_STATUS = {
    PENDING: "pending",
    INPROGRESS: "inprogress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const APPOINTMENT_LOG_TYPE = {
    JOINED: "joined",
    LEFT: "left",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const PRODUCT_LOG_TYPE = {
    WISHLIST_ADDED: "wishlist_added",
    WISHLIST_REMOVED: "wishlist_removed",
    INTERESTED: "interested",
    NOT_INTERESTED: "not_interested",
    OFFER: "offer_made",
    OFFER_REJECTED: "offer_rejected",
    OFFER_APPROVED: "offer_approved",
    APPOINTMENT_CREATED: "appointment_created",
    APPOINTMENT_COMPLETED: "appointment_completed",
    APPOINTMENT_CANCELLED: "appointment_cancelled",
    SNAGLIST_UPDATED: "snaglist_added",
    SNAGLIST_APPROVED: "snaglist_approved",
    VIEWED: "viewed",
};