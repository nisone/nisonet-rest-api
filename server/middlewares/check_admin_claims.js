const { admin } = require('../db/conn.js');
const { getUserByUID } = require('../controllers/users.js');
const { getUserProfile } = require('../models/users.js');

const isAdmin = async (req, res, next) => {
  const authorization = req.header("authorization");

  try {
    if (authorization) {
      const idToken = authorization.split('Bearer ')[1];

      if (idToken == undefined) {
        console.error("Unauthenticated request!");
        return res.status(403).send({ response: "Unauthenticated request!" });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (decodedToken.admin !== true) {
        return res.status(403).send({
          error: "Request not authorized. User must be a admin to fulfill request."
        });
      }

      return next;
    } else {
      return res.status(403).send({ response: "Unauthenticated request!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `Error verifying token` });
  }
}

module.exports = { isAdmin };