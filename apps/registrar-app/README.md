# React-admin Auth0

This app will be the admin platform for the registrar

## How to run

After having cloned the react-admin-auth0 repository, run the following commands:

```sh
yarn install
yarn start
```

## Auth0 configuration for testing

```yaml
Allowed Callback URLs: http://localhost:3000/login
Allowed Logout URLs: http://localhost:3000/
Allowed Web Origins: http://localhost:3000/
Allowed Origins (CORS): http://localhost:3000/
```

## Required environment variables

```
export AUTH0_DOMAIN=""
export AUTH0_CLIENT_ID=""
export AUTH0_REDIRECT_URI="http://localhost:3000/login"
```

## References
- https://github.com/marmelab/ra-example-oauth
- https://auth0.com/docs/libraries/auth0-single-page-app-sdk

## TODO:


## Adding Users
### 1. Go to the management console
- Go to https://auth0.com/docs/api/management
- Set the api token for that environment

### 2. Add a user using the "Users/create" endpoint 
POST https://auth0.com/docs/api/management/v2#!/Users/post_users
```json
{
  "email": <EMAIL_ADDRESS>,
  "given_name": <FIRST NAME>,
  "family_name": <LAST_NAME>,
  "password": <GENERATE_PASSWORD>,
  "verify_email": false,
  "email_verified": false,
  "connection": "vnf-localdev-users-connection"
}
```

#### Sample Response
The only interesting thing is the user_id
```json
{
  "user_id": "auth0|614719da757364006a0a5c68",
  "created_at": "2021-09-19T11:07:06.264Z",
  "email": "arolave@gmail.com",
  "email_verified": false,
  "family_name": "Olave",
  "given_name": "Andres",
  "identities": [
    {
      "connection": "vnf-localdev-users-connection",
      "user_id": "614719da757364006a0a5c68",
      "provider": "auth0",
      "isSocial": false
    }
  ],
  "name": "arolave@gmail.com",
  "nickname": "arolave",
  "picture": "https://s.gravatar.com/avatar/bfd6989c3ddeb92f8c5c110b7b3031b7?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Far.png",
  "updated_at": "2021-09-19T11:07:06.264Z",
}
```

### 3. Add role to user
POST https://auth0.com/docs/api/management/v2#!/Roles/post_role_users
- id: `<ROLE_ID>` (see below)
- body: `users: [<USER_ID_FROM_STEP_2>]`

| Env | Role Name | Role Id |
| --- | --------- | ------- |
|localdev|vnf-localdev-registrar-client-admin-role|rol_sQZLrbwBEblVBNDj|
|localdev|vnf-localdev-registrar-superuser-role|rol_ldCwjQcYdxH5tjVd|
|dev|vnf-localdev-registrar-client-admin-role||
|dev|vnf-dev-registrar-superuser-role||
|staging|vnf-localdev-registrar-client-admin-role||
|staging|vnf-staging-registrar-superuser-role||
|prod|vnf-localdev-registrar-client-admin-role||
|prod|vnf-prod-registrar-superuser-role||


### 3. Send password reset to user
POST https://auth0.com/docs/api/management/v2#!/Tickets/post_password_change

```json
{ 
"user_id": <USER_ID_FROM_STEP_2>, 
"client_id": <REGISTRAR_CLIENT_ID>,
"mark_email_as_verified": true,
 "ttl_sec": 86400
}
```

This ticket above will last a day (86400 seconds)

#### Sample Response
Take the ticket and send the person an email
```json
{
  "ticket": "https://vnf-localdev.us.auth0.com/lo/reset?ticket=4OmaLN8CqxHfzOozNovvWV7StalrqRK5#"
}
```

### 4. Send invitation email to user

```json
<FIRST_NAME> <LAST_NAME>,

You have been invited to the Velocity Network Registrar. 
Please set your password at <TICKET>
```

```