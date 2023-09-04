const { admin } = require('../db/conn.js');
const { getUserByUID } = require('../controllers/users.js');
const { getUserProfile } = require('../models/users.js');

const authMiddleWare = (req, res, next) => {
    console.log('Request URL:', req.originalUrl)
    console.log('Request Type:', req.method);
    const authorization = req.header("authorization");
    const agent = req.header("user-agent");

    if (!agent) {
        return res.status(403).send({ response: "Unknown agent" });
    }

    if (!agent.startsWith('Zappay')) {
        return res.status(403).send({ response: "Unauthorized agent" });
    }

    if (authorization) {
        const idToken = authorization.split('Bearer ')[1];

        if (idToken == undefined) {
            console.error("Unauthenticated request!");
            return res.status(403).send({ response: "Unauthenticated request!" });
        }

        admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
                getUserProfile(decodedToken.uid).then((user) => {
                    req.user = user;
                    if (user.status == true) {
                        return next();
                    } else {
                        return res.status(403).send({ response: "User account disabled! contact support for more help." });
                    }
                });

            })
            .catch(err => {
                console.error(err.message);
                console.log("Unauthenticated request!");
                return res.status(403).send({ response: "Unauthenticated request!" });
            });
    } else {
        return res.status(403).send({ response: "Unauthenticated request!" });
    }
}

module.exports = { authMiddleWare };