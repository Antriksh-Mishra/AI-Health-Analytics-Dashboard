# 🚀 Deploying MedIntel AI to Render (render.com)

This guide provides step-by-step instructions to deploy both the **Python Flask Backend** and **React Vite Frontend** to [Render](https://render.com).

---

## ⚡ Method 1: Automatic Blueprint Deployment (Recommended)

The repository includes a pre-configured [`render.yaml`](./render.yaml) blueprint that sets up both the Backend Web Service and the Frontend Static Site automatically.

### Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [dashboard.render.com](https://dashboard.render.com).
3. Click **"New +"** in the top navigation bar and select **"Blueprint"**.
4. Connect your `AI-Health-Analytics-Dashboard` repository.
5. Render will detect `render.yaml` and display:
   - **`medintel-backend`** (Python Web Service)
   - **`medintel-frontend`** (Static Site)
6. Under **Environment Variables**:
   - Enter your **`GEMINI_API_KEY`** (get one free at [aistudio.google.com](https://aistudio.google.com/)).
7. Click **"Apply"**.
8. Render will automatically build and deploy both services!

---

## 🛠️ Method 2: Manual Deployment

If you prefer to configure each service manually in the Render dashboard:

### 1. Deploy the Backend (Python Flask Web Service)

1. In Render Dashboard, click **"New +"** ➔ **"Web Service"**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `medintel-backend` (or your choice)
   - **Language / Runtime**: `Python 3`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Build Command**: 
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     gunicorn --chdir backend app:app --workers 2 --timeout 120
     ```
   - **Health Check Path**: `/health`
   - **Instance Type**: `Free`

4. Add the following **Environment Variables** in the service settings:
   | Key | Value / Example | Note |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Ensures exact Python runtime |
   | `FLASK_ENV` | `production` | Production mode |
   | `SECRET_KEY` | *(generate a random string)* | E.g. `openssl rand -hex 32` |
   | `JWT_SECRET_KEY` | *(generate a random string)* | E.g. `openssl rand -hex 32` |
   | `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
   | `GEMINI_MODEL` | `gemini-1.5-flash` | Fast, low latency model |
   | `DATABASE_URL` | `sqlite:///medintel.db` | Default SQLite or Render Postgres URL |

5. Click **"Create Web Service"**.
6. Once deployed, copy your Backend URL (e.g. `https://medintel-backend.onrender.com`).

---

### 2. Deploy the Frontend (React + Vite Static Site)

1. In Render Dashboard, click **"New +"** ➔ **"Static Site"**.
2. Connect the same GitHub repository.
3. Configure the following settings:
   - **Name**: `medintel-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

4. Add the **Environment Variable**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://medintel-backend.onrender.com/api` |

   *(Replace with your actual backend service URL. Note: `/api` will be appended automatically if omitted!)*

5. Add **Redirects / Rewrites** (Crucial for React Router SPA):
   - Go to **"Redirects/Rewrites"** in the left menu.
   - Click **"Add Rule"**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(This ensures direct links and page refreshes on `/dashboard`, `/reports`, `/analytics` load properly instead of returning 404).*

6. Click **"Create Static Site"**.

---

## 🗄️ Optional: Connecting a Render PostgreSQL Database

By default, the backend runs with SQLite (`sqlite:///medintel.db`). If you want persistent database storage across server restarts:

1. Click **"New +"** ➔ **"PostgreSQL"**.
2. Name: `medintel-db`, Plan: `Free`.
3. Once created, copy the **Internal Database URL** (or External).
4. In your `medintel-backend` Web Service ➔ **Environment**:
   - Set `DATABASE_URL` to the copied PostgreSQL connection string.
   *(The backend code automatically converts `postgres://` to `postgresql://` for SQLAlchemy compatibility).*

---

## 🔍 Verification & Troubleshooting

- **Check API Health**: Visit `https://<your-backend>.onrender.com/health` in your browser. It should return:
  ```json
  {"message": "MedIntel AI API active", "status": "healthy"}
  ```
- **Gemini Free Tier Quotas**: If your Gemini key is missing or hits quota limits, MedIntel AI automatically falls back to simulated offline insights and chatbot mode, ensuring the app never crashes.
- **EasyOCR Memory**: The start command uses `--workers 2 --timeout 120` to prevent memory spikes on Render's 512MB free tier containers.
