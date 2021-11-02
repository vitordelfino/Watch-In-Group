import moment from 'moment';

export interface Room {
  id: string;
  owner: Owner;
  lastJoined?: moment.Moment;
  users: Map<string, User>;

  videos: Map<string, string>;
}

export interface User {
  name: string;
  id: string;
}

export interface Owner {
  ownerSlug: string;
  name: string;
}

export interface WsEnterOnRoomPayload {
  room: string;
  user: string;
}

export interface WsAddVideoPayload {
  room: string;
  video: string;
}
