import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore Next.js default build artifacts and generated Prisma client
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
    'generated/**',
  ]),

  // Extend Next.js ESLint configs
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
