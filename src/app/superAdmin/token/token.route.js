import { Router } from 'express';
import * as tokensController from './token.controller';
const router = Router();

router.get('/list', tokensController.listTokens);
router.get('/batches/:id', tokensController.viewTokenBatchDetail);
router.post('/users/:userId/tokens', tokensController.addTokensToUser);

export default router;
