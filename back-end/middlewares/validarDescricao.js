/**
 *  Middleware que faz a validação do campo "descrição" da tarefa.
 * 
 *  É retornado "descrição inválida" caso o campo "descrição" não estiver preenchido
 *  É retornado "A descrição precisa ter mais de 3 caracteres" caso o campo não
 *  conter mais do que 3 caracteres.
 */
export default async function validarDescricao(req,res,next){
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
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
}