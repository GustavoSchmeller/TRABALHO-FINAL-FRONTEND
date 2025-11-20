import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";

dotenv.config();
const app = express();
const port = 8000;

app.use(express.json());
app.use(cors({
    origin: '*'
}));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)


async function validarPessoa (req,res,next){ 
    try{

        const { id } = req.params 

        const { data:selectUsuario,error:selectErro } = await supabase
        .from('tarefas')
        .select()
        .eq('id',id)

        if (!selectUsuario || selectUsuario.length === 0) {
            return res.status(500).json({message: "O usuário não existe"})
        }
        if (selectErro) {
            return res.status(500).json({message: "Houve um erro:", erro: selectErro.message})
        }
        next()

    } catch (err){
        return res.status(500).json({message: "Ocorreu um erro inesperado: ", erro: err.message})
    }
}

app.post("/tarefas", async (req,res)=>{
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
})

app.get("/tarefas", async(req,res)=>{
    const { data,error } = await supabase 
    .from('tarefas')
    .select()

    if (!data || data.length == 0) return res.status(200).json({message:"Não há tarefas cadastradas."})
    
    return res.status(200).json({tarefas:data})
})



app.delete("/tarefas/:id", validarPessoa, async (req,res)=>{
    const { id } = req.params;
    if (!id  || id.length === 0) return res.status(500).json({message: "Nenhum ID recebido."})

    const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id)

    if (error){
        console.log(error)
        return res.status(500).json({message:"Erro ao excluir usuário"})
    }
    
    return res.status(200).json({message:"Usuário excluido com sucesso!"})
})

app.put()

app.use((req,res,next)=>{
    res.status(404).json({
        message:"Rota não encontrada"
    })
});

app.listen(port, ()=>{
    console.log(`App rodando na porta ${port}`)
})