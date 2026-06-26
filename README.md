# Employee Portal Docker Lab

This repo provides the application files only. Your job is to containerize the app yourself by writing the Dockerfiles and Docker Compose setup manually.

Do not look here for the Docker solution. There are no Dockerfiles, no `docker-compose.yml`, and no container configuration included on purpose.

## What Is Provided

```text
Browser -> Frontend -> Backend API -> PostgreSQL
```

The app is split into three beginner-friendly parts:

- `provided/frontend` contains a plain HTML, CSS, and JavaScript Employee Portal page.
- `provided/backend` contains a small Node.js and Express API that reads and writes employees.
- `provided/database` contains `init.sql`, which creates the database table and adds sample employees.

## Your Docker Challenge

Later, you will create these files yourself:

- `provided/frontend/Dockerfile`
- `provided/backend/Dockerfile`
- `provided/backend/.dockerignore`
- `docker-compose.yml`
- `.env.example`
- `.gitignore`

The goal of this lab is to learn Docker concepts like images, containers, port mapping, networks, volumes, environment variables, and Docker Compose.

## Application Overview

The frontend calls the backend API at:

```text
http://localhost:3000
```

The backend connects to PostgreSQL using environment variables:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

The backend includes sensible local defaults so you can run it outside Docker while learning.

## Run Locally Without Docker

You can run the backend directly if you already have PostgreSQL installed and configured.

```bash
cd provided/backend
npm install
npm start
```

Then open `provided/frontend/index.html` in your browser.

Remember: the real purpose of the repo is to practice creating the Docker setup yourself.
