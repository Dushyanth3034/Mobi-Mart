const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate database
    await testConnection();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  MobiMart Backend API Server running on port ${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log(`  Dashboard: http://localhost:${PORT}/api/dashboard/summary`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
