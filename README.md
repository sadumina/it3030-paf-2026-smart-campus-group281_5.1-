# Smart Campus Managment System

## Overview

Smart Study Operation Hub is a full-stack web application built as part of the IT3030 Programming Advanced Framework (PAF) course. The system is designed to support smart campus learning by providing students and educators with tools to manage study sessions, track academic progress, collaborate with peers, and access learning resources.

The application follows a client-server architecture with a React frontend and a Spring Boot backend, connected to a cloud-hosted MongoDB database.

---

## Purpose

The primary goals of this project are:

- Provide a centralized platform for managing student academic activities on a smart campus
- Implement user registration, authentication, and profile management
- Demonstrate RESTful API design and integration between a modern frontend and backend
- Apply clean layered architecture principles (controller, service, repository, model)
- Utilize a NoSQL document database for flexible and scalable data storage

---

## Key Features

- User registration and login
- User profile management (create, read, update, delete)
- Responsive landing page with feature highlights and statistics
- RESTful API with full CRUD support for user entities
- MongoDB Atlas cloud database integration
- Health check and database connection verification endpoints

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI component framework |
| Vite | 8.x | Build tool and development server |
| Tailwind CSS | 4.x | Utility-first CSS styling |
| PostCSS / Autoprefixer | — | CSS processing pipeline |
| ESLint | 9.x | Code linting and quality enforcement |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Programming language |
| Spring Boot | 4.0.5 | Application framework |
| Spring Web | — | REST API layer |
| Spring Data MongoDB | — | MongoDB ODM and repository abstraction |
| Maven | — | Build and dependency management |

### Database

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL document database |

### Tools

- Git and GitHub for version control
- Postman for API testing
- IntelliJ IDEA / VS Code for development

---

## Project Structure

```
it3030-paf-2026-smart-campus-group281/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   └── src/
│       ├── main/
│       │   ├── java/com/backend/backend/
│       │   │   ├── config/
│       │   │   │   └── MongoConfig.java
│       │   │   ├── controller/
│       │   │   │   └── UserController.java
│       │   │   ├── model/
│       │   │   │   └── User.java
│       │   │   ├── repository/
│       │   │   │   └── UserRepository.java
│       │   │   ├── service/
│       │   │   │   └── UserService.java
│       │   │   └── BackendApplication.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           └── java/com/backend/backend/
│               └── BackendApplicationTests.java
│
└── README.md
```

---

## API Endpoints

All endpoints are prefixed with `/api/users`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | Retrieve all users |
| GET | `/api/users/{id}` | Retrieve a user by ID |
| GET | `/api/users/email/{email}` | Retrieve a user by email |
| PUT | `/api/users/{id}` | Update a user by ID |
| DELETE | `/api/users/{id}` | Delete a user by ID |
| GET | `/api/users/health` | Backend health check |
| GET | `/api/users/db-test` | MongoDB connection test |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Java 17 or higher
- Maven 3.x
- A MongoDB Atlas account (or local MongoDB instance)

### Clone the Repository

```bash
git clone <repository-url>
cd it3030-paf-2026-smart-campus-group281
```

### Running the Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Configure your MongoDB connection in `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=<your-mongodb-connection-string>
```

3. Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```

The backend will be available at `http://localhost:8080`.

### Running the Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Course Information

- Course: IT3030 – Programming Advanced Framework (PAF)
- Academic Year: 2026
- Group: 281
