import express from "express";
import accountsRouter from "./routes/account.js";
import {promises as fs} from "fs";
import winston from "winston";

const app = express();
app.use(express.json());

const {combine, timestamp, label, printf} = winston.format;
const myFormat = printf(({level, message, label, timestamp})=>{
    return `${timestamp} [${label}] ${level}: ${message}`;
})
global.logger = winston.createLogger({
    level: "silly",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: "my-bank-api.log"})
    ],
    format: combine(
        label({ label: "my-bank-api"}),
        timestamp(),
        myFormat
    )
})

app.use("/account", accountsRouter);

app.listen(8080, async ()=>{
    const initialJson = {
        nextId: 1,
        accounts: []
    }
    try {
        const accountData = JSON.parse(await fs.readFile("./data/accounts.json"));
    } catch (error) {
        try {
            await fs.writeFile("./data/accounts.json", JSON.stringify(initialJson)); 
        } catch (error) {
            logger.error(error);
        }
    }
    logger.info("Online.");
});