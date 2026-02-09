// ===== 共通定数 =====

export const CLASS_OPTIONS = [
  "LIA",
  "LIB",
  "CA",
  "CB",
  "CC",
  "CD",
  "E",
  "M",
  "A",
] as const;

export const STUDENT_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

// ===== shinro_requests table types =====

export type DocType = "survey_report" | "recommendation";

export type RequestStatus = "pending" | "issued";

export interface ShinroRequest {
  id: string;
  user_id: string;
  student_class: string;
  student_number: number;
  student_name: string;
  doc_type: DocType;
  quantity: number;
  total_fee: number;
  status: RequestStatus;
  created_at: string;
}

// ===== student_profiles table types =====

export interface StudentProfile {
  id: string;
  user_id: string;
  email: string;
  student_class: string;
  student_number: number;
  student_name: string;
  email_verified: boolean;
  verification_token: string;
  created_at: string;
}

// ===== Form / Action types =====

export interface ApplyFormData {
  student_class: string;
  student_number: number;
  student_name: string;
  doc_type: DocType;
  quantity: number;
}

export interface RegisterFormData {
  email: string;
  password: string;
  student_class: string;
  student_number: number;
  student_name: string;
}

export interface FeeCalculationResult {
  totalFee: number;
  freeApplied: boolean;
  freeQuantity: number;
  paidQuantity: number;
  unitPrice: number;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: ShinroRequest;
}
