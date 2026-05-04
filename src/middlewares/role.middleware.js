const role = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());
    
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ error: "Akses ditolak" });
    }
    next();
  };
};

const isAdmin = role(["admin"]);

module.exports = { role, isAdmin };