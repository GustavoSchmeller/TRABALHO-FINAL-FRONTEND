import { useEffect, useState } from "react";
import './output.css'

export default function App() {
  
  const [atualizar, setAtualizar] = useState(0)
  const [texto, setTexto] = useState("")
  const [lista, setLista] = useState([])
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  function atualizarTexto(evento){
    setTexto(evento.target.value)
  }

  useEffect(() => {
    fetch("http://localhost:8000/tarefas")
    .then(resposta => resposta.json())
    .then(respostaJson => {
      setLista(respostaJson.tarefas,
      setCarregando(false)
      )})
    .catch(err => {
      setErro(true),
      setCarregando(false)
    })
  }, [atualizar]);

  function atualizarLista(){
    if (texto.trim() == "") return

    fetch("http://localhost:8000/tarefas", {
      method:"POST",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify({descricao:texto})

    })

    setLista([... lista, {descricao:texto+" - adicionando..."}])
    setAtualizar(a => a + 1)
    setTexto("")
  }

  console.log(lista)
  
  if(carregando){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Carregando página</h3>
    </div>
    )}

  if(erro){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Erro ao carregar a página</h3>
    </div>
    )}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <form className="flex flex-col items-center gap-2" onSubmit={(e) => {e.preventDefault(),atualizarLista()}}>

        {lista.map((item,index) => 
          <h2 key={index}>{item.descricao}</h2>
        )}
        <input className="border border-gray-400 rounded p-2 w-64 text-center" value={texto} onChange={atualizarTexto}/>
        <button type="submit" onClick={atualizarLista}>adicionar</button>

      </form>
    </div>
  );
}