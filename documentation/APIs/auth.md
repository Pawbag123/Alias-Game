# Node.js-Based Game "Alias"

## Table of Contents

### General
- [Game Description](../../README.md#game-description)
- [Rules](../../README.md#objective)
- [System Requirements](../../README.md#system-requirements)
- [Setup and Installation](../../README.md#setup-and-installation)
- [Troubleshooting](../../README.md#troubleshooting)

### Technical
- Project Structure (core modules)?
- Data Architecture
    - [Data Base Schemas](../data-architecture/database-schemas.md#structure)
    - [Interfaces](../data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](../data-architecture/dtos.md#dtos)
- APIs
    - [Auth](#authentication)
    - [Socket events](socket-events.md#socket-events-documentation)

### Additional Information
- [Security & Testing](documentation/security.md)
- [Deployment & Future Enhancements](documentation/deployment.md)
- [FAQ](documentation/faq.md)


## In this file:

1. [Auth Controller](#auth-controller)
2. [CreateUserDto](#createuserdto)
3. [LoginUserDto](#loginuserdto)
4. [RefreshTokenDto](#refreshtokendto)

---
# Authentication

## Auth Controller

### Description
The AuthController manages authentication-related routes, including user signup, login, token refresh, and token verification.

### Endpoints

- **POST /auth/signup**
  - **Description**: Registers a new user.
  - **Request Body**: CreateUserDto
  - **Response**: Success message and user details.
  - **HTTP Status**: 201 Created

  **Example Request**:
    ```json
    {
      "username": "exampleUser",
      "password": "ExamplePassword123!"
    }
    ```
  **Example Response**:
    ```json
  {
      "message": "User created successfully",
      "result": { /* user details */ }
  }
    ```
- **POST /auth/login**
  - **Description**: Authenticates a user and returns tokens.
  - **Request Body**: LoginUserDto
  - **Response**: Authentication tokens.
  - **HTTP Status**: 200 OK

  **Example Request**:
    ```json
  {
      "username": "exampleUser",
      "password": "ExamplePassword123!"
  }
    ```
  **Example Response**:
    ```json
  {
      "accessToken": "abc123",
      "refreshToken": "def456"
  }
    ```
- **POST /auth/refresh**
  - **Description**: Refreshes the user's authentication tokens.
  - **Request Body**: RefreshTokenDto
  - **Response**: New authentication tokens.
  - **HTTP Status**: 200 OK

  **Example Request**:
    ```json
  {
      "refreshToken": "def456"
  }
    ```
  **Example Response**:
    ```json
  {
      "accessToken": "newAccessToken",
      "refreshToken": "newRefreshToken"
  }
    ```
- **GET /auth/verify-token**
  - **Description**: Verifies the validity of the provided JWT token.
  - **Response**: Confirmation of token validity.
  - **HTTP Status**: 200 OK
  - **Guard**: JwtAuthGuard

  **Example Response**:
    ```json
  {
      "valid": true
  }
    ```
---

## CreateUserDto

### Description
The CreateUserDto is used for user registration, validating the username and password during the signup process.

### Properties
- **username**: string - Unique username for the user. Must be at least 6 characters long and can only contain letters and numbers.
- **password**: string - Password for user authentication. Must include at least one uppercase letter, one lowercase letter, one number, and one special character, with a minimum length of 6 characters.

---

## LoginUserDto

### Description
The LoginUserDto is used for user login, validating the username and password.

### Properties
- **username**: string - Username for user authentication.
- **password**: string - Password for user authentication.

---

## RefreshTokenDto

### Description
The RefreshTokenDto is used for refreshing user authentication tokens.

### Properties
- **refreshToken**: string - The refresh token used to obtain new authentication tokens.

---

## Conclusion

This authentication module is crucial for managing user sessions and securing access to the application. Understanding the endpoints and DTOs helps in implementing robust authentication and user management features effectively.
