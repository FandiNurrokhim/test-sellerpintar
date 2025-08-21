// src/types/whatsapp.ts
export type WhatsAppBotStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "CONNECTING"
  | "ERROR"
  | "INACTIVE"
  | "ACTIVE"
  | "INITIALIZING"
  | "AUTH_FAILURE"
  | "READY";

export type WhatsAppConnectionStatus =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";

export interface BotSession {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string;
  sessionId: string;
  assistantId: string;
  name: string;
  botStatus: "ACTIVE" | "INACTIVE";
  phoneNumber: string;
  qrCode: string;
  isActive: boolean;
  lastConnectedAt: string;
}

export interface WhatsAppSetting {
  data: BotSession;
  id: string;
  userId: string;
  organizationId: string;
  branchId: string;
  sessionId: string;
  assistantId: string;
  name: string;
  botStatus: WhatsAppBotStatus;
  phoneNumber: string;
  qrCode: string;
  isActive: boolean;
  lastConnectedAt: string;
  assistantName: string;
}

export interface CreateWhatsAppSettingPayload {
  name: string;
  assistantId: string;
  autoReply: boolean;
}

export interface UpdateWhatsAppSettingPayload {
  name?: string;
  assistantId?: string;
  autoReply?: boolean;
  isActive?: boolean;
}

export interface WhatsAppSettingsResponse {
  success: boolean;
  data: WhatsAppSetting[];
}

export interface WhatsAppSettingResponse {
  success: boolean;
  data: WhatsAppSetting;
}

export interface WhatsAppConnectionResponse {
  data: WhatsAppConnectionResponse;
  settingsId: string;
  status: WhatsAppBotStatus;
  qrCode?: string;
  message: string;
}
export interface WhatsAppStatusResponse {
  qrCode: null;
  status: string;
  success: boolean;
  data?: {
    settingsId: string;
    status: WhatsAppBotStatus;
    phoneNumber: string;
    lastConnectedAt: string;
    qrCode: string;
    settings: WhatsAppSetting;
  };
}

export interface WhatsAppDeleteResponse {
  success: boolean;
  message: string;
}

export interface WhatsAppConnectionWaitOptions {
  maxAttempts?: number;
  intervalMs?: number;
}

export interface WhatsAppConnectionInfo {
  isConnected: boolean;
  phoneNumber?: string;
  lastConnectedAt?: string;
  qrCode?: string;
}

export interface WhatsAppApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface GetHistoryParams {
  assistantId?: string;
  contactNumber?: string;
  whatsappInboundSettingsId?: string;
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  handlerId: string;
  metadata?: {
    manualReply?: boolean;
  };
}

export interface ChatRoom {
  id: string;
  contactNumber: string;
  contactName: string;
  autoReply: boolean;
  messageCount: number;
  lastActive: string;
  lastMessageAt: string;
  handlerId: string;
  lastMessage: ChatMessage;
}

export interface WhatsAppHistoryResponse {
  chatRooms: ChatRoom[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
