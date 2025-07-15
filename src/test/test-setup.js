// src/test/setup.js or inside your test file
import mongoose from 'mongoose';

beforeAll(async () => {
  const dbUri = "mongodb+srv://akhilraishetti21:ZIskZ9vYzFDvmhCx@cluster0.k8hw2z8.mongodb.net/ecommerce"; // or use your actual URI
  const db = await mongoose.connect(dbUri);
  console.log(`db`, db.connection);
}, 15000); // Give 15s for slow startups

afterAll(async () => {
  await mongoose.connection.close();
});
