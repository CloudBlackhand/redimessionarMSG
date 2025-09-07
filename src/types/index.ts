export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Para campos select
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
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  body: string;
  type: string;
  timestamp: number;
  from: string;
  fromMe: boolean;
  chatId: string;
  hasQuotedMsg: boolean;
  hasReaction: boolean;
  ack: number;
}

export interface WebhookPayload {
  event: string;
  session: string;
  payload: WhatsAppMessage;
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

export interface FormSubmission {
  id: string;
  configId: string;
  from: string;
  fromName?: string;
  formData: Record<string, any>;
  submittedAt: Date;
  forwardedToGroup: boolean;
  forwardedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
