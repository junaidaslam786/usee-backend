import * as tokenTransactionService from './tokenTransaction.service';

export const listTokenTransactions = async (req, res) => {
  try {
    const filters = req.query; 
    const transactions = await tokenTransactionService.listTokenTransactions(filters);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const viewTokenTransactionDetail = async (req, res) => {
  try {
    const transaction = await tokenTransactionService.getTokenTransaction(req.params.id);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
