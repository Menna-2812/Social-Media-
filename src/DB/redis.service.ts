import { redisClient } from "./redis.connection.js";

interface TokenParams {
  userId: string | number;
}
interface RevokeTokenParams extends TokenParams {
  jti: string;
}

interface RedisSetParams {
  key: string;
  value: any;
  ttl?: number | null;
}

// Revoke Token
export const revokeTokenKeyPrefix = ({ userId }: TokenParams): string => {
  return `user:revokeToken:${userId}`;
};
export const revokeTokenKey = ({ userId, jti }: RevokeTokenParams): string => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};
export const logoutAllKey = ({ userId }: TokenParams) => {
  return `user:logoutAll:${userId}`;
};

// Set a Kry-value pair in Redis
export const set = async ({
  key,
  value,
  ttl = null,
}: RedisSetParams): Promise<string | null> => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Set Error", error);
    return null;
  }
};

// Get a value by key from Redis
export const get = async ({ key }: { key: string }): Promise<string | null> => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log("Redis Get Error", error);
    return null;
  }
};

// update a key-value pair in Redis
export const update = async ({
  key,
  value,
  ttl = null,
}: {
  key: string;
  value: any;
  ttl?: number | null;
}): Promise<string | boolean | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis Update Error", error);
    return null;
  }
};

// delete pair
export const del = async ({
  key,
}: {
  key: string;
}): Promise<number | boolean | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.log("Redis Delete Error", error);
    return null;
  }
};

// expire
export const expire = async ({
  key,
  ttl,
}: {
  key: string;
  ttl: number;
}): Promise<number | null | boolean> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis Expire Error", error);
    return null;
  }
};

// ttl
export const ttl = async ({
  key,
}: {
  key: string;
}): Promise<number | boolean | null> => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis TTL Error", error);
    return null;
  }
};

// keys pattern
export const keys = async ({
  pattern,
}: {
  pattern: string;
}): Promise<string[] | null> => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis Keys Error", error);
    return null;
  }
};

export const otpCooldownKey = ({ email }: {email: string}) => {
  return `otp:cooldown:${email}`;
};

export const otpResendKey = ({ email }: {email: string}) => {
  return `otp:resend:${email}`;
};

export const otpKey = ({ email }: {email: string}) => {
  return `otp:${email}`;
};

export const rateLimitKey = ({ ip }: {ip: string | number}) => {
  return `rateLimit:${ip}`;
};
