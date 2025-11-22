import { useEffect, useState } from "react";
import './output.css'

export default function App() {
  return <Home/>
}

//function Login(){}
//function Logout(){}

function Home(){
  
  const [atualizar, setAtualizar] = useState(0)
  const [texto, setTexto] = useState("")
  const [lista, setLista] = useState([])
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  // Texto do input
  function atualizarTexto(evento){
    setTexto(evento.target.value)
  }

  function atualizarUseEffect(){
    setAtualizar(a => a + 1)
  }

  // Usado para renderizar a lista no loading da página
  // É atualizado quando o usuário envia uma nova tarefa
  useEffect(() => {
    fetch("http://localhost:8000/tarefas")
    .then(resposta => resposta.json())
    .then(respostaJson => {
      setLista(respostaJson.tarefas || []),
      setCarregando(false)
      })
    .catch(err => {
      setErro(true),
      setCarregando(false)

      if (err.message === "Failed to fetch"){
        setErro(True)
      }
    })
  }, [atualizar]);

  // Criar uma nova tarefa
  function adicionarTarefa(){
    if (texto.trim() == "") return
    setLista([... lista, {descricao:texto+" (...) "}])

    fetch("http://localhost:8000/tarefas", {
      method:"POST",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify({descricao:texto})

    })
    .then(respostaServidor => {
      if (!respostaServidor.ok) throw new Error("Erro ao adicionar nova tarefa")
        return respostaServidor.json()
    })
    .then(respostaStatus => {
      console.log(respostaStatus.message),
      atualizarUseEffect(),
      setTexto("")
    })
    .catch(err => {
      console.log(err.message),
      alert("Não foi possível adicionar a tarefa")

      if (err.message === "Failed to fetch"){
        setErro(True)
      }
    })
  }

  function apagarTarefa(id){
    fetch(`http://localhost:8000/tarefas/${id}`, {
      method: "DELETE"
    })
    .then(respostaServidor => {
      if (!respostaServidor.ok) throw new Error("Erro ao apagar tarefa")
        return respostaServidor.json()
    })
    .then(respostaServidor => {
      console.log(respostaServidor.message),
      atualizarUseEffect()
    })
    .catch(err => {
      console.log(err.message),
      window.alert(err.message)

      if (err.message === "Failed to fetch"){
        setErro(True)
      }
    })
  }

  function atualizarTarefa(id,novoTexto){
    fetch(`http://localhost:8000/tarefas/${id}`, {
      method: "PUT",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify({descricao:novoTexto})
    })
    .then(respostaServidor => {
      if (!respostaServidor.ok) throw new Error("Erro ao atualizar tarefa")
        return respostaServidor.json()
    })
    .then(respostaServidor =>{
      window.alert(respostaServidor.message)
      atualizarUseEffect()
    })
    .catch(err => {
      console.log(err.message),
      window.alert(err.message)

      if (err.message === "Failed to fetch"){
        setErro(True)
      }
    })
  }
  
  // Tela de loading
  if(carregando){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Carregando página</h3>
    </div>
    )}

  // Tela de erro
  if(erro){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Erro ao carregar a página</h3>
    </div>
    )}

  // Tela da HOME
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <span>TAREFAS</span>

      <form className="flex flex-col items-center gap-1 p-2" onSubmit={(e) => {e.preventDefault(),adicionarTarefa()}}>
        
        <div className="p-2">
          {lista.length === 0 ? (
              <span>Não há tarefas cadastradas</span>
          ): (
            lista.length > 0 && lista.map((item) => (
            <div key={item.id}>
              
              <button className="py-2 px-2" type="button" onClick={() => {
                const antigoTexto = item.descricao
                const novoTexto = window.prompt("Edite sua tarefa.",antigoTexto)
                atualizarTarefa(item.id,novoTexto)
              }}> 🖉 
              </button>

              <button type="button" onClick={() => apagarTarefa(item.id)}> 
                { item.descricao } 
              </button>

            </div>
          )))}
        </div>

        
      
        <input className="border border-gray-400 rounded p-2 w-68 text-center" value=       {texto} onChange={atualizarTexto} placeholder="Adicione suas tarefas"/>
        <button type="submit"/>
      </form>
    </div>
  );
}