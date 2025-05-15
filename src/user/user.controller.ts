import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { User } from './user.entity';
import { ProfileDTO } from './profile.dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get()
  async getUser(@Req() request: Request): Promise<ProfileDTO> {
    const userJwtPayload: JwtPayloadDto = request['user'];
    const user: User | null = await this.userService.findByEmail(
      userJwtPayload.email,
    );
    if (user == null) {
      throw new NotFoundException();
    }
    return {
      username: user.username,
      email: user.email,
      bio: user.bio,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
