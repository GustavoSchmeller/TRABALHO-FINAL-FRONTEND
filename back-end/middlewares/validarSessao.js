/**
 * Middleware que fazer a validação se o usuário está com uma sessão ativa.
 * 
 * O middlware retorna true se o usuário tiver sessão.
 * Caso não tiver sessão ativa, é retornado false.  
 */
export default function validarSessao(req,res,next){
    try{
        if (req.session.data == undefined || req.session.data == null) {
            return res.status(403).json({logado:false})
        } else {
            return res.status(200).json({logado:true})
        }
        
    } catch (err){
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
}