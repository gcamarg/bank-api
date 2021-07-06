import express from "express"; 
import {promises as fs} from "fs";

const router = express.Router();


router.post("/criar",async (req,res,next)=>{
    try {
        const accountData = JSON.parse(await fs.readFile("./data/accounts.json"));
        if(!req.body.name ){
            throw new Error("Nome é obrigatório.")
        }
        accountData.accounts.push({
            id: accountData.nextId++,
            name: req.body.name,
            balance: 0
        })
        await fs.writeFile("./data/accounts.json",JSON.stringify(accountData));
        res.send(`Bem vindo(a), ${req.body.name}! Seu id é ID: ${accountData.nextId-1}`)
        logger.info(`POST user: ${req.body.name}, ID: ${accountData.nextId-1}`)
    } catch (err) {
        next(err);
    }
});

router.put("/deposit",async (req,res,next)=>{
    try {
        const accountData = JSON.parse(await fs.readFile("./data/accounts.json"));
        let index = accountData.accounts.findIndex((acc)=>{
            return acc.id === req.body.id;
        });
        accountData.accounts[index].balance+=req.body.value;
    
        await fs.writeFile("./data/accounts.json",JSON.stringify(accountData));
        res.send(`Depositado ${req.body.value} na conta de ${accountData.accounts[index].name}.`)
    } catch (err) {
        next(err);
    }
});
router.put("/withdraw",async (req,res, next)=>{
    try {
        const accountData = JSON.parse(await fs.readFile("./data/accounts.json"));
        const index = accountData.accounts.findIndex((acc)=>{
            return acc.id === req.body.id;
        });
        if (accountData.accounts[index].balance >= req.body.value) {
            accountData.accounts[index].balance-=req.body.value;
        }else{
            res.send(`Valor em conta insuficiente! Saldo disponível: ${accountData.accounts[index].balance}.`)
        }
    
        await fs.writeFile("./data/accounts.json",JSON.stringify(accountData));
        res.send(`Saque de ${req.body.value} da conta. Saldo restante: ${accountData.accounts[index].balance}.`)
    } catch (err) {
        next(err);
    }
});

router.get("/balance", async (req,res,next)=>{
    try {
        const accountData = JSON.parse(await fs.readFile("./data/accounts.json"));
        const index = accountData.accounts.findIndex((acc)=>{
            return acc.id === req.body.id;
        });
        res.send(`Olá ${accountData.accounts[index].name}. Seu saldo é: ${accountData.accounts[index].balance}`)
    } catch (err) {
        next(err);
    }
});

router.delete("/delete", async (req,res,next)=>{
    try {
        const accountData = JSON.parse(await fs.readFile("./data/accounts.json"));
        const index = accountData.accounts.findIndex((acc)=>{
            return acc.id === req.body.id;
        });
        if(index===-1){
            return res.send(`Nenhuma conta associada ao id ${req.body.id}.`)
        }
        if(accountData.accounts[index].balance < 0){ 
            return res.send(`Você precisa quitar suas pendências antes de encerrar sua conta.`);
        } else if(accountData.accounts[index].balance > 0){
            return res.send(`Você ainda possui saldo em conta. Saque o valor disponível e tente novamente.`)
        }
        let name = accountData.accounts[index].name;
        accountData.accounts.splice(index,1);
        await fs.writeFile("./data/accounts.json",JSON.stringify(accountData));
        res.send(`Usuário ${name} teve sua conta deletada.`)
    } catch (err) {
        next(err);
    }
});

router.use( (err,req,res,next)=>{
    logger.error(`${req.method} at ${req.baseUrl} - ${err.message}`);
    res.status(400).send({error: err.message});
})

export default router;
