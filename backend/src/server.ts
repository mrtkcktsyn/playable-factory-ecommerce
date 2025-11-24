import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import connectDatabase from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();

        const server = http.createServer(app);

        server.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
    } catch (err) {
        const error = err as Error;
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();