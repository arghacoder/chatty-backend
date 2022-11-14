import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
// import { IUserDocument } from '@user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload; // overriding pre defined npm package interface.
    }
  }
}

export interface AuthPayload {
  userId: string; // needed for database access.
  uId: string; // needed for accessing redis cache
  email: string;
  username: string;
  avatarColor: string;
  iat?: number;
}

// this model is for mongodb schema...
export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ISignUpData {
  _id: ObjectId;
  uId: string;
  email: string;
  username: string;
  password: string;
  avatarColor: string;
}

export interface IAuthJob {
  value?: string | IAuthDocument;
}
