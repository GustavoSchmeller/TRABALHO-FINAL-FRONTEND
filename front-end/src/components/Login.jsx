import { useEffect, useState } from "react";
import '../output.css'

export default function Login({setLogado}){

  const [CarregandoLogin, setCarregandoLogin] = useState(false)
  const [erro, setErro] = useState(false)
  const [nome, setNome] = useState("")
  const [senha, setSenha] = useState("")

  function atualizarNome(evento){
    setNome(evento.target.value)
  }
  function atualizarSenha(evento){
    setSenha(evento.target.value)
  }

  useEffect(() => {
    document.title = "Tarefas - Login";
  }, []);

  function validarLogin(){
    try{

      if(nome.length  > 0 && senha.length > 0){
        setCarregandoLogin(true)
        fetch("http://localhost:8000/login", {
          method:"POST",
          headers: {"Content-type":"application/json"},
          body: JSON.stringify({nome:nome,senha:senha}),
          credentials:"include"
        })
        .then(async respostaServidor => {
          const dados = await respostaServidor.json()
          if(!respostaServidor.ok) throw new Error(dados.message)
          return dados
        })
        .then(res => {
          setLogado(true)
          setCarregandoLogin(false)
        })
        .catch (err => {
          setCarregandoLogin(false)
          if (err.message === "Failed to fetch"){
            setErro(true)
          } else {
            window.alert(err.message)
          }
        })
      } else {
        window.alert("Você precisa preencher todos campos")
      }

    } catch (err) {
      window.alert("Houve um erro inesperado. Tente novamente!")
    }
  }

  // Tela de loading
  if(CarregandoLogin){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h3>Login sendo feito...</h3>
    </div>
    )}

  // Tela de erro
  if(erro){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h3>Erro interno no servidor</h3>
    </div>
    )}

  return (
    <div className="min-h-screen flex flex-col items-center p-2">
      <div className="text-4xl font-bold mt-40">
        <span>LOGIN</span>
      </div>
      <form className="mt-40" onSubmit={(e) => {e.preventDefault(),validarLogin()}}>
        <ul>
          <li><input className="border border-gray-400 rounded p-2 w-80 text-center" type="text" name="nome" placeholder="Nome" value={nome} onChange={atualizarNome}/></li>
          <li><input className="border border-gray-400 rounded p-2 w-80 text-center mt-1" type="password" name="senha" placeholder="Senha" value={senha} onChange={atualizarSenha}/></li>
        </ul>
        <div className="flex justify-center">
          <button className="bg-green-500 rounded border font-medium text-gray-700 px-10 py-1 text-white hover:text-black hover:bg-green-200 mt-5" type="submit">Enviar</button>
        </div>
      </form>
    </div>
  )
}
