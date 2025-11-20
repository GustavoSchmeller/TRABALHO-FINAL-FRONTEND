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

app.post("/tarefas", async (req,res)=>{
    const { descricao } = req.body;

    const { data,error } = await supabase 
    .from('tarefas')
    .insert({ 
        descricao:descricao
    })
    .select()

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

app.delete("/tarefas/:id", async (req,res)=>{
    const { id } = req.params;
    if (!id  || Object.keys(id ).length === 0) return res.status(500).json({message: "Nenhum ID recebido."})

    const { error } = await supabase
    .from('lista')
    .delete()
    .eq('id', id)

    if (error){
        console.log(error)
        return res.status(500).json({message:"Erro ao excluir coluna"})
    }
    
    return res.status(200).json({message:id})
})

app.use((req,res,next)=>{
    res.status(404).json({
        message:"Rota não encontrada"
    })
});

app.listen(port, ()=>{
    console.log(`App rodando na porta ${port}`)
})