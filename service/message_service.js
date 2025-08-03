import {client} from "../database/db_config.js";

export async function checkForExistingChat(user1, user2) {
    const query = `
        SELECT id FROM chats
        WHERE (user1_id = $1 AND user2_id = $2) 
        OR (user1_id = $2 AND user2_id = $1)
        LIMIT 1;
    `
    const result = await client.query(query, [user1, user2])
    return result.rows[0]?.id;
}

export async function saveChat(
    chatId,
    user1,
    user2,
    createdAt,
    lastMessage,
    lastMessageTimestamp
) {
    const query = `
        INSERT INTO chats (id, user1_id, user2_id, created_at, last_message, last_message_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    await client.query(query, [chatId, user1, user2, createdAt, lastMessage, lastMessageTimestamp])
}

export async function updateChat(chatId, lastMessage, lastMessageTimestamp) {
    const query = `
        UPDATE chats
        SET last_message = $1, last_message_timestamp = $2
        WHERE id = $3
    `
    await client.query(query, [lastMessage, lastMessageTimestamp, chatId])
}

export async function saveMessage(
    messageId,
    chatId,
    senderId,
    recipientId,
    content,
    createdAt,
) {
    const query = `
        INSERT INTO messages (id, chat_id, sender_id, recipient_id, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    await client.query(query, [messageId, chatId, senderId, recipientId, content, createdAt])
}

export async function getChats(userId) {
    const query = `
        SELECT c.id, u.id as "userId", c.last_message as "lastMessage", c.last_message_timestamp as "lastMessageTimeStamp", u.username
        FROM chats as c
        JOIN users as u on u.id = (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END)
        WHERE c.user1_id = $1 OR c.user2_id = $1
        ORDER BY c.last_message_timestamp DESC;
    `
    const result = await client.query(query, [userId])
    return result.rows;
}

export async function getMessages(chatId) {
    const query = `
        SELECT m.id, 
               m.chat_id as "chatId", 
               m.sender_id as "senderId", 
               m.recipient_id as "recipientId", 
               m.content, 
               m.created_at as "createdAt",
               m.is_read as "isRead"
        FROM messages as m
        WHERE m.chat_id = $1
        ORDER BY m.created_at ASC ;
    `
    const result = await client.query(query, [chatId])
    return result.rows;
}