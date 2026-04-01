import jwt from "jsonwebtoken";

export const createToken = async (userId) => {
  const secretKey = "1243";
  const token = await jwt.sign(userId, secretKey);
  return token
};
