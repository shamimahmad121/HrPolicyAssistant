export interface Citation {
  documentName: string;
  section: string;
  version: number;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  citations?: Citation[];
  timestamp: string;
  pending?: boolean;
}
