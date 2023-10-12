const { admin } = require('../db/conn.js');
const appCheckMiddleWare = async (req, res, next) => {
  console.log('Request URL:', req.originalUrl)
  console.log('Request Type:', req.method);
  // Debug Token "280CD07F-8444-4384-88AB-A3A8A1EA0F9D"

  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    res.status(401);
    return next("-Unauthorized-");
  }

  try {

    const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken);

    // If verifyToken() succeeds, continue with the next middleware
    // function in the stack.
    return next();
  } catch (err) {
    res.status(401);
    console.error(err);
    return next("**Unauthorized");
  }

}

module.exports = { appCheckMiddleWare };