import dotenv from 'dotenv';

dotenv.config();

interface Config{
    serverPort: number;
    nodeEnv: string;
    pgHost: string;
    pgPort: number;
    pgDatabase: string;
    pgUser: string;
    pgPassword: string;
    log_destination_path: string;
}

const config : Config = {
    serverPort : Number(process.env.PORT) || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
    pgHost: process.env.PG_HOST || 'localhost',
    pgPort: Number(process.env.PG_PORT) || 5432,
    pgDatabase: process.env.PG_DATABASE || 'speedy_poker',
    pgUser: process.env.PG_USER || '',
    pgPassword: process.env.PG_PASSWORD || '',
    log_destination_path: process.env.LOG_DESTINATION_PATH || 'src/server.log',
}

export default config;