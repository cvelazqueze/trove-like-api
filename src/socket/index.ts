import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config';
import { verifyToken } from '../utils/jwt';
import { logger } from '../lib/logger';
import type { PriceChangeEvent } from './types';

export function collectionRoom(collectionId: string) {
  return `${config.socket.roomPrefix}${collectionId}`;
}

export function createSocketServer(httpServer: HttpServer) {
  const corsOrigin =
    config.socket.corsOrigin === '*'
      ? '*'
      : config.socket.corsOrigin.split(',').map((o) => o.trim());

  const io = new Server(httpServer, {
    cors: { origin: corsOrigin },
    path: config.socket.path,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      socket.data.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id, userId: socket.data.user?.sub }, 'Socket connected');

    socket.on('collection:watch', (collectionId: string) => {
      if (typeof collectionId !== 'string') return;
      socket.join(collectionRoom(collectionId));
      logger.debug({ socketId: socket.id, collectionId }, 'Watching collection');
    });

    socket.on('collection:unwatch', (collectionId: string) => {
      if (typeof collectionId !== 'string') return;
      socket.leave(collectionRoom(collectionId));
    });

    socket.on('disconnect', () => {
      logger.debug({ socketId: socket.id }, 'Socket disconnected');
    });
  });

  async function notifyPriceChange(event: PriceChangeEvent) {
    const payload = {
      productId: event.productId,
      name: event.name,
      previousPrice: event.previousPrice,
      newPrice: event.newPrice,
      changedAt: new Date().toISOString(),
    };

    for (const collectionId of event.collectionIds) {
      io.to(collectionRoom(collectionId)).emit('product:price_changed', {
        collectionId,
        ...payload,
      });
    }
  }

  return { io, notifyPriceChange };
}
