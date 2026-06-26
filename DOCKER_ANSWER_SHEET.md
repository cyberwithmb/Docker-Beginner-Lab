# Docker Answer Sheet: Employee Portal

This guide explains what Docker is, why it is useful, how it differs from running applications directly on your computer, and how to containerize the Employee Portal app.

Use this only after you have tried the lab yourself.

## What Docker Is

Docker is a tool for packaging and running applications in isolated environments called containers.

A container includes:

- the application code
- the runtime the app needs
- installed dependencies
- environment configuration
- a predictable command for starting the app

The important idea is that the app runs the same way no matter where the container runs, as long as Docker is available.

## Why Docker Is Used

Docker helps solve a common problem in software development:

> "It works on my machine, but not on yours."

Without Docker, every developer needs to manually install the correct versions of Node.js, PostgreSQL, package dependencies, environment variables, and startup commands. If any machine is slightly different, the app may fail.

With Docker, the setup is written down as code. Instead of giving someone a long list of installation steps, you give them Docker files that describe how the app should run.

Docker is commonly used for:

- local development environments
- deploying apps to servers
- running databases and services consistently
- testing apps in clean environments
- sharing projects with other developers
- learning how real multi-service apps are deployed

## Normal Method vs Docker Method

In the normal method, you install everything directly on your machine.

For this app, that means you would install:

- Node.js
- npm packages
- PostgreSQL
- database tables
- local environment variables

Then you would run the frontend, backend, and database yourself.

In the Docker method, each part of the app runs in its own container:

```text
Browser -> Frontend Container -> Backend Container -> PostgreSQL Container
```

The frontend container serves the HTML, CSS, and JavaScript.

The backend container runs the Express API.

The PostgreSQL container stores employee data.

Docker Compose starts all of them together.

## Images and Containers

An image is like a blueprint. It describes what should be inside the container.

A container is a running instance of an image.

For example:

- a backend image contains Node.js, the backend files, and npm dependencies
- a backend container is the running API created from that image

You build images. You run containers.

## Networks

Containers need a way to talk to each other.

Docker Compose automatically creates a private network for the services in a `docker-compose.yml` file.

Inside that Docker network, containers can use service names as hostnames.

For example, if the database service is named `database`, the backend can connect to PostgreSQL using:

```text
DB_HOST=database
```

This works inside Docker Compose because `database` is the service name.

## Port Mapping

Containers have their own internal ports.

Your computer also has host ports.

Port mapping connects a port on your computer to a port inside a container.

For example:

```yaml
ports:
  - "3000:3000"
```

This means:

```text
host port 3000 -> container port 3000
```

Then your browser can access the backend at:

```text
http://localhost:3000
```

## Volumes

Containers are temporary. If you delete a container, data inside it can disappear.

A volume lets Docker store important data outside the container lifecycle.

For PostgreSQL, a volume keeps database data even if the database container is removed and recreated.

## Environment Variables

Environment variables let you configure an app without changing the code.

This app uses environment variables for database connection settings:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

That means the same backend code can run locally or in Docker.

## Final Project Structure

After solving the Docker lab, your project should look like this:

```text
container-employee-portal/
  README.md
  DOCKER_ANSWER_SHEET.md
  .env.example
  .gitignore
  docker-compose.yml
  provided/
    frontend/
      Dockerfile
      index.html
      app.js
    backend/
      Dockerfile
      .dockerignore
      package.json
      server.js
    database/
      init.sql
```

## Step 1: Create the Frontend Dockerfile

Create this file:

```text
provided/frontend/Dockerfile
```

Add:

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/app.js

EXPOSE 80
```

This uses Nginx to serve the static frontend files.

The frontend JavaScript still calls:

```text
http://localhost:3000
```

That is correct because the JavaScript runs in the browser. From the browser's point of view, `localhost:3000` means the user's computer, where Docker has mapped the backend port.

## Step 2: Create the Backend Dockerfile

Create this file:

```text
provided/backend/Dockerfile
```

Add:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package.json
RUN npm install

COPY server.js server.js

EXPOSE 3000

CMD ["npm", "start"]
```

This image installs the backend dependencies and starts the Express server.

## Step 3: Create the Backend .dockerignore

Create this file:

```text
provided/backend/.dockerignore
```

Add:

```text
node_modules
npm-debug.log
.env
```

This keeps unnecessary or sensitive files out of the backend image.

## Step 4: Create docker-compose.yml

Create this file at the project root:

```text
docker-compose.yml
```

Add:

```yaml
services:
  frontend:
    build:
      context: ./provided/frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./provided/backend
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      DB_HOST: database
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: employee_portal
    depends_on:
      - database

  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: employee_portal
    ports:
      - "5432:5432"
    volumes:
      - employee-data:/var/lib/postgresql/data
      - ./provided/database/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  employee-data:
```

This Compose file defines three services:

- `frontend`, which serves the browser app
- `backend`, which runs the Express API
- `database`, which runs PostgreSQL

The backend uses `DB_HOST: database` because `database` is the Compose service name.

## Step 5: Create .env.example

Create this file at the project root:

```text
.env.example
```

Add:

```text
PORT=3000
DB_HOST=database
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=employee_portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=employee_portal
```

This file documents the environment variables used by the app.

For a larger project, you could use a real `.env` file with Docker Compose. For this beginner lab, the Compose file keeps values visible and easy to understand.

## Step 6: Create .gitignore

Create this file at the project root:

```text
.gitignore
```

Add:

```text
node_modules/
.env
npm-debug.log
```

This prevents local dependencies and secret environment files from being committed.

## Step 7: Build and Run the App

From the project root, run:

```bash
docker compose up --build
```

Docker Compose will:

- build the frontend image
- build the backend image
- pull the PostgreSQL image
- create a Docker network
- create the PostgreSQL volume
- start all three containers

When everything is running, open:

```text
http://localhost:8080
```

The backend API is available at:

```text
http://localhost:3000
```

You can test the health endpoint directly:

```text
http://localhost:3000/health
```

## Step 8: Stop the App

To stop the containers, press `Ctrl+C` in the terminal running Docker Compose.

Or run:

```bash
docker compose down
```

This stops and removes the containers and network.

The database volume remains, so your data can survive.

## Step 9: Remove the Database Volume

If you want to completely reset the database, run:

```bash
docker compose down -v
```

The `-v` removes the named volume.

The next time you run the app, PostgreSQL will start fresh and run `init.sql` again.

## Common Beginner Notes

If the frontend loads but employees do not appear, check that the backend is running on port `3000`.

If the backend cannot connect to the database, check the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` values.

If the database seems empty after changing `init.sql`, remember that PostgreSQL only runs files in `/docker-entrypoint-initdb.d/` when the database volume is first created. Use `docker compose down -v` to reset the volume.

If port `5432`, `3000`, or `8080` is already in use on your machine, change the left side of the port mapping.

For example:

```yaml
ports:
  - "8081:80"
```

This maps host port `8081` to container port `80`.

## Advantages of This Docker Setup

This setup is useful because each part of the app has a clear responsibility.

The frontend container serves static files, the backend container runs the API, and the database container stores data.

Docker Compose lets you start the whole application with one command instead of manually starting each service.

The main advantages are:

- the app is easier to share
- setup steps are repeatable
- dependencies are isolated
- PostgreSQL does not need to be installed directly on every learner's machine
- service configuration is documented in code
- containers can be stopped, rebuilt, and recreated consistently

This is the core value of Docker: it turns application setup into something predictable, portable, and easier to reason about.
