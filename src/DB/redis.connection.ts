import {createClient} from "redis";
import {REDIS_URI} from "../config/config.service"

export const redisClient = createClient({url: REDIS_URI as string});

export const redisConnection = async () => {
    try{
        await redisClient.connect();
        console.log("Redis Connected Successfully");
    } catch(error){
        console.log("Failed to Connect To Redis", error)
    }
}