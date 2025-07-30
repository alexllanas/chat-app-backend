import {client} from "../database/db_config.js";

export async function checkForExistingConversation(senderId, recipientId) {
    const query = `
        SELECT id FROM conversations
        WHERE (user1_id = $1 AND user2_id = $2) 
        OR (user1_id = $2 AND user2_id = $1)
        LIMIT 1;
    `
    const result = await client.query(query, [senderId, recipientId])
    return result.rows[0]?.id;

}

export async function saveConversation(
    conversationId,
    user1,
    user2,
    createdAt,
    lastMessage,
    lastMessageTimestamp
) {
    const query = `
        INSERT INTO conversations (id, user1_id, user2_id, created_at, last_message, last_message_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    await client.query(query, [conversationId, user1, user2, createdAt, lastMessage, lastMessageTimestamp])
}

export async function updateConversation(conversationId, lastMessage, lastMessageTimestamp) {
    const query = `
        UPDATE conversations
        SET last_message = $1, last_message_timestamp = $2
        WHERE id = $3
    `
    await client.query(query, [lastMessage, lastMessageTimestamp, conversationId])
}

export async function saveMessage(
    messageId,
    conversationId,
    senderId,
    recipientId,
    content,
    createdAt,
) {
    const query = `
        INSERT INTO messages (id, conversation_id, sender_id, recipient_id, content, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    await client.query(query, [messageId, conversationId, senderId, recipientId, content, createdAt])

}