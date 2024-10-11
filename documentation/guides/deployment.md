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
    - [Files & Folders](../project-structure/files-and-folders.md#directory-structure)
    - [Modules](../project-structure/core-modules.md#core-modules)
- Data Architecture
    - [Data Base Schemas](../data-architecture/database-schemas.md#structure)
    - [Interfaces](../data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](../data-architecture/dtos.md#dtos)
- APIs
    - [Auth](../APIs/auth.md#authentication)
    - [Socket Events](../APIs/socket-events.md#socket-events-documentation)
- Guides
    - [Testing](./testing.md#running-tests-in-nestjs-with-jest)
    - [Deployment](#deploying-a-nestjs-application-to-heroku)

### Additional Information

- [Future Enhancements](../future-enhancements.md#future-enhancements)
- [FAQ](../FAQ.md#faq)
## In this file:

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Creating a Heroku App](#creating-a-heroku-app)
4. [Configuring Heroku to Properly Run the Application](#configuring-heroku-to-properly-run-the-application)
5. [Accessing Your Application](#accessing-the-application)
6. [Conclusion](#conclusion)

# Deploying a NestJS Application to Heroku

## Introduction

This guide provides a step-by-step process for deploying a NestJS application to Heroku.

## Prerequisites

- A NestJS application ready for deployment.
- A credit card (It just blocks $1 on your account to verify if it's legit).

## Creating a Heroku App

### Step 1 - Create a Heroku Account

1. Go to the Heroku website (https://www.heroku.com/).
2. Click on "Sign Up" and fill out the required information to create your account.
3. Follow the verification process, including confirming your email address.

### Step 2 - Link Your GitHub Repository with Heroku

1. Click on "New" in the upper right corner and select "Create new app."

2. Enter a unique name for your app and choose your region, then click "Create app."

3. After the app is created, navigate to the "Deploy" tab.

4. In the "Deployment method" section, select "GitHub."

5. Click on "Connect to GitHub" and authorize Heroku to access your GitHub account if prompted.

6. Once connected, search for your GitHub repository name in the provided field and click "Connect."

7. Click on "Deploy Branch" to deploy your application directly from your GitHub repository to Heroku.

### Step 3 - Configure Heroku to Properly Run the Application

1. Set environment variables necessary for your application. Use the following command for each variable:
```bash
   heroku config:set VARIABLE_NAME=value
```
   For example, to set the MongoDB URI:
```bash
   heroku config:set MONGO_URI=mongodb://<username>:<password>@host:port/database
```
2. Ensure your application listens on the correct port. In your main application file (usually `main.ts`), modify it to use the environment variable for the port:
```typescript
   const port = process.env.PORT || 3000;
   await app.listen(port);
```
3. Add a Procfile to the root of your project to specify the command to run your application:
```bash
   web: npm run start:prod
```
4. Make sure your package.json includes the necessary scripts. For example:
```json
   "scripts": {
     "start": "node dist/main.js",
     "build": "tsc",
     "start:prod": "npm run build && node dist/main.js"
   }
```

## Accessing The Application

Once the deployment is complete, you can access your application using the URL provided by Heroku:

```bash
https://<your-app-name>.herokuapp.com
```

## Conclusion

This guide provides a basic overview of deploying a NestJS application to Heroku. For more advanced features and configurations, check out the official Heroku documentation (https://devcenter.heroku.com/categories/reference).