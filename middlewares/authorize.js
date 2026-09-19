// middlewares/authorize.js

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {Array<string>} allowedRoles - List of permitted roles (e.g., ['landlord', 'caretaker'])
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Ensure user is authenticated via JWT middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in to access this resource.",
      });
    }

    let userRoles = [];

    // 2. Safely parse roles from req.user
    try {
      if (typeof req.user.role === "string") {
        const parsed = JSON.parse(req.user.role);
        userRoles = parsed.roles || [];
      } else if (req.user.role && Array.isArray(req.user.role.roles)) {
        userRoles = req.user.role.roles;
      } else if (Array.isArray(req.user.role)) {
        userRoles = req.user.role;
      }
    } catch (error) {
      console.error("Role parsing error in authorization middleware:", error);
      userRoles = [];
    }

    // 3. Agency role acts as super-admin (inherits access to all views)
    const isAgency = userRoles.includes("agency");
    const hasRequiredRole = userRoles.some((role) => allowedRoles.includes(role));

    if (isAgency || hasRequiredRole) {
      return next();
    }

    // 4. Deny access if user lacks permission
    return res.status(403).json({
      success: false,
      message: "Forbidden: You do not have permission to access this endpoint.",
    });
  };
};

module.exports = authorize;