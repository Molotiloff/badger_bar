const mongoose = require("mongoose");

const mongoDB = "mongodb://127.0.0.1:27017/reservation_system";
mongoose.Promise = global.Promise;

const clearDatabase = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect(mongoDB);
    console.log("MongoDB connected successfully!");

    // Получение всех коллекций
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`Cleared collection: ${collection.name}`);
    }

    console.log("Database cleared successfully!");
  } catch (err) {
    console.error("Error clearing database:", err);
  } finally {
    mongoose.connection.close();
  }
};

clearDatabase();
