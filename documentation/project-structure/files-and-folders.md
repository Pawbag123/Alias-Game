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
    - [Files & Folders](#directory-structure)
    - [Modules](./core-modules.md#core-modules)
- Data Architecture
    - [Data Base Schemas](../data-architecture/database-schemas.md#structure)
    - [Interfaces](../data-architecture/interfaces.md#game-interfaces-documentation)
    - [Dtos](../data-architecture/dtos.md#dtos)
- APIs
    - [Auth](../APIs/auth.md#authentication)
    - [Socket Events](../APIs/socket-events.md#socket-events-documentation)
- Guides
    - [Testing](../guides/testing.md#running-tests-in-nestjs-with-jest)
    - [Deployment](../guides/deployment.md#deploying-a-nestjs-application-to-aws-ec2)

### Additional Information

- [Future Enhancements](../future-enhancements.md#future-enhancements)
- [FAQ](../FAQ.md#faq)


# Directory Structure

```
.
├── documentation
│   ├── APIs
│   │   ├── auth.md
│   │   └── socket-events.md
│   ├── data-architecture
│   │   ├── database-schemas.md
│   │   ├── dtos.md
│   │   └── interfaces.md
│   ├── guides
│   │   ├── deployment.md
│   │   └── testing.md
│   ├── project-structure
│   │   ├── core-modules.md
│   │   └── files-and-folders.md
│   ├── FAQ.md
│   └── future-enhancements.md
├── src
│   ├── auth
│   │   ├── config
│   │   │   └── google-oauth.config.ts
│   │   ├── dto
│   │   │   ├── create-user.dto.ts
│   │   │   ├── login-user.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards
│   │   │   └── google-auth
│   │   │       ├── google-auth.guard.spec.ts
│   │   │       └── google-auth.guard.ts
│   │   ├── schemas
│   │   │   └── user.schema.ts
│   │   ├── stratergies
│   │   │   └── google.stratergy.ts
│   │   ├── auth.controller.specs.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── jwtAuthGuard.ts
│   │   └── jwt.strategy.ts
│   ├── chat
│   │   ├── schemas
│   │   │   └── chat.schema.ts
│   │   ├── chat.module.ts
│   │   ├── chat.service.spec.ts
│   │   └── chat.service.ts
│   ├── exceptions
│   │   ├── ws-all-exceptions-filter.ts
│   │   └── ws-exceptions.ts
│   ├── game-room
│   │   ├── dto
│   │   │   ├── game-room-dto.ts
│   │   │   └── game-started-dto.ts
│   │   ├── guards
│   │   │   ├── guessing-team.guard.ts
│   │   │   ├── host.guard.ts
│   │   │   ├── join-team.guard.ts
│   │   │   ├── player-in-game.guard.ts
│   │   │   ├── skip-word.guard.ts
│   │   │   └── too-few-players.guard.ts
│   │   ├── schema
│   │   │   └── game.schema.ts
│   │   ├── game-mechanics.service.ts
│   │   ├── game-room.gateway.ts
│   │   ├── game-room.module.ts
│   │   ├── game-room.service.spec.ts
│   │   └── game-room.service.ts
│   ├── game-state
│   │   ├── game-state.module.ts
│   │   ├── game-state.service.spec.ts
│   │   └── game-state.service.ts
│   ├── lobby
│   │   ├── dto
│   │   │   ├── create-game-dto.ts
│   │   │   ├── game-settings.dto.ts
│   │   │   └── in-lobby-game-dto.ts
│   │   ├── guards
│   │   │   ├── create-game.guard.ts
│   │   │   └── join-game.guard.ts
│   │   ├── lobby.gateway.ts
│   │   ├── lobby.module.ts
│   │   ├── lobby.service.spec.ts
│   │   └── lobby.service.ts
│   ├── public
│   │   ├── audio
│   │   │   ├── countDown2.mp3
│   │   │   ├── describerError.mp3
│   │   │   ├── scorePoint2.mp3
│   │   │   ├── scorePoint.mp3
│   │   │   ├── startingGame.mp3
│   │   │   ├── turnEnding.mp3
│   │   │   ├── win.mp3
│   │   │   └── youlose.mp3
│   │   └── images
│   │       ├── alias-logo-1.png
│   │       ├── Dbschema.png
│   │       └── Handlebars.png
│   ├── utils
│   │   ├── describe-validation.ts
│   │   ├── guess-validation.ts
│   │   ├── is-derivative.ts
│   │   └── levenshtein-distance.ts
│   ├── views
│   │   ├── layouts
│   │   │   └── main.hbs
│   │   ├── game-room.hbs
│   │   ├── home.hbs
│   │   ├── lobby.hbs
│   │   ├── login.hbs
│   │   └── register.hbs
│   ├── app.controller.specs.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── socket-io-adapter.ts
│   └── types.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── directory_structure.txt
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
├── package-lock.json
├── Procfile
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```