const jwt = require('jsonwebtoken');
const config = require('config');

//middleware function takes three parmeters req, res, next
module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token , Access denied' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'token is not valid' });
  }
};
