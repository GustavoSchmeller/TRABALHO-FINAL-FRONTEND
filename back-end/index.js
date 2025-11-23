import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import session from "express-session";

dotenv.config();
const app = express();
const port = 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax"
}}))

app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)



// FAZER MIDDLEWARES PRA VALIDAR SE USUÁRIO EXISTE


// FUNÇÃO QUE VAI CHECAR O LOGIN PARA O USUÁRIO NÃO PRECISAR REFAZER O LOGIN NAS PAGINAS AO RECARREGAR
function checklogin(req,res,next){
    try{
        if (req.session.data == undefined || req.session.data == null) {
            return res.status(403).json({logado:false})
        } else {
            return res.status(200).json({logado:true})
        }
        
    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
}

async function validarDescricao(req,res,next){
    try{

        const { descricao } = req.body;
        if (!descricao || descricao.length == 0){
            return res.status(500).json({message: "A descrição da tarefa informada é inválida."})
        } 
        if (descricao.length <= 3) {
            return res.status(500).json({message: "A descrição precisa ter mais de 3 caracteres."})
        } 
        next()

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
}

async function validarTarefa(req,res,next){ 
    try{

        let { id } = req.params 
        id = Number(id)
        const { data:selectTarefa,error:selectErro } = await supabase
        .from('tarefas')
        .select()
        .eq('id',id)

        if(isNaN(id) || !Number.isInteger(id)){
            return res.status(500).json({message: "O parametro informado precisa ser um inteiro"})
        }
        if (!selectTarefa || selectTarefa.length === 0) {
            return res.status(500).json({message: "A tarefa informada não existe."})
        }
        if (selectErro) {
            return res.status(500).json({message: "Houve um erro:", erro: selectErro.message})
        }
        next()

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
}

function validarAuth(req,res,next) {
    try{
        if (req.session.data == undefined || req.session.data == null) {
            return res.status(403).json({message:"Acesso negado! Você precisa estar logado."})
        }
        next()

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
}

function validarLogin(req,res,next){
     try{
        if (req.session.data) {
            return res.status(403).json({message:"Você já está logado!"})
        }
        next()

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
}

app.get("/checklogin", checklogin)

// tirei validarLogin,
app.post("/login", async (req,res) => {
    try{

        const { nome,senha } = req.body

        const { error,data } = await supabase
        .from('pessoa')
        .select()
        .eq('nome',nome)
        .single()

        if(error || !data || data.length == 0) {
            return res.status(500).json({message:"Login inválido."})
        } 

        const validarSenha = await bcrypt.compare(senha, data.senha)
        
        if (!validarSenha) {
            return res.status(500).json({message:"Login inválido."})
        } 

        req.session.data = {
            id : data.id,
            nome : data.nome
        }

        return res.status(200).json({message:"Login efetuado com sucesso!"})

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
})


app.get("/logout", validarAuth, (req,res,next)=>{
    try{

        // Encerrar sessão na memoria do server
        req.session.destroy(err=>{
            if(err) {
                return res.status(500).json({message: "Erro ao encerrar a sessão."})
            }
        })
        // Encerrar sessão no navegador do usuário
        res.clearCookie("connect.sid")
        return res.status(200).json({message: "Sessão encerrada."})

    } catch(err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }  
})


app.post("/cadastro", validarAuth, async (req,res) => {
    try{

        const { nome,senha } = req.body
        const senhaCriptografada = await bcrypt.hash(senha, 10)
        const { error } = await supabase
        .from('pessoa')
        .insert({nome:nome,senha:senhaCriptografada})

        if (error){
            console.log(error)
            return res.status(500).json({message:"Erro ao cadastrar a tarefa"})
        }
        return res.status(200).json({message:"Usuario cadastrada com sucesso!"})

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
})


app.post("/tarefas", validarAuth, validarDescricao, async (req,res)=>{
    try{

        const { descricao } = req.body;
        const { error } = await supabase 
        .from('tarefas')
        .insert({ 
            descricao:descricao
        })

        if (error){
            console.log(error)
            return res.status(500).json({message:"Erro ao cadastrar a tarefa"})
        }
        return res.status(200).json({message:"Tarefa cadastrada com sucesso!"})

    } catch (error) {
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
})

app.get("/tarefas", validarAuth, async(req,res)=>{
    try{

        const { data,error } = await supabase 
        .from('tarefas')
        .select()

        if (!data || data.length == 0) {
            return res.status(200).json({message:"Não há tarefas cadastradas."})
        }
        return res.status(200).json({tarefas:data})

    } catch (error) {
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
})


app.delete("/tarefas/:id", validarAuth, validarTarefa, async (req,res)=>{
    try{

        const { id } = req.params;
        const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id)

        if (error){
            console.log(error)
            return res.status(500).json({message:"Erro ao excluir usuário"})
        }
        return res.status(200).json({message:"Usuário excluido com sucesso!"})

    } catch (error) {
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
})


app.put("/tarefas/:id", validarAuth, validarTarefa, validarDescricao, async (req,res)=>{
    try{

        const { id } = req.params;
        const { descricao } = req.body;
        const { error } = await supabase
        .from('tarefas')
        .update({descricao:descricao})
        .eq('id',id)

        if (error) {
            return res.status(500).json({message:"Erro ao atualizar tarefa."})
        }
        return res.status(200).json({message:"Tarefa atualizada com sucesso!"})

    } catch (error) {
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
})



app.use((req,res,next)=>{
    try{
        res.status(404).json({
            message:"Rota não encontrada"
        })
    } catch (error) {
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
});

app.listen(port, ()=>{
    console.log(`App rodando na porta ${port}`)
})