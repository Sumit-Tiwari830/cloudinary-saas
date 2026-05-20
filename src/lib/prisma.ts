import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL!;

const prismaClientSingleton = () => {
    // We use pg.Pool with strict limits to survive Neon's cold starts and free tier limits
    const pool = new pg.Pool({
        connectionString,
        connectionTimeoutMillis: 10000, // 10 seconds to allow Neon to wake up
        max: 5 // Prevents pool exhaustion
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export default prisma;