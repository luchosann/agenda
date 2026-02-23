import { execSync } from 'child_process';

beforeAll(() => {
  console.log('🔄 Reseteando base de datos de testing...');
  execSync('dotenv -e .env.test -- prisma migrate reset --force --skip-generate', { stdio: 'inherit' });
});
