# Docker Answer Sheet: Employee Portal

This guide explains what Docker is, why it is useful, how it differs from running applications directly on your computer, and how to containerize the Employee Portal app.

Use this only after you have tried the lab yourself.

## What Docker Is

Docker is a tool that manages containers.

A container is the isolated box where your app runs.

A container includes:

- the application code
- the runtime the app needs
- installed dependencies
- environment configuration
- a predictable command for starting the app

The simple idea is:

```text
Your code + your dependencies + your configuration = one containerized app environment
```

Docker builds, starts, stops, connects, and manages those containers.

Resource: [Docker: What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)

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

Resource: [Docker Get Started](https://docs.docker.com/get-started/)

## How Docker Differs from Bare Metal

Bare metal means the app or service runs directly on the machine's operating system.

For this Employee Portal app, a bare metal setup would mean installing these directly on the machine:

- Node.js
- npm packages
- PostgreSQL
- database tables
- environment variables
- startup commands

That is the normal IT/service model: install the software, configure it, start it, expose ports, check logs, and keep it running.

With Docker, you still need those concepts, but the app runs inside a container instead of directly on the machine.

Think about it like this:

```text
Bare metal:
Machine operating system
  -> installed Node.js
  -> installed PostgreSQL
  -> installed app files
  -> manually configured services

Docker:
Machine operating system
  -> Docker
  -> container with the app code, dependencies, and configuration
```

The container is the box. Docker is the tool that manages the box.

The reason IT fundamentals still matter is simple: Docker does not remove services, ports, processes, logs, networking, storage, or configuration. It organizes them differently. If you understand how apps and services normally run, Docker makes much more sense because it is building on top of those same ideas.

## Containers Are Not Tiny Virtual Machines

I have no idea who came up with this. A virtual machine usually includes a full guest operating system. It behaves like a whole separate computer running inside your computer.

A container does not usually include a full operating system. It shares the host machine's operating system kernel, but isolates the app's files, processes, network settings, and dependencies through containers.

Simple version:

```text
Virtual machine:
Runs a whole separate operating system.

Container:
Runs an isolated application environment on top of the host system.
```

That is why containers are usually faster to start and lighter than virtual machines.

## What Docker Changes

Docker changes how application setup is packaged, repeated, and managed.

Without Docker, the setup instructions might look like this:

```text
Install Node.js.
Install PostgreSQL.
Create a database.
Run this SQL script.
Install npm packages.
Set environment variables.
Start the backend.
Serve the frontend.
Hope every step was done the same way.
```

With Docker, the setup now becomes code:

```text
Build the frontend image.
Build the backend image.
Start the PostgreSQL container.
Connect them with Docker Compose.
Run the app.
```

That is the major difference. Docker makes the environment repeatable.

## The Docker Version of This App

In the Docker version of this app, each part runs in its own container:

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

Resource: [Docker: What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/)

## Networks

Containers need a way to talk to each other.

Docker Compose automatically creates a private network for the services in a `docker-compose.yml` file.

Inside that Docker network, containers can use service names as hostnames.

For example, if the database service is named `database`, the backend can connect to PostgreSQL using:

```text
DB_HOST=database
```

This works inside Docker Compose because `database` is the service name.

Resource: [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)

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

Resource: [Docker: Publishing and exposing ports](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/)

## Volumes

Containers are temporary. If you delete a container, data inside it can disappear.

A volume lets Docker store important data outside the container lifecycle.

For PostgreSQL, a volume keeps database data even if the database container is removed and recreated.

Resource: [Docker: Persisting container data](https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/)

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

What each line does:

- `FROM nginx:alpine` starts from a small Nginx image. Nginx is a web server that can serve plain HTML, CSS, and JavaScript.
- `COPY index.html ...` copies your HTML file into the folder Nginx serves from.
- `COPY app.js ...` copies your JavaScript file into that same web folder.
- `EXPOSE 80` documents that the container listens on port `80`.

Important: `EXPOSE` does not publish the port to your computer by itself. The port is published later in `docker-compose.yml` with `8080:80`.

The frontend JavaScript still calls:

```text
http://localhost:3000
```

That is correct because the JavaScript runs in the browser. From the browser's point of view, `localhost:3000` means the user's computer, where Docker has mapped the backend port.

Resources:

- [Nginx official image](https://hub.docker.com/_/nginx)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)

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

What each line does:

- `FROM node:20-alpine` starts from a small Node.js image that already has Node installed.
- `WORKDIR /app` sets `/app` as the working folder inside the container.
- `COPY package.json package.json` copies the dependency list first.
- `RUN npm install` installs the backend packages inside the image.
- `COPY server.js server.js` copies the backend source code into the image.
- `EXPOSE 3000` documents that the backend listens on port `3000`.
- `CMD ["npm", "start"]` tells Docker what command to run when the container starts.

The order matters. Copying `package.json` before `server.js` lets Docker reuse the dependency install layer when only the application code changes.

Resources:

- [Node official image](https://hub.docker.com/_/node)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)

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

What each line does:

- `node_modules` keeps local dependencies out of the image because the image runs `npm install` itself.
- `npm-debug.log` keeps npm error logs out of the image.
- `.env` keeps local secrets and machine-specific settings out of the image.

Resource: [Docker build context and .dockerignore](https://docs.docker.com/build/concepts/context/#dockerignore-files)

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

What the Compose file does:

- `services` lists the containers that make up this application.
- `frontend` builds from `./provided/frontend`.
- `frontend ports: "8080:80"` maps your computer's port `8080` to the frontend container's port `80`.
- `frontend depends_on: backend` starts the backend before the frontend.
- `backend` builds from `./provided/backend`.
- `backend ports: "3000:3000"` maps your computer's port `3000` to the backend container's port `3000`.
- `backend environment` passes database settings into the Node.js app.
- `DB_HOST: database` tells the backend to connect to the Compose service named `database`.
- `database image: postgres:16-alpine` uses the official PostgreSQL image instead of building your own database image.
- `database environment` creates the initial PostgreSQL user, password, and database.
- `database ports: "5432:5432"` makes PostgreSQL reachable from your host machine for local testing tools.
- `employee-data:/var/lib/postgresql/data` stores PostgreSQL data in a named Docker volume.
- `./provided/database/init.sql:/docker-entrypoint-initdb.d/init.sql` gives PostgreSQL the startup SQL file.
- `volumes: employee-data:` declares the named volume used by the database.

Beginner note: `depends_on` controls startup order, but it does not guarantee PostgreSQL is fully ready before the backend tries to connect. The backend code has error handling, so refreshing after a few seconds is usually enough for this lab. In production, you would use stronger readiness checks.

Resources:

- [Docker Compose file reference](https://docs.docker.com/reference/compose-file/)
- [PostgreSQL official image](https://hub.docker.com/_/postgres)

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

Command breakdown:

- `docker` runs the Docker command-line tool.
- `compose` uses Docker Compose for a multi-container app.
- `up` creates and starts the services from `docker-compose.yml`.
- `--build` tells Docker to rebuild the frontend and backend images before starting them.

Docker Compose will:

- build the frontend image
- build the backend image
- pull the PostgreSQL image
- create a Docker network
- create the PostgreSQL volume
- start all three containers

Resource: [docker compose up reference](https://docs.docker.com/reference/cli/docker/compose/up/)

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

Resource: [docker compose down reference](https://docs.docker.com/reference/cli/docker/compose/down/)

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

The frontend container serves static files, the backend container runs the API, and the database container stores data. You can build them all into the same container, but you will not have the ability to restart seperate services. 

Docker Compose lets you start the whole application with one command instead of manually starting each service.

The main advantages are:

- the app is easier to share
- setup steps are repeatable
- dependencies are isolated
- PostgreSQL does not need to be installed directly on every learner's machine
- service configuration is documented in code
- containers can be stopped, rebuilt, and recreated consistently

This is the core value of Docker: it turns application setup into something predictable, portable, and easier to reason about.
