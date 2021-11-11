import { RoomsService } from './rooms.service';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomsGateway } from './rooms.gateway';
import { mock } from 'jest-mock-extended';
import { Socket, Server } from 'socket.io';
import { Room } from './types/room';

describe('RoomsGateway', () => {
  let gateway: RoomsGateway;
  const serviceMock = mock<RoomsService>();
  const socketMock = { id: 'client-id' } as Socket;
  const serverMock = mock<Server>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsGateway, RoomsService, Server],
    })
      .overrideProvider(RoomsService)
      .useValue(serviceMock)
      .compile();

    gateway = module.get<RoomsGateway>(RoomsGateway);
    gateway.server = serverMock;
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleEnterOnRoom', () => {
    it('should throw exception when room does not exists', () => {
      serviceMock.getRoom.mockReturnValue(null);
      expect(() =>
        gateway.handleEnterOnRoom(socketMock, { room: 'xpto', user: 'fulano' }),
      ).toThrow('Room xpto not found');
    });

    it('should join user on room', () => {
      const room: Room = {
        id: 'xpto',
        owner: {
          ownerSlug: 'fulano',
          name: 'fulano',
        },
        users: new Map(),
        videos: new Map(),
      };
      serviceMock.getRoom.mockReturnValue(room);
      serverMock.socketsJoin.mockReturnValue(null);
      serverMock.to.mockReturnValue(serverMock as any);
      const spySocketsJoin = jest.spyOn(serverMock, 'socketsJoin');
      const spyEmit = jest.spyOn(serverMock, 'emit');
      gateway.handleEnterOnRoom(socketMock, { room: 'xpto', user: 'fulano' });
      expect(spySocketsJoin).toHaveBeenCalledWith('xpto');
      expect(spyEmit).toHaveBeenCalledWith('user-entered-room', {
        id: 'client-id',
        room: 'xpto',
      });
    });
  });

  describe('handleLeftRoom', () => {
    it('should remove user from socket room', () => {
      serverMock.to.mockReturnValue(serverMock as any);
      const spyEmit = jest.spyOn(serverMock, 'emit');
      gateway.handleLeftRoom(socketMock, 'room');
      expect(spyEmit).toHaveBeenCalledWith(
        'user-left-room',
        `User client-id left room`,
      );
    });
  });

  describe('handleAddVideo', () => {
    it('should add video and emit video-added event', () => {
      serverMock.to.mockReturnValue(serverMock as any);
      const spyEmit = jest.spyOn(serverMock, 'emit');
      const payload = {
        room: 'room',
        video: 'https://video.com',
      };
      gateway.handleAddVideo(socketMock, payload);
      expect(spyEmit).toHaveBeenCalledWith('video-added', payload);
    });
  });

  describe('handlePlayVideo', () => {
    it('should emit play event', () => {
      serverMock.to.mockReturnValue(serverMock as any);
      const spyEmit = jest.spyOn(serverMock, 'emit');
      const payload = {
        room: 'room',
        video: 'https://video.com',
      };
      gateway.handlePlayVideo(socketMock, payload);
      expect(spyEmit).toHaveBeenCalledWith('play', payload);
    });
  });

  describe('handlePauseVideo', () => {
    it('should emit pause event', () => {
      serverMock.to.mockReturnValue(serverMock as any);
      const spyEmit = jest.spyOn(serverMock, 'emit');
      const payload = {
        room: 'room',
        video: 'https://video.com',
      };
      gateway.handlePauseVideo(socketMock, payload);
      expect(spyEmit).toHaveBeenCalledWith('pause', payload);
    });
  });

  describe('handleDisconnect', () => {
    it('should log error', () => {
      serviceMock.removeUser.mockImplementation(() => {
        throw new Error('Nothin to remove');
      });
      const spy = jest.spyOn(gateway, 'handleDisconnect');
      gateway.handleDisconnect(socketMock);
      expect(spy).toHaveBeenCalled();
    });
    it('should emit user-left-room event', () => {
      serverMock.to.mockReturnValue(serverMock as any);
      const spyEmit = jest.spyOn(serverMock, 'emit');
      const room: Room = {
        id: 'xpto',
        owner: {
          ownerSlug: 'fulano',
          name: 'fulano',
        },
        users: new Map(),
        videos: new Map(),
      };
      const user = { name: 'fulano', id: '' };
      serviceMock.removeUser.mockReturnValue({
        user,
        room,
      });
      gateway.handleDisconnect(socketMock);
      expect(spyEmit).toHaveBeenCalledWith(
        'user-left-room',
        `User fulano disconnected`,
      );
    });
  });

  it('should call handleConnection', () => {
    const spy = jest.spyOn(gateway, 'handleConnection');
    gateway.handleConnection(socketMock);
    expect(spy).toHaveBeenCalled();
  });

  it('should call afterInit', () => {
    const spy = jest.spyOn(gateway, 'afterInit');
    gateway.afterInit(serverMock);
    expect(spy).toHaveBeenCalled();
  });
});
