# Node.js-Based Game "Alias"

## Table of Contents

### General

- [Game Description](../../README.md#game-description)
- [Rules](../../README.md#rules)
- [System Requirements](../../README.md#system-requirements)
- [Setup and Installation](../../README.md#system-requirements#setup-and-installation)
- [Troubleshooting](../../README.md#system-requirements#troubleshooting)

### Technical

- Project Structure
    - [Files & Folders]
    - [Modules]
- Data Architecture
    - [Data Base Schemas](../data-architecture/database-schemas.md#structure)
    - [Interfaces](../data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](../data-architecture/dtos.md#dtos)
- APIs
    - [Auth](../APIs/auth.md#authentication)
    - [Socket Events](../APIs/socket-events.md#socket-events-documentation)
- Guides
    - [Testing](#running-tests-in-nestjs-with-jest)
    - [Deployment](./deployment.md#deploying-a-nestjs-application-to-heroku)

### Additional Information

- [Future Enhancements](documentation/deployment.md)
- [FAQ](documentation/faq.md)

## In this file:

1. [Introduction](#introduction)
2. [Running Tests](#running-tests)
3. [Conclusion](#conclusion)

# Running Tests in NestJS with Jest

## Introduction

This guide provides a quick reference on how to run tests in a NestJS application using Jest.

## Running Tests

To run your tests, execute the following command in your terminal:
```bash
npm run test
```
This command will find and execute all test files in your project that follow the .spec.ts naming convention.

### Running Tests in Watch Mode

You can also run tests in watch mode to automatically rerun tests when files change. Use the following command:
```bash
npm run test -- --watch
```
### Running Specific Tests

To run a specific test file, use the command:
```bash
npm run test -- <path-to-your-test-file>
```
For example:
```bash
npm run test -- src/lobby/lobby.service.spec.ts
```

### Check Tests Coverage

To check tests coverage use the command:
```bash
npm run test:coverage
```

## Conclusion

This guide provides a quick overview of how to run tests in a NestJS application using Jest. For more advanced features and configurations, check out the official NestJS documentation on testing (https://docs.nestjs.com/fundamentals/testing).

