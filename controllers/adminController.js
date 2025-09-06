import User from '../models/User.js';
import Purchase from '../models/Purchase.js';


// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sub-admins
export const getSubAdmins = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const subAdmins = await User.find({ role: 'subadmin' }).select('-password');
    res.json(subAdmins);
  } catch (error) {
    console.error('Get sub-admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user role (Admin/User)
export const toggleUserRole = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({ message: `User is now ${user.isAdmin ? 'Admin' : 'User'}` });
  } catch (err) {
    console.error('Toggle role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user active/inactive status
export const toggleUserStatus = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User is now ${user.isActive ? 'Active' : 'Inactive'}` });
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all pending purchases
export const getPendingPurchases = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const purchases = await Purchase.find({ status: 'pending' }).populate('userId', 'fullName email phone');
    res.json(purchases);
  } catch (err) {
    console.error("Error fetching pending purchases:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all verified purchases
export const getVerifiedPurchases = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const purchases = await Purchase.find({ status: 'verified' }).populate('userId', 'fullName email phone');
    res.json(purchases);
  } catch (err) {
    console.error("Error fetching verified purchases:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all rejected purchases
export const getRejectedPurchases = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const purchases = await Purchase.find({ status: 'rejected' }).populate('userId', 'fullName email phone');
    res.json(purchases);
  } catch (err) {
    console.error("Error fetching rejected purchases:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update purchase status (verify or reject)
export const updatePurchaseStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    purchase.status = status;
    await purchase.save();

    res.json({ message: `Purchase ${status}` });
  } catch (err) {
    console.error("Error updating purchase status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};


export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('userId', 'fullName email');
    res.status(200).json(purchases);
  } catch (err) {
    console.error('Admin Get All Purchases Error:', err);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
};

export const getUnderageUsers = async (req, res) => {
  try {
    const today = new Date();
    const cutoffDate = new Date(today.setFullYear(today.getFullYear() - 18));

    const users = await User.find({
      dateOfBirth: { $gt: cutoffDate }, // younger than 18
      'guardianDetails.name': { $exists: true, $ne: null }
    }).select('fullName email phone dateOfBirth guardianDetails createdAt');

    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching underage users:', err);
    res.status(500).json({ message: 'Failed to fetch underage users' });
  }
};
