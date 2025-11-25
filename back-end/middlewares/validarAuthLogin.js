/**
 * Middleware para validar se o usuário já não está autenticado para fazer o login
 * 
 * Caso o usuário já tiver logado, é retornado o erro de acesso.
 */
export default function validarAuthLogin(req,res,next){
     try{
        if (req.session.data) {
            return res.status(403).json({message:"Você já está logado!"})
        }
        next()

    } catch (err){
        return res.status(500).json({message: `Ocorreu um erro inesperado: ${err.message}`})
    }
}