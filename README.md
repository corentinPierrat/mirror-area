# Area Web Platform

## Overview

The AREA Web Platform is an automation tool inspired by IFTTT and Zapier, designed to connect different online services and make them interact automatically. The goal of the platform is to allow users to create custom workflows, called AREAs, that seamlessly link events from one service to automated actions in another. Instead of performing repetitive digital tasks manually, users can configure the platform to react instantly when certain conditions are met, such as forwarding a received email attachment to cloud storage or posting a social media update across multiple networks at once.


## Database

The platform’s data is stored in a MariaDB relational database, ensuring reliable management of users, workflows, and their relationships.

```mermaid
erDiagram
  USERS {
    bigint id PK
    string email
    string password_hash
    string profile_image_url
    enum role
    datetime created_at
    datetime updated_at
  }

  WORKFLOWS {
    bigint id PK
    bigint user_id FK
    string name
    string description
    enum visibility
    datetime created_at
    datetime updated_at
  }

  WORKFLOW_STEPS {
    bigint id PK
    bigint workflow_id FK
    int step_order
    enum type
    string service
    string event
    json params
    datetime created_at
  }

  USER_FAVORITE_WORKFLOWS {
    bigint user_id PK,FK
    bigint workflow_id PK,FK
    datetime added_at
  }

  FRIENDS {
    bigint user_id PK,FK
    bigint friend_id PK,FK
    enum status
    datetime created_at
  }

  USERS ||--o{ WORKFLOWS : owns
  WORKFLOWS ||--o{ WORKFLOW_STEPS : has_steps
  USERS ||--o{ USER_FAVORITE_WORKFLOWS : favorites
  WORKFLOWS ||--o{ USER_FAVORITE_WORKFLOWS : favorited_by
  USERS ||--o{ FRIENDS : is_friend_with
  USERS ||--o{ FRIENDS : is_friend_of
```

## Authors

- **Yanis Senovic**
- **Théotime Collier**
- **Lucas Fontana**
- **Corentin Pierrat**
- **Roman Girault**