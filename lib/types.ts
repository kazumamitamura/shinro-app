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

// ===== Form / Action types =====

export interface ApplyFormData {
  student_class: string;
  student_number: number;
  student_name: string;
  doc_type: DocType;
  quantity: number;
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

// Table name constant
export const SHINRO_REQUESTS_TABLE = "shinro_requests" as const;
