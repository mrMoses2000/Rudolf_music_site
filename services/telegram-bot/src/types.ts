export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  voice?: TelegramVoice;
  audio?: TelegramAudio;
  document?: TelegramDocument;
  photo?: TelegramPhotoSize[];
  caption?: string;
}

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
}

export interface TelegramChat {
  id: number;
}

export interface TelegramVoice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramAudio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
  title?: string;
}

export interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface PendingChange {
  chatId: number;
  /** message_id of the diff preview message with inline buttons */
  previewMessageId: number;
  /** full git diff output */
  diff: string;
  /** auto-cancel timer */
  timeoutHandle: NodeJS.Timeout;
  /** original user request — used for commit message */
  userMessage: string;
}

export interface GeminiResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface TelegramFile {
  file_id: string;
  file_path: string;
  file_size?: number;
}
