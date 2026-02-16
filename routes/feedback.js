
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

// Optional auth: User doesn't STRICTLY need to be logged in to give feedback, 
// but we want to track them if they are.
// We'll use a middleware wrapper that doesn't block if token is missing, 
// but populates req.user if present.
const optionalAuth = (req, res, next) => {
    // Re-use existing auth logic or just check header manually if simple
    // For now, let's assume we want them logged in for this specific app 
    // based on previous context (it's a car customization app, likely requires login).
    // If not, we can remove `auth`.
    // Let's stick to `auth` for now as per plan, assuming logged-in users.
    auth(req, res, next);
};

// Actually, looking at the plan: "Use auth middleware to ensure only logged-in users can submit (optional, but recommended)."
// Given the userController uses `req.user.id`, strict auth is safer for now to avoid null pointer issues if we expected it.
// However, the SQL allows NULL user_id.
// Let's make a "soft" auth or just use `auth` if we decide strictly logged in.
// I will use standard `auth` for now to be safe and consistent with other routes.

router.post('/', auth, feedbackController.createFeedback);
router.get('/', auth, feedbackController.getAllFeedbacks); // Admin or authorized view

module.exports = router;
