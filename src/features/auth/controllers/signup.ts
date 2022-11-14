import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import {Request, Response} from 'express';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@globals/helpers/cloudinary-upload';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const {username, email, password, avatarColor, avatarImage} = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if(checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    // we are calling signupData with prototype bcz where we are invoking this create(), there 'this' scope is diff.
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;

    if(!result.public_id) {
      throw new BadRequestError('Error while uploading file. Try again');
    }

    res.status(HTTP_STATUS.CREATED).json({message: 'User created successfully', authData});
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const {_id, username, email, password, avatarColor, uId} = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUpperCase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}
