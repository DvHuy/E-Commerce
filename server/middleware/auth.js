import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken || req?.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).json({
        message: "Please provide token",
        error: true,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    if (!decoded) {
      res.status(401).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export default auth;
