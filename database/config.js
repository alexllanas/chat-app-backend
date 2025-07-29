import {Client} from "pg";
import {config} from "dotenv";
import {readFileSync} from "node:fs";

config();

export const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: readFileSync(process.env.DB_CA).toString(),
    }
});

export function connectDb() {
    client.connect()
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((err) => {
            console.log(err);
        })
}
