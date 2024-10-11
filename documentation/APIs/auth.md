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
    "result": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzA4ZTg2NmM2OWUxZTA4NzY3NjAwMzMiLCJ1c2VyTmFtZSI6Ikp1YW5uMTIiLCJpYXQiOjE3Mjg2MzcwMzAsImV4cCI6MTcyODg5NjIzMH0.xFAbq2ot4kDiKk5A4JFdKIF1fNNrxseCW7ZJp-4egbA",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzA4ZTg2NmM2OWUxZTA4NzY3NjAwMzMiLCJ1c2VyTmFtZSI6Ikp1YW5uMTIiLCJpYXQiOjE3Mjg2MzcwMzAsImV4cCI6MTcyOTI0MTgzMH0.CbxRiD_xuT5Gm98rcCPtfFgqvlwn7V6Yv8n5vbFh93c",
      "user": {
        "id": "6708e866c69e1e0876760032",
        "username": "exampleUser"
      }
    }
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
    "username": "Juann1",
    "password": "Juann1."
  }
  ```

  **Example Response**:

  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzA1YzdiOGUzNDkyOGE3ODkzMGQ2ZjciLCJ1c2VyTmFtZSI6Ikp1YW5uMSIsImlhdCI6MTcyODYzNzA3MiwiZXhwIjoxNzI4ODk2MjcyfQ.UcABxZVJytvxlw8ADR58XEWePVAH-b1bWs6La2rWK6A",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzA1YzdiOGUzNDkyOGE3ODkzMGQ2ZjciLCJ1c2VyTmFtZSI6Ikp1YW5uMSIsImlhdCI6MTcyODYzNzA3MiwiZXhwIjoxNzI5MjQxODcyfQ.gN42taR444Y7FxGgRMjj3FYUbAzt56CxNIlVNjPucIQ",
    "user": {
      "id": "6705c7b8e34928a78930d6f7",
      "username": "Juann1"
    }
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
