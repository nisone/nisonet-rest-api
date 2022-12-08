const {admin} = require('../db/conn.js');
const { getUserByUID } = require('../controllers/users.js');
const { getUserProfile } = require('../models/users.js');

const authMiddleWare = (req, res, next) => {
    console.log('Request URL:', req.originalUrl)
    console.log('Request Type:', req.method);
    const authorization = req.header("authorization");
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
                return next();
            });
            
        })
        .catch(err => {
            console.error(err.message);
            console.log("Unauthenticated request!");
            return res.status(403).send({ response: "Unauthenticated request!" });
        });
    }else{
        return res.status(403).send({ response: "Unauthenticated request!" });
    }
}

module.exports = {authMiddleWare};