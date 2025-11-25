/**
 * Middleware que valida se a tarefa informada existe.
 * 
 * Valida se o parametro informado é do tipo INT.
 * Valida se a tarefa informada existe.
 * Retorna erro para o usuário caso cair em alguma das validações.
 */
export default async function validarTarefa(req,res,next){ 
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
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
}