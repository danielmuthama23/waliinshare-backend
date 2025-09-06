import Transfer from '../models/transfer.js';
import User from '../models/User.js';

// Create a new transfer
export const createTransfer = async (req, res) => {
  try {
    const { fromUserId, toUserId, toUserEmail, sharesToTransfer, pricePerShare } = req.body;

    // You can optionally validate if seller has enough shares here

    const transfer = new Transfer({
      fromUserId,
      toUserId,
      toUserEmail,
      sharesToTransfer,
      pricePerShare,
      status: 'Pending',        // Initial status
      buyerApproval: false,     // Track buyer approval
      adminApproval: false,     // Track admin approval
    });

    await transfer.save();

    res.status(201).json({ message: 'Transfer request created', transfer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all transfers
export const getAllTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find()
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Accept or reject by recipient
export const recipientRespondTransfer = async (req, res) => {
  try {
    const { status } = req.body; // expected: 'AcceptedByRecipient' or 'RejectedByRecipient'
    const { id } = req.params;

    if (!['AcceptedByRecipient', 'RejectedByRecipient'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transfer = await Transfer.findById(id);
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });

    if (transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Transfer is not in a pending state' });
    }

    if (status === 'AcceptedByRecipient') {
      transfer.buyerApproval = true;
      transfer.status = 'BuyerApproved';
    } else if (status === 'RejectedByRecipient') {
      transfer.buyerApproval = false;
      transfer.status = 'RejectedByRecipient';
    }

    await transfer.save();

    res.json({ message: `Transfer ${status}`, transfer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pending transfers for a recipient
export const getTransfersForRecipient = async (req, res) => {
  const userId = req.params.userId;

  try {
    const transfers = await Transfer.find({
      toUserId: userId,
      status: 'Pending',
    }).populate('fromUserId', 'fullName email');

    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transfers', error: err.message });
  }
};

// Approve or reject transfer
export const updateTransferStatus = async (req, res) => {
  try {
    console.log('--- Incoming Request ---');
    console.log('Params:', req.params);          // logs { id: ... }
    console.log('Body:', req.body);   
    
    const { status } = req.body; // 'ApprovedByAdmin' or 'RejectedByAdmin'
    const { id } = req.params;

    if (!['ApprovedByAdmin', 'RejectedByAdmin'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const transfer = await Transfer.findById(id)
      .populate('fromUserId')
      .populate('toUserId');
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    // Only allow admin approval if buyer approved first
    if (status === 'ApprovedByAdmin' && !transfer.buyerApproval) {
      return res.status(400).json({ message: 'Buyer approval is required before admin approval' });
    }

    if (status === 'ApprovedByAdmin') {
      const sender = transfer.fromUserId;  // already populated user object
      const receiver = transfer.toUserId;  // already populated user object


      if (!sender || !receiver) {
        return res.status(404).json({ message: 'Sender or receiver not found' });
      }

      console.log('Sender shares (before):', sender.numberOfShares);
      console.log('Shares to transfer:', transfer.sharesToTransfer);  

      if (sender.numberOfShares < transfer.sharesToTransfer) {
        return res.status(400).json({ message: 'Sender has insufficient shares' });
      }

      // Deduct and add shares now (final stage)
      sender.numberOfShares -= transfer.sharesToTransfer;
       receiver.numberOfShares += transfer.sharesToTransfer;
      // console.log('Sender shares:', sender.numberOfShares);
      // console.log('Shares to transfer:', transfer.sharesToTransfer);

      await sender.save();
      await receiver.save();

      transfer.adminApproval = true;
      transfer.status = 'Completed';
      transfer.certificateId = `CERT-${Date.now()}`;
      transfer.oldCertificateSurrendered = true;

    } else if (status === 'RejectedByAdmin') {
      transfer.adminApproval = false;
      transfer.status = 'RejectedByAdmin';
    }

    await transfer.save();

    res.json({ message: `Transfer request ${status}`, transfer });
  } catch (err) {
    console.error('Error updating transfer status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};