Setup:
npm install


Cognito/AppSync configuration:
copy `.env.example` to `.env.local` and set these values from the `moview-api` stack outputs:

```bash
VITE_COGNITO_USER_POOL_ID=<MoviewUserPoolId>
VITE_COGNITO_CLIENT_ID=<MoviewUserPoolClientId>
VITE_APPSYNC_GRAPHQL_URL=<MoviewGraphQLApiUrl>
```

Run Dev server local ownly:
npm run dev

Run Dev server accessible from other machines on network:
npm run dev -- --host 0.0.0.0
