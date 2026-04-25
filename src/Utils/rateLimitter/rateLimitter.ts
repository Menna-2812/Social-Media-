import { Request, Response, NextFunction } from "express";

type IpRequestData = {
    count: number;
    startTime: number
}
const ipRequests: Record<string,IpRequestData> = {};
const blockedIps: Set<string> = new Set();
const unblockTimers: Map<string,NodeJS.Timeout> = new Map();
const RATE_LIMIT = 10;
const WINDOW_SECONDS = 5 * 60 * 1000;

export const customRateLimitter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    const ip = req.ip || "unKnown";
    const currentTime = Date.now();

    if(blockedIps.has(ip)) {
        return res.status(403).json({
            message: "Bloccked IP, please try again later",
        });
    }

    if(!ipRequests[ip]) {
        ipRequests[ip] = {
            count: 1,
            startTime: currentTime,
        };
        return next();
    }
    
    const diff = currentTime - ipRequests[ip].startTime;

    if(diff < WINDOW_SECONDS){
        ipRequests[ip].count++;

        if(ipRequests[ip].count > RATE_LIMIT){
            blockedIps.add(ip);

            if(!unblockTimers.has(ip)){
                const timer = setTimeout(()=>{
                    blockedIps.delete(ip);
                    unblockTimers.delete(ip);
                }, WINDOW_SECONDS);
                unblockTimers.set(ip, timer);
            }
        }
    }
};
