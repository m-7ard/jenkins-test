// src/index.js
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function connectWithRetry(maxAttempts = 5, delay = 5000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const pool = mysql.createPool(dbConfig);
            // Test the connection
            await pool.getConnection();
            console.log('Successfully connected to database');
            return pool;
        } catch (err) {
            console.log(`Connection attempt ${attempt}/${maxAttempts} failed`);
            console.error('Error:', err.message);
            
            if (attempt === maxAttempts) {
                throw new Error('Max connection attempts reached. Exiting.');
            }
            
            // Wait before trying again
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function startServer() {
    try {
        // Create connection pool with retry mechanism
        const pool = await connectWithRetry();
        await pool.query("INSERT INTO users SET name = 'test123', email = 'test123'")

        // Test connection and print rows
        const [rows] = await pool.query('SELECT * FROM users');
        console.log('Current users:', rows);

        app.get('/', (req, res) => {
            res.json({ message: 'Hello from Express!' });
        });

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();