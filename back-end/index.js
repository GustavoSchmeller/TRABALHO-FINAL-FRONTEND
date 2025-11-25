/**
 * IMPORT das bibliotecas que serão usadas
 */
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import session from "express-session";

/**
 * IMPORT dos middlewares criados
 */
import validarAuth from "./middlewares/validarAuth.js"
import validarAuthLogin from "./middlewares/validarAuthLogin.js"
import validarDescricao from "./middlewares/validarDescricao.js"
import validarSessao from "./middlewares/validarSessao.js"
import validarTarefa from "./middlewares/validarTarefa.js"

dotenv.config();
const app = express();
const port = 8000;

/**
 * Define quais domínios podem acessar a API.
 */
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

/**
 * Configuração da sessão do usuário
 */
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax"
}}))


/**
 * Configuração que converte as requisições em JSON. 
 */
app.use(express.json());


/**
 * Cria a conexão com o banco de dados usando as váriveis que estão dentro do .ENV
 */
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)


/**
 * Rota utilizada pelo REACT para validar a sessão
 *
 * Caso o usuário tiver uma sessão ativa, direciona para a tela home.
 * Caso o usuário não tiver sessão, direciona para a tela de login.
 */
app.get("/validarsessao", validarSessao)

/**
 * Rota para fazer login.
 * 
 * Caso o login for válido, é criado a sessão.
 * Caso o login for inválido, é retornado o erro.
 */
app.post("/login", validarAuthLogin, async (req,res) => {
    try{

        const { nome,senha } = req.body

        const { error,data } = await supabase
        .from('pessoa')
        .select('*')
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
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
})

/**
 * Rota para fazer logout.
 * 
 * Valida se o usuário está realmente logado.
 * Encerra a sessão no servidor caso o usuário estiver logado e
 * limpa o cookie do navegador do usuário.
 */
app.get("/logout", validarAuth, (req,res,next)=>{
    try{

        req.session.destroy(err=>{
            if(err) {
                return res.status(500).json({message: "Erro ao encerrar a sessão."})
            }
        })
        res.clearCookie("connect.sid")
        return res.status(200).json({message: "Sessão encerrada."})

    } catch(err){
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }  
})

/**
 * Rota para fazer cadastro.
 * 
 * Valida se o usuário está logado.
 * Coleta os dados informados no JSON.
 * Criptografa a senha.
 * Salva o usuário no banco de dados.
 */
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
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
})

/**
 * Rota para adicionar nova tarefa.
 * 
 * Valida se o usuário está autenticado.
 * Valida a descrição da tarefa.
 * Cadastra a tarefa.
 */
app.post("/tarefas", validarAuth, validarDescricao, async (req,res)=>{
    try{

        const { descricao } = req.body;
        const { error } = await supabase 
        .from('tarefas')
        .insert({descricao:descricao})

        if (error){
            console.log(error)
            return res.status(500).json({message:"Erro ao cadastrar a tarefa"})
        }
        return res.status(200).json({message:"Tarefa cadastrada com sucesso!"})

    } catch (error) {
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
})

/**
 * Rota para pegar tarefas.
 * 
 * Valida se o usuário está autenticado, 
 * Caso estiver, retorna a lista de tarefas.
 */
app.get("/tarefas", validarAuth, async(req,res)=>{
    try{

        const { data,error } = await supabase 
        .from('tarefas')
        .select()

        if (!data || data.length == 0) {
            return res.status(200).json({message:"Não há tarefas cadastradas."})
        }
        return res.status(200).json({tarefas:data,usuario:req.session.data.nome})

    } catch (error) {
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
})


/**
 * Rota para apagar determinada tarefa.
 * 
 * Valida se o usuário está autenticado.
 * Valida se a tarefa informada é valida.
 * Exclui a tarefa. 
 */
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
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
})


/**
 * Rota para atualizar tarefa.
 * 
 * Valida a autenticação do usuário.
 * Valida se o numero da tarefa é valido.
 * Valida a nova descrição da tarefa.
 * Atualiza a tarefa.
 */
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
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
})


/**
 * Rota utilizada para rotar que não existem.
 * 
 * Retorna um erro caso o usuário acessar um rota que não existe.
 */
app.use((req,res,next)=>{
    try{
        res.status(404).json({
            message:"Rota não encontrada"
        })
    } catch (error) {
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
});

app.listen(port, ()=>{
    console.log(`App rodando na porta ${port}`)
})