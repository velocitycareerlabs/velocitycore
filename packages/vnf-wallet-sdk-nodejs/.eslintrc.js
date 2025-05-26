/*
 * Copyright 2025 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
// TODO refactor style of the sdk to use the root eslint style
module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        BigInt: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
    plugins: [
        'prettier',
        'better-mutation',
        'prefer-arrow-functions',
        'autofix',
        'unused-imports',
    ],
    overrides: [
        {
            files: [
                '**/*.test.js',
                '**/*.test.jsx',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/test/**/*.js',
                '**/test/**/*.ts',
                '**/tests/**/*.js',
                '**/tests/**/*.ts',
            ],
            rules: {
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            settings: {
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx'],
                },
                'import/resolver': {
                    node: {
                        extensions: ['.js', '.jsx', '.ts', '.tsx'],
                        paths: ['./'],
                    },
                    typescript: {
                        project: ['./tsconfig.json'],
                    },
                },
            },
            extends: [
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
            ],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                'better-mutation/no-mutating-methods': 'off',
                'better-mutation/no-mutation': 'off',
                'class-methods-use-this': 'off',
                'no-useless-constructor': 'off',
                'no-empty-function': 'off',
                'no-plusplus': 'off',
                'import/prefer-default-export': 'off',
                'import/extensions': [
                    'error',
                    'ignorePackages',
                    {
                        js: 'never',
                        jsx: 'never',
                        ts: 'never',
                        tsx: 'never',
                    },
                ],
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                'no-undef': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                'unused-imports/no-unused-vars': 'error',
            },
        },
    ],
};
