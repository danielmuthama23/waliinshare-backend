// controllers/analyticsController.js
import SharePrice from "../models/SharePrice.js";
import CompanyGrowth from "../models/CompanyGrowth.js";
import User from "../models/User.js";

// Utility: format date into daily / weekly / monthly
const formatDate = (date, timeframe) => {
  const d = new Date(date);
  //console.log("UserId:", userId, "Timeframe:", timeframe);
  console.log("Timeframe used:", timeframe);
  if (timeframe === "daily") {
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  if (timeframe === "weekly") {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${week}`;
  }

  if (timeframe === "monthly") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return d.toISOString().split("T")[0];
};

export const getAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = "daily" } = req.query;

    // fetch share prices + growth trends
    const sharePrices = await SharePrice.find().sort({ date: 1 });
    const companyGrowth = await CompanyGrowth.find().sort({ date: 1 });

    // get user info
    const user = await User.findById(userId);
    console.log("Fetched User:", user);
    const userShares = user?.numberOfShares || 0;

    // group data
    const grouped = {};

    sharePrices.forEach((sp) => {
      const key = formatDate(sp.date, timeframe);
      if (!grouped[key]) {
        grouped[key] = { date: key, totalPrice: 0, count: 0, companyGrowth: 0 };
      }
      grouped[key].totalPrice += sp.price;
      grouped[key].count++;
    });

    companyGrowth.forEach((cg) => {
      const key = formatDate(cg.date, timeframe);
      if (!grouped[key]) {
        grouped[key] = { date: key, totalPrice: 0, count: 0, companyGrowth: 0 };
      }
      grouped[key].companyGrowth += cg.growth;
    });

    // transform result
    const analyticsData = Object.values(grouped).map((g) => ({
      date: g.date,
      price: (g.totalPrice / (g.count || 1)) * userShares,
      companyGrowth: g.companyGrowth / (g.count || 1),
    }));

    res.json(analyticsData);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};
