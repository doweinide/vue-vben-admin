import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @Public()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
