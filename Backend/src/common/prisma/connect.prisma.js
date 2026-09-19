import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.ts";
import { DATABASE_URL } from "../constants/app.constant.js";

const url = new URL(DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: Number(url.port) || 3306,
  connectionLimit: 20,
  acquireTimeout: 30000,
  connectTimeout: 30000,
});

const prisma = new PrismaClient({
  adapter,
  omit: {
    nguoi_dung: {
      mat_khau: true,
    },
  },
});

try {
  await prisma.$queryRaw`SELECT 1 + 1 AS result`;
  console.log("Done: Database connection established successfully via Prisma MariaDB Adapter.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export { prisma };
