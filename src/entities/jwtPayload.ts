import { Types } from "mongoose";

type JwtPayload = {
  _id: Types.ObjectId;
  iat: number;
  exp: number;
};

export default JwtPayload;
