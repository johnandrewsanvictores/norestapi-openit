# MERN Boilerplate (Client + Server) with Docker Compose

This is a full-stack MERN & Tailwindcss boilerplate using Docker Compose, designed to help you and your team run the React frontend and Node.js backend without needing to install Node locally.

---

## 📁 Project Structure

```
.
├── client/             # React frontend
│   └── .env.example
├── server/             # Node.js backend
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🐳 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## ⚙️ Setup Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/johnandrewsanvictores/MERN-tailwind-docker-boilerplate.git
cd MERN-tailwind-docker-boilerplate
```

2. **Set up environment files:**

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

3. **Start the application:**

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📦 Installing Packages

To install a package inside a container:

```bash
docker compose exec my-app-server npm install <package-name>
docker compose exec my-app-client npm install <package-name>
```

---

## 🔄 Rebuilding After Dependency Changes

If you modify `package.json` or install packages on the host, rebuild to update the containers:

```bash
docker compose build
docker compose up
```

---

## 🔍 Useful Docker Commands

| Action                   | Command                                 |
|--------------------------|------------------------------------------|
| Start containers         | `docker compose up`                     |
| Stop containers          | `docker compose stop`                   |
| Rebuild containers       | `docker compose build`                  |
| Remove containers        | `docker compose down`                   |
| Exec into server         | `docker compose exec my-app-server sh`  |
| View logs                | `docker compose logs -f`                |

---

## 💡 Notes

- You don’t need Node.js or npm installed locally — containers handle everything.
- Mounted volumes let you develop on your host while code syncs into the containers.
- `.env.example` files are provided for both frontend and backend — copy and configure them as needed.

