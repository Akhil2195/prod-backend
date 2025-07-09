import mongoose  from "mongoose";

const connectDB = async () => {
    try {
       const dbInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
       console.log(`dbInstance is running on port ${dbInstance.connection.port}`)
    } catch(err) {
        console.log(`err in database connection`, err);
        process.exit(1);
    }
}
export default connectDB;