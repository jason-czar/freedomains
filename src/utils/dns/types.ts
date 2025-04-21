
import { DomainSettings } from "@/types/domain-types";

export interface DNSVerificationResult {
  success: boolean;
  records?: any[];
  message?: string;
  error?: string;
  verification?: {
    success: boolean;
    message?: string;
    records?: any[];
  };
}

export interface DNSResponse {
  success: boolean;
  error?: string;
  records?: any[];
  verification?: {
    success: boolean;
    message?: string;
    records?: any[];
  };
}
