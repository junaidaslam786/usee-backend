import db from '@/database';

export const listTokenTransactions = async (filters) => {
  const transactions = await db.tokenTransaction.findAll({ where: filters });
  return transactions;
};

export const getTokenTransaction = async (id) => {
  const transaction = await db.tokenTransaction.findByPk(id);
  return transaction;
};
