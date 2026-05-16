/* import mongoose from "mongoose";

const dburl = process.env.MONGODB_URL;
if(!dburl){
    throw new Error("MONGODB_URL is not defined in the env file");
}

function connectDB(){
    mongoose.connect(dburl!)
    .then(()=>{
        console.log("MongoDB connected successfully!!!")
    })
    .catch((err)=>{
        console.log("MongoDB connection Failed",err);
    })
}

export default connectDB; */

import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("MongoDB connected successfully!!!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;