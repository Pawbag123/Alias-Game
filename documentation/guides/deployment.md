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

1. [Deploying on AWS EC2](#deploying-a-nestjs-application-to-aws-ec2)
2. [Introduction (AWS EC2)](#introduction-aws-ec2)
3. [Prerequisites (AWS EC2)](#prerequisites-aws-ec2)
4. [Launching an EC2 Instance](#launching-an-ec2-instance)
5. [Setting up the EC2 Instance](#setting-up-the-ec2-instance)
6. [Configuring Docker](#configuring-docker)
7. [Running the App with Docker Compose](#running-the-app-with-docker-compose)
8. [Testing the Deployment](#testing-the-deployment)
9. [Conclusion (AWS EC2)](#conclusion-aws-ec2)

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