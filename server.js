import 'dotenv/config';
import express from 'express';
import {http , createServer} from 'http';
import cors from 'cors';

import connectDB from './config/db.js';
import { create } from 'domain';

const app = express();
const server = createServer(app);

// Connect to MongoDB
await connectDB();
