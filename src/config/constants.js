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
    FEATURE_IMAGE: "uploads/properties/images",
    VIDEO_TOUR: "uploads/properties/vrvideos",
    DOCUMENT: "uploads/properties/documents",
    PROFILE_LOGO: "uploads/user/images",
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