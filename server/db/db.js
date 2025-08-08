// src/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool(process.env.DATABASE_URL);
export const db = drizzle(pool);
