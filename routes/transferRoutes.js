import express from 'express';
import Transfer from '../models/transfer.js';
import {
    createTransfer,
    getAllTransfers,
    updateTransferStatus,
    recipientRespondTransfer,
    getTransfersForRecipient
  } from '../controllers/transferController.js';

const router = express.Router();
router.post('/', createTransfer);
router.get('/', getAllTransfers);
router.get('/recipient/:userId', getTransfersForRecipient);
router.put('/:id/status', updateTransferStatus);
router.patch('/:id/respond', recipientRespondTransfer);

export default router;