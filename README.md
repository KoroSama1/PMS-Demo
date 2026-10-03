# PMS Demo – Project Management System

A full-stack demo replacement for the PMS Excel workflow described in `PMS- CC(1).xlsx` and the supplied PMS flow diagram.

## Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Node.js + Express + Mongoose + JWT
- Database: MongoDB Atlas
- Styling: Custom CSS (responsive, dark dashboard UI)

## Roles

### Tender Executive
- Create projects
- Select and reorder project stages
- Assign stage owners
- Maintain Stages / Stage Status / Project Type masters
- Define project BOQ
- Approve/reject completed stages
- Approve/reject BOQ amendments
- View overall project progress

### Manager
- See assigned stages
- Add sub-steps/tasks to a stage
- Assign tasks to Site Engineers
- Approve completed task work
- Submit a fully completed stage for Tender Executive approval
- Record BOQ usage and request amendments

### Site Engineer
- See assigned tasks
- Mark tasks complete and send for manager approval
- Record BOQ usage
- Request additional BOQ items

## Demo users

All seeded demo accounts use the same password:

`Password@123`

- Tender Executive: `tender@example.com`
- Manager: `manager@example.com`
- Manager 2: `avishkar@example.com`
- Site Engineer: `engineer@example.com`
- Site Engineer 2: `santosh@example.com`

## 1. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://<YOUR_USER>:<YOUR_PASSWORD>@cluster0.cv1n3f6.mongodb.net/
MONGODB_DB=pms
JWT_SECRET=change-this-for-your-demo
PORT=5500
CLIENT_URL=http://localhost:5173
```

Seed the database:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

API runs on `http://localhost:5500`.

## 2. Frontend setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

The frontend uses:

```env
VITE_API_BASE_URL=http://localhost:5500/api
```

Create `client/.env` when the API runs somewhere else.

## 3. Docker

The included `docker-compose.yml` runs the React/Vite production build through nginx and the Express API. MongoDB remains MongoDB Atlas.

```bash
docker compose up --build
```

## Excel mapping used for the demo

The supplied workbook has two sheets:

- `PMS`: current project progress/stage tracking, priority, dates, status and remarks.
- `Master Sheet`: project types, products/services, stage names, stage statuses, priorities and stage owner examples.

The demo uses the workbook to seed the Stage, Stage Status, Project Type masters and a sample `PRJ-0001` project/stage timeline. The UI is intentionally designed around the same progress-grid + master-data workflow while moving operational work into role-based screens.

## Important demo note

The connection string/password should stay in your local `server/.env`. Do not commit it to GitHub.
