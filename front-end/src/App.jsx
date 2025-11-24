import { useEffect, useState } from "react";
import './output.css'
import Home from "./components/Home"
import Login from "./components/Login";

export default function App() {
  const [logado, setLogado] = useState(false)

  try{
    fetch("http://localhost:8000/checklogin", {
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

  return logado ? <Home setLogado={setLogado} /> : <Login setLogado={setLogado}/>
}

