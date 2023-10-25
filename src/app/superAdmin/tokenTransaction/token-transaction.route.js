import { Router } from 'express';
import * as tokenTransactionsController from './tokenTransactions.controller';
const router = Router();

router.get('/', tokenTransactionsController.listTokenTransactions);
router.get('/:id', tokenTransactionsController.viewTokenTransactionDetail);

export default router;
