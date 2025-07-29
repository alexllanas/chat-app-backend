import {client} from "../database/config.js";
import {POSTGRES_ERRORS} from "../database/constants.js";

export function insertUser(userId, username, email, hash, createdAt) {
    const query = `
        INSERT INTO users (id, email, username, password_hash, created_at)
        VALUES ($1, $2, $3, $4, $5)
    `;

    return new Promise((resolve, reject) => {
        client.query(query, [userId, email, username, hash, createdAt], (err, result) => {
            if (err) {
                if (err.code === POSTGRES_ERRORS.UNIQUE_VIOLATION) {
                    if (err.constraint === "users_email_key")
                        return reject({type: "duplicate_email"});
                    else if (err.constraint === "unique_username") {
                        return reject({type: "duplicate_username"});
                    } else {
                        return reject({type: "duplicate"});
                    }
                }
                return reject({type: "server", error: err});
            }
            resolve()
        })
    })
}
