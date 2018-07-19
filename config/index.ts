const configDev = require('./config.dev.json');
const configProd = require('./config.prod.json');

export interface IConfig {
  port: number;
  secret: string;
  db: {
    reconnectTries: number;
    reconnectInterval: number;
    url: string;
  };
}

let config: IConfig;

switch (process.env.NODE_ENV) {
  case 'production':
    config = configProd;
    break;
  case 'development':
  case 'local':
  default:
    config = configDev;
    break;
}

export default config;
