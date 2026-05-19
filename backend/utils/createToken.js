import jwt from "jsonwebtoken";
export const createToken = async (userId, res) => {
  const token = await jwt.sign({userId}, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn:'1m'});
  res.cookie('accessToken', token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly:true,
    sameSite:"strict"
  })
  return token
};


export const refreshToken = async (userId, res) => {
  const refreshToken = await jwt.sign({userId}, process.env.JWT_REFRESH_TOKEN_SECRET,{expiresIn: '30d'})
  res.cookie('refreshToken',refreshToken,{
    httpOnly:true,
    sameSite:true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
  return refreshToken
}