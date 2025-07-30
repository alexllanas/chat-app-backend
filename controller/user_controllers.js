import { client} from "../database/db_config.js";
import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt";
import {getAccessToken, hashPassword} from "../service/auth_service.js";
import {insertUser} from "../service/user_service.js";

export function getHomePage(req, res) {
    res.send("Chat App");
}

export async function getUsers(req, res) {
    const users = await client.query("SELECT id, username, email FROM users");
    res.json({
        users: users.rows
    });
}

export async function registerUser(req, res) {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
        res.status(400).json({error: "Missing username, email or password"});
    }

    const hash = await hashPassword(password);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();
    const lastLogin = new Date().toISOString();

    try {
        await insertUser(userId, username, email, hash, createdAt);

        const token = getAccessToken(userId, email);

        return res.status(201).json({
            "id": userId,
            "username": username,
            "email": email,
            "accessToken": token,
            "lastLogin": lastLogin,
            "createdAt": createdAt,
        });

    } catch (err) {
        if (err.type === "duplicate_email") {
            return res.status(409).json({error: "A user with this email already exists"});
        } else if (err.type === "duplicate_username") {
            return res.status(409).json({error: "A user with this username already exists"});
        } else if (err.type === "duplicate") {
            return res.status(409).json({error: "This user already exists"});
        }
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export async function login(req, res) {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({error: "Missing email or password"});
    }

    const query = `
        SELECT id, username, password_hash
        FROM users
        WHERE email = $1
    `
    const result = await client.query(query, [email])
    if (result.rowCount === 0) {
        return res.status(401).json({error: "Invalid email or password"});
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({error: "Invalid email or password"});
    }

    const accessToken = getAccessToken(user.id, email);
    const lastLogin = new Date().toISOString();

    res.json({
        "id": user.id,
        "username": user.username,
        "email": email,
        "accessToken": accessToken,
        "lastLogin": lastLogin,

    })
}
