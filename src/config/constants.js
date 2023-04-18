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
    CUSTOMER_APPOINTMENT: "customer_appointment"
}

export const USER_ALERT_TYPE = {
    WISHLIST_ADDED: 1,
    WISHLIST_REMOVED: 2,
    INTERESTED: 1,
    NOT_INTERESTED: 2,
    OFFER: 1,
    CUSTOMER_APPOINTMENT: 1,
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
    REGISTER_AGENT: "You have registered as agent at Usee360",
    ADMIN_REGISTER_AGENT: "Usee360 admin added you as a agent",
    REGISTER_CUSTOMER: "You have registered as customer at Usee360",
    ADMIN_REGISTER_CUSTOMER: "Usee360 admin added you as a customer",
    FORGOT_PASSWORD: "Your password change request has been received",
    RESET_PASSWORD: "Your password on Usee360 has been changed",
    AGENT_ADDED_CUSTOMER: "Agent has added you as a customer at Usee360",
    AGENT_ADDED_AS: "Agent has added you as ",
    WISHLIST_ADD: "Customer has added your property to wishlist",
    WISHLIST_REMOVE: "Customer has removed your property to wishlist",
    OFFER: "Customer has made an offer to the property",
    OFFER_UPDATE: "Agent has made an update on your offer",
    JOIN_APPOINTMENT: "Usee 360 Appointment",
    UPDATE_JOIN_APPOINTMENT: "Usee 360 Appointment updated",
    BOOK_DEMO: "Usee 360 Demo"
}

export const EMAIL_TEMPLATE_PATH = {
    REGISTER_AGENT: "email-template/register-agent.ejs",
    REGISTER_CUSTOMER: "email-template/register-customer.ejs",
    FORGOT_PASSWORD: "email-template/forgot-password.ejs",
    RESET_PASSWORD: "email-template/reset-password.ejs",
    REGISTER_TEMP_PASSWORD: "email-template/register-temp-password.ejs",
    ADMIN_REGISTER_TEMP_PASSWORD: "email-template/admin-register-temp-password.ejs",
    WISHLIST_ADD: "email-template/wishlist-add.ejs",
    WISHLIST_REMOVE: "email-template/wishlist-remove.ejs",
    OFFER: "email-template/property-offer.ejs",
    OFFER_UPDATE: "email-template/property-offer-update.ejs",
    JOIN_APPOINTMENT: "email-template/join-appointment.ejs",
    UPDATE_JOIN_APPOINTMENT: "email-template/update-join-appointment.ejs",
    AGENT_JOIN_APPOINTMENT: "email-template/agent-join-appointment.ejs",
    SUPERVISOR_JOIN_APPOINTMENT: "email-template/supervisor-join-appointment.ejs",
    BOOK_DEMO: "email-template/book-demo.ejs",
}
