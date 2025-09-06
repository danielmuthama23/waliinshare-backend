import User from '../models/User.js';
import router from '../routes/authRoutes.js';
import Transfer from '../models/transfer.js';
import Purchase from '../models/Purchase.js';

// GET /api/users/me
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTotalShares = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get total purchased shares
    const purchases = await Purchase.find({ user: userId });
    const purchasedShares = purchases.reduce((sum, p) => sum + p.shares, 0);

    // Get total accepted transfers
    const acceptedTransfers = await Transfer.find({
      toUserId: userId,
      status: 'approved'
    });
    const transferredInShares = acceptedTransfers.reduce((sum, t) => sum + t.sharesToTransfer, 0);

    const totalShares = purchasedShares + transferredInShares;

    res.json({
      totalShares,
      purchasedShares,
      transferredInShares
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default router;