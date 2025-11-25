import { useState } from "react";
import './output.css'
import Home from "./components/Home"
import Login from "./components/Login";

export default function App() {
  
  const [ logado, setLogado ] = useState(false)

  /**
   * Bloco utilizado para validar se o usuário possui uma sessão ativa.
   * 
   * Caso tenha, é definida a variavel LOGADO para TRUE e o usuário vai para a HOME.
   * Caso não tenha, o usuário vai para a página de LOGIN.
   */
  try{
    fetch("http://localhost:8000/validarsessao", {
      method:"GET",
      credentials:"include"
    })
    .then(respostaServidor => respostaServidor.json())
    .then(respostajson => {
      if(respostajson.logado) {
        setLogado(true)
      } else {
        setLogado(false)
      }
    })
  } catch {
    window.alert("Ocorreu um erro inesperado. Tente novamente mais tarde.")
  }

  /**
   * Se tiver LOGADO, é direcionado para HOME, caso contrário, é direcionado para LOGIN. 
   */
  return logado ? <Home setLogado={ setLogado } /> : <Login setLogado={ setLogado }/>
}

