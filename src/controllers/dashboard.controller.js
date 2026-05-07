const dashboardService = require("../services/dashboard.service");

exports.getOverview = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const data = await dashboardService.getOverview({
      search,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(data);
  } catch (err) {
    console.error("Dashboard Controller Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
