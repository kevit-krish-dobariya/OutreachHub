import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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

    // If matches admin credentials from env, issue admin token
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminUser && adminPass && username === adminUser) {
      if (password !== adminPass) throw new UnauthorizedException('Invalid credentials');
      const payload = { username: adminUser, role: 'admin' };
      const token = this.jwtService.sign(payload);
      return { access_token: token, role: 'admin' };
    }

    // Otherwise check DB user
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    const { password: _p, ...safe } = user.toObject();
    return { access_token: token, role: user.role ,user: safe };
  }

  // Helper to validate JWT payload (optional use)
  async validatePayload(payload: any) {
    if (!payload) return null;
    if (payload.role === 'admin') return { username: payload.username, role: 'admin' };
    if (payload.sub) {
      const user = await this.userModel.findById(payload.sub).select('-password').exec();
      return user || null;
    }
    return null;
  }
}
