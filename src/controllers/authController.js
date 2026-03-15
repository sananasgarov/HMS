const User = require("../schema/User");
const jwt = require("jsonwebtoken");
const config = require("../config");

const signToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

const createTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: true,
        token,
        data: {
            user
        }
    });
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = await User.create({
            username,
            email,
            password
        });

        createTokenResponse(newUser, 201, res);
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({
                status: false,
                message: "Incorrect email or password"
            });
        }

        createTokenResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

const logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: true, message: "Logged out successfully" });
};

module.exports = {
    register,
    login,
    logout
};
