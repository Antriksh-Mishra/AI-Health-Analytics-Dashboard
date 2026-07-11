export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "patient" | "doctor";
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BiometricData {
  id: number;
  report_id: number;
  user_id: number;
  test_date: string | null;
  hemoglobin: number | null;
  blood_sugar: number | null;
  cholesterol: number | null;
  vitamin_d: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  extra_metrics: Record<string, any>;
  created_at: string;
}

export interface Report {
  id: number;
  filename: string;
  file_path: string;
  ocr_status: "pending" | "processing" | "completed" | "failed";
  raw_text: string | null;
  ai_insights?: {
    summary: string;
    flagged_items: Array<{
      metric: string;
      value: string;
      range: string;
      reason: string;
    }>;
    wellness_recommendations: string[];
  } | null;
  uploaded_at: string;
  user_id: number;
  biometrics: BiometricData[];
}
