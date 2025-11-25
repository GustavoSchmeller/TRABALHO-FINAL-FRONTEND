/**
 * Middleware que valida a autenticação para prosseguir com a requisição.
 * 
 * Caso o usuário não estiver logado, retorna status 403 e mensagem. 
 * Caso estiver, prossegue com a requisição.
 */
export default function validarAuth(req,res,next) {
    try{
        if (req.session.data == undefined || req.session.data == null) {
            return res.status(403).json({message:"Acesso negado! Você precisa estar logado."})
        }
        next()

    } catch (err){
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
}