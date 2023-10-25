import { Router } from 'express';
import * as tokensController from './token.controller';
const router = Router();

router.get('/metrics', tokensController.tokenMetrics);
router.get('/batches', tokensController.listTokenBatches);
router.get('/batches/:id', tokensController.viewTokenBatchDetail);
router.post('/users/:userId/tokens', tokensController.addTokensToUser);

export default router;
