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
}

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
}

export interface TelegramChat {
  id: number;
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
}

export interface GeminiResult {
  success: boolean;
  stdout: string;
  stderr: string;
}
