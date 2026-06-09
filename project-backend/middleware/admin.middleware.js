const admin = (req, res, next) => {
  // Admin OR Owner allowed
  console.log(`🔍 Checking Admin Access | User: ${req.user.email} | Role: ${req.user.role}`);
  if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { admin };