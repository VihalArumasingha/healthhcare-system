module.exports = (req, res, next) => {
    req.user = {
        id: "doctor123",
        role: "doctor"
    };
    next();
};