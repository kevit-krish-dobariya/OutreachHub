import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BlacklistedToken } from './schemas/blacklist.schema';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
      @InjectModel(BlacklistedToken.name)
    private readonly blacklistedTokenModel: Model<BlacklistedToken>,
  ) {}

  // Signup for editor/viewer only
  async signup(signupDto: SignupDto) {
    const { username, email, password, phoneNumber, role } = signupDto;

    // prevent creating an admin from signup
    if (role === (UserRole as any).ADMIN) {
      throw new BadRequestException('Cannot create admin via signup');
    }

    // check uniqueness
    const exists = await this.userModel.findOne({
      $or: [{ username }, { email }],
    }).exec();

    if (exists) {
      // be specific where possible
      if (exists.username === username) throw new ConflictException('Username already exists');
      if (exists.email === email) throw new ConflictException('Email already exists');
      throw new ConflictException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = new this.userModel({
      username,
      email,
      password: hashed,
      phoneNumber,
      role,
    });

    await created.save();
    // Do not return password
    const { password: _p, ...safe } = created.toObject();
    return { message: 'Signup successful', user: safe };
  }

  // Login using username + password. Admin uses credentials from .env
  async login(loginDto: LoginDto) {
  const { username, password } = loginDto;

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (adminUser && adminPass && username === adminUser) {
    if (password !== adminPass) throw new UnauthorizedException('Invalid credentials');
    const payload = { username: adminUser, role: 'admin' };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'supersecret',
      expiresIn: '1h',
    });
    return { access_token: token, role: 'admin' };
  }

  const user = await this.userModel.findOne({ username }).exec();
  if (!user) throw new UnauthorizedException('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new UnauthorizedException('Invalid credentials');

  const payload = { sub: user.id, username: user.username, role: user.role };
  const token = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET || 'supersecret',
    expiresIn: '1h',
  });

  const { password: _p, ...safe } = user.toObject();
  return { access_token: token, role: user.role, user: safe };
}

 async validatePayload(payload: any) {
    if (!payload) return null;
    if (payload.role === 'admin') return { username: payload.username, role: 'admin' };
    if (payload.sub) {
      const user = await this.userModel.findById(payload.sub).select('-password').exec();
      return user || null;
    }
    return null;
  }

async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.blacklistedTokenModel.findOne({ token });
    return !!blacklisted;
  }

async logout(req: any) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) throw new UnauthorizedException('Authorization header missing');

  const token = authHeader.split(' ')[1];
  if (!token) throw new UnauthorizedException('Access token is missing');

  try {
    const decoded: any = this.jwtService.decode(token);
    if (!decoded || !decoded.exp) throw new UnauthorizedException('Invalid token');

    const expiresAt = new Date(decoded.exp * 1000);

    const alreadyBlacklisted = await this.blacklistedTokenModel.findOne({ token });
    if (alreadyBlacklisted) {
      return { message: 'Token already blacklisted' };
    }

    await this.blacklistedTokenModel.create({ token, expiresAt });
    return { message: 'Logged out successfully. Token blacklisted.' };
  } catch (err) {
    throw new UnauthorizedException('Invalid token');
  }
}

}
