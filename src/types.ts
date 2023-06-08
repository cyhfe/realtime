export interface IChannel {
  createdAt: string;
  id: string;
  name: string;
  userId: string;
}

export interface User {
  username: string;
  id: string;
  avatar: string;
}

export interface ChannelMessage {
  content: string;
  createdAt: string;
  from: User;
  fromUserId: string;
  id: string;
  read: boolean;
  toChannelId: string;
}

export interface PrivateMessage {
  content: string;
  createdAt: string;
  from: User;
  fromUserId: string;
  id: string;
  to: User;
  toUserId: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  name: string;
  userId: string
}
