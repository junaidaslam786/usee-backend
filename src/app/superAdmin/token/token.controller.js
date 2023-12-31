import * as tokenService from './token.service';

export const listTokens = async (req, res) => {
  try {
    const batches = await tokenService.listTokens();
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const viewTokenBatchDetail = async (req, res) => {
  try {
    const batchDetail = await tokenService.getTokenBatch(req.params.id);
    res.json(batchDetail);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addTokensToUser = async (req, res) => {
  try {
    const tokensAdded = await tokenService.addTokensToUser(req.params.userId, req.body.amount);
    res.json(tokensAdded);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
