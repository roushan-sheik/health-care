import jwt from "jsonwebtoken";

export const generateToken = (payload: any, secret: string, expire: string) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expire,
  });
  return token;
};
