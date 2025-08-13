import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "abc123",
    });
  }

  // payload is what we signed in login()
  async validate(payload: any) {
    // return the user-like object attached to request.user
    // if admin token, payload.role === 'admin'
    const validated = await this.authService.validatePayload(payload);
    return validated ?? payload;
  }
}
