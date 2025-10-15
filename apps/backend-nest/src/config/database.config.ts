import process from 'node:process';

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'file:./dev.db',
}));
