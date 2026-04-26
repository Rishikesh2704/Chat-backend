import jwt from "jsonwebtoken";
export const createToken = async (userId, res) => {
  const token = await jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn:'15m'});
  res.cookie('token', token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly:true,
    sameSite:"strict"
  })
  return token
};


export const refreshToken = async (userId, res) => {
  const refreshToken = await jwt.sign({userId}, process.env.JWT_RefreshSecret,{expiresIn: '30d'})
  return refreshToken
}