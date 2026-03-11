export interface User {
  id: string;
  username: string;
  color: string;
}

export interface Message {
  id: string;
  userId: string;
  username: string;
  color: string;
  text: string;
  timestamp: number;
}
