const User = require("../schema/User");
const axios = require("axios");
const config = require("../config");

const getCohorts = async (req, res) => {
    try {
        const response = await axios.get("https://intranet.hbtn.io/api/v1/cohorts", {
            headers: {
                "Accept": "application/json",
                "X-API-KEY": config.intranet.apiKey,
                "cfclearance": "true"
            }
        });

        res.status(200).json({
            status: true,
            data: response.data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: false,
            message: error.response?.data?.message || error.message
        });
    }
};

const getMyTeam = async (req, res) => {
    try {
        const users = await User.find({}, 'username email createdAt');
        res.status(200).json({
            status: true,
            data: users.map(u => ({
                id: u._id,
                username: u.username,
                email: u.email,
                role: 'Developer',
                joinedAt: u.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    getCohorts,
    getMyTeam
};
