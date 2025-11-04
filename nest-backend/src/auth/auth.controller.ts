import { Controller, Post, Body, Req, UseGuards, Headers, Get, UnauthorizedException, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

@Get('unassigned')
@UseGuards(JwtAuthGuard)
async getUnassignedUsers(@Req() req) {
  if (req.user.role !== 'admin') {
    throw new UnauthorizedException('Only admins can view unassigned users');
  }
  return this.authService.findUnassignedUsers();
}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    return this.authService.logout(req);
  }

   @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
