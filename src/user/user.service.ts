import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.findOne({ where: { email } });
    return user;
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    const user = this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    return user;
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
