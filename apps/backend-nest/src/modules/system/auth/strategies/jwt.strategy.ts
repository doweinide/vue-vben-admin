import { UserService } from '@/modules/system/user/user.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const userResponse = await this.userService.findOne(payload.sub);
    if (!userResponse || !userResponse.data) {
      return null;
    }
    const user = userResponse.data;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      deptId: user.deptId,
      status: user.status,
      userRoles: user.userRoles,
      createTime: user.createdAt,
      updateTime: user.updatedAt,
    };
  }
}
