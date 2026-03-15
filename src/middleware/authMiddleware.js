const jwt = require("jsonwebtoken");
const User = require("../schema/User");
const config = require("../config");

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({
                status: false,
                message: "You are not logged in. Please log in to get access."
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: false,
                message: "The user belonging to this token no longer exists."
            });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "Invalid token. Please log in again."
        });
    }
};

module.exports = { protect };
