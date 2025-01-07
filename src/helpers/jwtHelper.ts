import jwt, { JwtPayload, Secret } from "jsonwebtoken";

//* token generate method >>>>>>>>>>>>>>>>>>>>>>

const generateToken = (payload: object, secret: Secret, expire: string) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expire,
  });
  return token;
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = { generateToken, verifyToken };
