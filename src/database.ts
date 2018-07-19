import mongoose from 'mongoose';
import { IConfig } from '../config';
import { getLogger } from './middlewares/logger';

class Database {
  private static logger = getLogger('Database');
  public static isConnected: boolean = false;

  public static async connect(options: IConfig['db']) {
    try {
      this.initListener();
      await mongoose.connect(options.url, {
        useNewUrlParser: true,
        reconnectTries: options.reconnectTries,
        reconnectInterval: options.reconnectInterval,
      });
      this.logger.info('Connected to MongoDB');
      this.isConnected = true;
    } catch (e) {
      this.logger.error(e);
      this.isConnected = false;
      process.exit(0);
    }
  }

  private static initListener() {
    mongoose.connection.on('connecting', () => this.onConnecting());
    mongoose.connection.on('disconnected', () => this.onDisconnected());
    mongoose.connection.on('reconnected', () => this.onReconnected());
    mongoose.connection.on('reconnectFailed', () => this.onReconnectFailed());
  }

  private static onConnecting() {
    this.logger.info('Connecting to MongoDB...');
  }

  private static onReconnected() {
    this.isConnected = true;
    this.logger.info('MongoDB reconnected');
  }

  private static onDisconnected() {
    if (this.isConnected)
      this.logger.warn('MongoDB disconnected, trying to reconnect...');
    this.isConnected = false;
  }

  private static onReconnectFailed() {
    this.logger.error('Failed to reconnect, please check MongoDB service');
  }
}

export default Database;
