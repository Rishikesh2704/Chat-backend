import jwt from "jsonwebtoken";
export const createToken = async (userId, res) => {
  const secretKey = "1243";
  const token = await jwt.sign({userId}, secretKey);
  res.cookie('token', token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly:true,
    sameSite:"strict"
  })
  return token
};
