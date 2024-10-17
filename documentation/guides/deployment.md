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

1. [Deploying on Heroku](#deploying-a-nestjs-application-to-heroku)
   -  [Introduction (Heroku)](#introduction-heroku)
   -  [Prerequisites (Heroku)](#prerequisites-heroku)
   -  [Creating a Heroku App](#creating-a-heroku-app)
   -  [Configure Heroku to Properly Run the Application](#configure-heroku-to-properly-run-the-application)
   -  [Accessing The Application](#accessing-the-application)
   -  [Conclusion (Heroku)](#conclusion-heroku)
   
2. [Deploying on AWS EC2](#deploying-a-nestjs-application-to-aws-ec2)
   -  [Introduction (AWS EC2)](#introduction-aws-ec2)
   -  [Prerequisites (AWS EC2)](#prerequisites-aws-ec2)
   -  [Launching an EC2 Instance](#launching-an-ec2-instance)
   -  [Setting up the EC2 Instance](#setting-up-the-ec2-instance)
   -  [Configuring Docker](#configuring-docker)
   -  [Running the App with Docker Compose](#running-the-app-with-docker-compose)
   -  [Testing the Deployment](#testing-the-deployment)
   -  [Conclusion (AWS EC2)](#conclusion-aws-ec2)

<br>

# Deploying a NestJS Application to Heroku

## Introduction (Heroku)

This guide provides a step-by-step process for deploying a NestJS application to Heroku.

## Prerequisites (Heroku)

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

## Configure Heroku to Properly Run the Application

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

## Conclusion (Heroku)

This guide provides a basic overview of deploying a NestJS application to Heroku. For more advanced features and configurations, check out the official Heroku documentation (https://devcenter.heroku.com/categories/reference).

<br>
<br>

# Deploying a NestJS Application to AWS EC2

## Introduction (AWS EC2)

This guide provides a step-by-step process for deploying a NestJS application to AWS EC2.

## Prerequisites (AWS EC2)

- `AWS Account`: An active AWS account.
- `IAM Permissions`: You should have appropriate permissions to create EC2 instances.
- `NestJS Application`: A working NestJS app ready for deployment.
- `SSH Key Pair`: You’ll need a key pair to access your EC2 instance.

## Launching an EC2 Instance

-  ### Step 1 - Log in to AWS Console.

-  ### Step 2 - Navigate to EC2 Dashboard and click on Launch Instance.

-  ### Step 3 - Select the Amazon Machine Image (AMI):

   -  Choose Ubuntu Server 24.04 LTS 

-  ### Step 4 - Choose an Instance Type.

   -  Start with t2.micro (free tier eligible).

-  ### Step 5 - Configure Security Group.

   -  Open ports:
      -  22 for SSH.
      -  80 for HTTP.
   -  Add a rule for port 3000.

-  ### Step 6 - Add your SSH key pair and launch the instance.

## Setting up the EC2 Instance

-  ### Step 1 - SSH into the EC2 instance.
   ```
   ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip
   ```
-  ### Step 2 - Update the instance.
   ```
   sudo apt update && sudo apt upgrade -y
   ```

## Configuring Docker

-  ### Step 1 - Set up Docker's `apt` repository.
   ```
   # Add Docker's official GPG key:
   sudo apt-get update
   sudo apt-get install ca-certificates curl
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc

   # Add the repository to Apt sources:
   echo \
   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   ```
-  ### Step 2 - Install the Docker packages.
   To install the latest version, run:
   ```
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

## Configuring Docker

-  ### Step 1 - Clone your app repository.
   ```
   git clone https://github.com/your-repo.git
   cd your-repo
   ```
-  ### Step 2 - Set environment variables.

   -  Create a `.env` file or configure them using EC2 environment settings.

-  ### Step 3 - Verify `Dockerfile` and `docker-compose.yml`.

   -  Ensure your `Dockerfile` is set up to install dependencies and run your NestJS app.
   -  Ensure the `docker-compose.yml` exposes the necessary ports (3000).

## Running the App with Docker Compose

-  ### Step 1 - Build and run your Docker containers.
   ```
   sudo docker compose up -d --build
   ```
-  ### Step 2 - Check running containers.
   ```
   sudo docker ps
   ```
   The app should now be running inside a Docker container on port 3000.


## Testing the Deployment

-  ### Step 1 - Access the public IP or domain of your EC2 instance in a browser.

   ```
   http://your-ec2-public-ip:3000
   ```

-  ### Step 2 - Ensure that the NestJS app responds as expected.


## Conclusion (AWS EC2)

This guide provides a basic overview of deploying a NestJS application to AWS EC2.