import jwt from "jsonwebtoken";
export const createToken = async (userId, res) => {
  const token = await jwt.sign({userId}, process.env.JWT_SECRET);
  res.cookie('token', token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly:true,
    sameSite:"strict"
  })
  return token
};
