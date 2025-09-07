export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface BotConfig {
  id: string;
  name: string;
  greetingMessage: string;
  formMessage: string;
  formFields: FormField[];
  targetGroupId: string;
  targetGroupName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WahaSession {
  name: string;
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED';
  engine: string;
  me?: {
    id: string;
    name: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  isReadOnly: boolean;
  unreadCount: number;
  timestamp: number;
  pinned: boolean;
  isMuted: boolean;
  muteExpiration: number | null;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  owner: string;
  creation: number;
  participants: Array<{
    id: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
  }>;
  participantsCount: number;
}

export interface FormSubmission {
  id: string;
  configId: string;
  from: string;
  fromName?: string;
  formData: Record<string, any>;
  submittedAt: string;
  forwardedToGroup: boolean;
  forwardedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
