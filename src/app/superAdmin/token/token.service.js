import db from '@/database';

export const getTokenMetrics = async () => {
  // This is a placeholder. You may need to compute several DB queries to get the metrics you want.
  const totalTokensSold = await db.token.sum('amount');
  const totalTokensUsed = await db.token.sum('usedAmount');
  
  return {
    totalTokensSold,
    totalTokensUsed
  };
};

export const listTokens = async () => {
  const tokens = await db.models.token.findAll();
  return tokens;
};

export const getTokenBatch = async (id) => {
  const batch = await db.tokenBatch.findByPk(id);
  return batch;
};

export const addTokensToUser = async (userId, amount) => {
  const user = await db.user.findByPk(userId);
  user.tokenBalance += amount; 
  await user.save();
  return { newBalance: user.tokenBalance };
};
