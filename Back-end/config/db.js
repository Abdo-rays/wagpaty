const mongoose = require('mongoose');
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB Connected: cluster0.bxxsnc0.mongodb.net");
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('  MongoDB disconnected');
});
 
mongoose.connection.on('error', (err) => {
  console.error(` MongoDB error: ${err.message}`);
});
 
module.exports = connectDB;
 