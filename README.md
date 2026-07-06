# MedIntel AI – AI-Powered Health Analytics Dashboard

MedIntel AI is a production-quality, portfolio-grade SaaS application designed to empower patients, doctors, and healthcare professionals. The platform allows users to upload medical reports (PDFs/images), extract structured lab parameters using EasyOCR, track longitudinal trends, perform side-by-side report comparisons, and receive personalized, evidence-backed clinical summaries using the Google Gemini API.

---

## 🚀 Key Modules & Architecture

* **Landing Experience**: Premium SaaS introduction featuring glassmorphic designs, responsive mobile drawers, feature deep-dives, step-by-step pipeline flows, and interactive mock dashboards.
* **Authentication**: JWT-based session management, protected React Router v7 routes, and database verification.
* **OCR Extraction Engine**: Auto-scans document matrices to retrieve Patient Name, Age, Gender, Date, and 50+ medical values (e.g., Blood Sugar, Vitamin D, Cholesterol, Hemoglobin).
* **AI Medical Assistant**: Contextual diagnostics, abnormality flagging, terminology translation, and lifestyle advice.
* **Interactive Analytics**: Plotly & Recharts dashboards plotting historical health scores, vitals, and longitudinal lab progress.
* **Report Comparison Panel**: Side-by-side comparative matrices indicating percentage changes and trend vectors.
* **Security & Compliance**: Isolated database structures with HIPAA-compliant transmission standards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, React Router DOM, Lucide React, React Hook Form, Zod, Axios, React Dropzone, Recharts, Plotly.js |
| **Backend** | Python, Flask, Flask-JWT-Extended, SQLAlchemy, SQLite, EasyOCR, Gemini API, Scikit-Learn |
| **Deployment** | Vercel (Frontend) • Render (Backend) |

---

## 📅 The 8-Phase Roadmap

1. **Phase 1: Project Setup, Tailwind v4 Integration, & SaaS Landing Page** (Completed)
2. **Phase 2: Authentication & Database Schema Setup**
3. **Phase 3: OCR File Upload & Medical Value Parsing Pipeline**
4. **Phase 4: Gemini AI Diagnostic & Wellness Insights**
5. **Phase 5: Medical Analytics Dashboard & Trends (Recharts/Plotly)**
6. **Phase 6: Multi-Report Side-by-Side Comparison Panel**
7. **Phase 7: User Profile, Settings, & PDF/Email Export Integration**
8. **Phase 8: Optimization, System Verification, & Deployment Preparation**

---

## 🛠️ Local Development Setup

### Prerequisites
* Node.js v18+
* Python 3.10+

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```
4. Run the development Flask server:
   ```bash
   python app.py
   ```
