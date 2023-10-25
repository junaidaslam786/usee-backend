import { Sequelize } from 'sequelize';

import * as config from '@/config/sequelize';

// import models
import agentModel from './models/agent';
import cmsPages from './models/cms-page';
import cmsAssets from './models/cms-asset';
import cmsPageCategoryFields from './models/cms-page-category-field';
import cmsCommunity from './models/cms-community';
import cmsCommunityPost from './models/cms-community-post';
import cmsCommunityPostComment from './models/cms-community-post-comment';
import cmsCommunityCategoryField from './models/cms-community-category-field';
import agentAvailabilityModel from './models/agent-availability';
import agentBranchModel from './models/agent-branch';
import agentTimeSlotModel from './models/agent-time-slot';
import categoryModel from './models/category';
import categoryFieldModel from './models/category-field';
import cityModel from './models/city';
import stateModel from './models/state';
import countryModel from './models/country';
import customerLogModel from './models/customer-log';
import customerWishlistModel from './models/customer-wishlist';
import permissionModel from './models/permission';
import productModel from './models/product';
import productAllocationModel from './models/product-allocation';
import productDocumentModel from './models/product-document';
import productImageModel from './models/product-image';
import productMetaTagModel from './models/product-meta-tag';
import productRemoveReasonModel from './models/product-remove-reason';
import productRemoveRequestModel from './models/product-remove-request';
import appoinmentModel from './models/appointment';
import roleModel from './models/role';
import userModel from './models/user';
import userAlertModel from './models/user-alert';
import userLogModel from './models/user-log';
import appointmentProductModel from './models/appointment-products';
import productOfferModel from './models/product-offer';
import productSnagList from './models/product-snag-list';
import productSnagListItem from './models/product-snag-list-item';
import bookDemo from './models/book-demo';
import productLogModel from './models/product-log';
import appointmentLogModel from './models/appointment-log';
import appointmentNoteModel from './models/appointment-note';
import agentAccessLevelModel from './models/agent-access-level';
import userCallBackgroundImageModel from './models/user-call-background-image';
import appConfigurationModel from './models/app-configuration';
import subscriptionModel from './models/subscription';
import userSubscriptionModel from './models/user-subscription';
import featureModel from './models/feature';
import tokenModel from './models/token';
import tokenTransactionModel from './models/token-transaction';

// Configuration
const env = process.env.NODE_ENV;
const sequelizeConfig = config[env];

// Create sequelize instance
const sequelize = new Sequelize(sequelizeConfig);

// Import all model files
const modelDefiners = [
  agentModel,
  cmsPages,
  cmsAssets,
  cmsPageCategoryFields,
  cmsCommunity,
  cmsCommunityPost,
  cmsCommunityPostComment,
  cmsCommunityCategoryField,
  agentAvailabilityModel,
  agentBranchModel,
  agentTimeSlotModel,
  categoryModel,
  categoryFieldModel,
  cityModel,
  stateModel,
  countryModel,
  customerLogModel,
  customerWishlistModel,
  permissionModel,
  productModel,
  productAllocationModel,
  productDocumentModel,
  productImageModel,
  productMetaTagModel,
  productRemoveReasonModel,
  productRemoveRequestModel,
  roleModel,
  userModel,
  userAlertModel,
  userLogModel,
  appoinmentModel,
  appointmentProductModel,
  productOfferModel,
  productSnagList,
  productSnagListItem,
  bookDemo,
  productLogModel,
  appointmentLogModel,
  appointmentNoteModel,
  agentAccessLevelModel,
  userCallBackgroundImageModel,
  subscriptionModel,
  userSubscriptionModel,
  featureModel,
  tokenModel,
  tokenTransactionModel,
  appConfigurationModel,
];

// eslint-disable-next-line no-restricted-syntax
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// Associations
Object.keys(sequelize.models)
  .forEach((modelName) => {
    if (sequelize.models[modelName].associate) {
      sequelize.models[modelName].associate(sequelize.models);
    }
  });

export default sequelize;
