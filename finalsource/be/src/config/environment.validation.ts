interface Environment {
  NODE_ENV?: string;
  PORT?: string;
  CORS_ORIGINS?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_DATABASE?: string;
  JWT_SECRET?: string;
  [key: string]: string | undefined;
}

const required = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET'] as const;

export function validateEnvironment(environment: Environment): Environment {
  const missing = required.filter((key) => !environment[key]?.trim());
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  const nodeEnv = environment.NODE_ENV ?? 'development';
  if (nodeEnv !== 'development') throw new Error('NODE_ENV must be development for this research runtime');
  for (const [name, value] of [['PORT', environment.PORT ?? '3000'], ['DB_PORT', environment.DB_PORT ?? '3306']]) {
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error(`${name} must be a valid TCP port`);
  }
  const secret = environment.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith('replace-') || secret.startsWith('change-')) {
    throw new Error('JWT_SECRET must be a strong external secret');
  }
  const origins = environment.CORS_ORIGINS?.split(',').map((value) => value.trim()) ?? [];
  if (origins.length === 0 || origins.includes('*')) throw new Error('CORS_ORIGINS must contain explicit trusted origins');
  return environment;
}
