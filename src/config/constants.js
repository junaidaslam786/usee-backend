export const PRODUCT_CATEGORIES = {
    PROPERTY: 1,
};

export const PRODUCT_STATUS = {
    ACTIVE: "active",
    ARCHIVED: "archived",
    DISABLED: "disabled",
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
}

export const VIRTUAL_TOUR_TYPE = {
    VIDEO: "video",
    URL: "url",
    SLIDESHOW: "slideshow"
}

export const USER_ALERT_MODE = {
    WISHLIST: "wishlist",
    INTEREST: "interest",
    OFFER: "offer"
}

export const USER_ALERT_TYPE = {
    WISHLIST_ADDED: 1,
    WISHLIST_REMOVED: 2,
    INTERESTED: 1,
    NOT_INTERESTED: 2,
    OFFER: 1,
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
    REGISTER_CUSTOMER: "You have registered as customer at Usee360",
    FORGOT_PASSWORD: "Your password change request has been received",
    RESET_PASSWORD: "Your password on Usee360 has been changed",
    AGENT_ADDED_CUSTOMER: "Agent has added you as a customer at Usee360",
    AGENT_ADDED_AS: "Agent has added you as ",
    WISHLIST_ADD: "Customer has added your property to wishlist",
    WISHLIST_REMOVE: "Customer has removed your property to wishlist",
    OFFER: "Customer has made an offer to the property",
    OFFER_UPDATE: "Agent has made an update on your offer",
    JOIN_APPOINTMENT: "Usee Homes Appointment"
}

export const EMAIL_TEMPLATE_PATH = {
    REGISTER_AGENT: "email-template/register-agent.ejs",
    REGISTER_CUSTOMER: "email-template/register-customer.ejs",
    FORGOT_PASSWORD: "email-template/forgot-password.ejs",
    RESET_PASSWORD: "email-template/reset-password.ejs",
    REGISTER_TEMP_PASSWORD: "email-template/register-temp-password.ejs",
    WISHLIST_ADD: "email-template/wishlist-add.ejs",
    WISHLIST_REMOVE: "email-template/wishlist-remove.ejs",
    OFFER: "email-template/property-offer.ejs",
    OFFER_UPDATE: "email-template/property-offer-update.ejs",
    JOIN_APPOINTMENT: "email-template/join-appointment.ejs",
}
