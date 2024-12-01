import app from './app';
import logger from './utils/logger';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

server.on('error', (error: Error) => {
  logger.error('Server error:', error);
  process.exit(1);
}); 