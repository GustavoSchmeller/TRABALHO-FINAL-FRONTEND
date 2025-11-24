import { useEffect, useState } from "react";
import '../output.css'

export default function Home({setLogado}){

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
  try{

    useEffect(() => {
      fetch("http://localhost:8000/tarefas", {
        method:"GET",
        credentials:"include"
      })
      .then(resposta => resposta.json())
      .then(respostajson => {
        setLista(respostajson.tarefas || []),
        setCarregando(false)
        })
      .catch(err => {
        setErro(true),
        setCarregando(false)
        if (err.message === "Failed to fetch"){
          setErro(true)
        }
      })
    }, [atualizar]);

  } catch (err) {
    window.alert("Houve um erro inesperado. Tente novamente!")
  }

  useEffect(() => {
    document.title = "Tarefas - Home";
  }, []);



  // Criar uma nova tarefa
  function adicionarTarefa(){
    try{

      if (texto.trim() == "") return
      setTexto("")
      fetch("http://localhost:8000/tarefas", {
        method:"POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({descricao:texto}),
        credentials:"include"
      })
      .then(async respostaServidor => {
        const dados = await respostaServidor.json()
        if (!respostaServidor.ok) throw new Error(dados.message)
        setLista([... lista, {descricao:texto+" (...) "}])
        return dados
      })
      .then(respostajson => {
        console.log(respostajson.message)
        atualizarUseEffect(),
        setTexto("")
      })
      .catch(err => {
        if (err.message === "Failed to fetch"){
          setErro(true)
        } else {
          window.alert(err.message)
        }
      })

    } catch (err) {
      window.alert("Houve um erro inesperado. Tente novamente!")
    }
  }

  function apagarTarefa(id){
    try{

      let novaLista = [...lista]
      let pos = novaLista.findIndex(t => t.id === id)
      if (pos !== -1) novaLista[pos].descricao += " (APAGANDO) "
      setLista(novaLista)

      fetch(`http://localhost:8000/tarefas/${id}`, {
        method: "DELETE",
        credentials:"include"
      })
      .then(async respostaServidor => {
        const dados = await respostaServidor.json()
        if (!respostaServidor.ok) throw new Error(dados.message)
        return dados
      })
      .then(respostajson => {
        console.log(respostajson.message),
        atualizarUseEffect()
      })
      .catch(err => {
        if (err.message === "Failed to fetch"){
          setErro(true)
        } else {
          window.alert(err.message)
        }
      })

    } catch (err) {
      window.alert("Houve um erro inesperado. Tente novamente!")
    }
  }

  function atualizarTarefa(id,novoTexto, index){
    try{

      let novaLista = [...lista]
      let pos = novaLista.findIndex(t => t.id === id)
      if (pos !== -1) novaLista[pos].descricao = novoTexto + " (...) "
      setLista(novaLista)

      fetch(`http://localhost:8000/tarefas/${id}`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({descricao:novoTexto}),
        credentials:"include"
      })
      .then(respostaServidor => {
        const dados = respostaServidor.json()
        if (!respostaServidor.ok) throw new Error(respostaServidor.message)
        return dados
      })
      .then(() =>{
        atualizarUseEffect()
      })
      .catch(err => {
        if (err.message === "Failed to fetch"){
          setErro(true)
        } else {
          window.alert(err.message)
        }
    })

    } catch (err) {
      window.alert("Houve um erro inesperado. Tente novamente!")
    }  
  }
  
  function fazerLogout(){
    try{

      fetch("http://localhost:8000/logout", {
        method:"GET",
        credentials:"include"
      })
      .then(async respostaServidor => {
        const dados = await respostaServidor.json()
        if (!respostaServidor.ok) throw new Error(dados.message)
        return dados
      })
      .then(respostajson =>{
        window.alert(respostajson.message)
        setLogado(false)
      }) 
      .catch(err => {
        setLogado(false)
        if (err.message === "Failed to fetch"){
          setErro(true)
        } else {
          window.alert(err.message)
        }
      }) 
      
    } catch (err) {
      window.alert("Houve um erro inesperado. Tente novamente!")
    } 
  }


  // Tela de loading
  if(carregando){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Carregando página...</h3>
    </div>
    )}

  // Tela de erro
  if(erro){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Erro interno no servidor</h3>
    </div>
    )}

  // Tela da HOME
  return (
    <div className="min-h-screen flex flex-col">

      <div className="text-3xl font-medium flex justify-center pt-20"> 
        <span>SUAS TAREFAS</span>
      </div>

      <div className="mt-30 bg-brown-500 flex flex-col justify-start items-center flex-1 pt-20">
            {lista.length === 0 ? (
                <div className="text-center font-medium">
                  <span>Não há tarefas cadastradas</span>
                </div>
            ): (lista
              .slice() // cria cópia
              .sort((a,b) => a.id - b.id) // ordena por id crescente
              .map((item, index) => (
              <div key={item.id}>
                

                
                <button className="rounded border text-left break-words font-medium leading-5 px-3 py-3 w-80 md:w-80 hover:bg-red-400 hover:text-white" type="button" onClick={() => apagarTarefa(item.id)}> 
                  { item.descricao } 
                </button>

                <button className="pl-3" type="button" onClick={() => {

                  let antigoTexto = item.descricao
                  let novoTexto = window.prompt("Edite sua tarefa.",antigoTexto)
                  if(novoTexto == null || novoTexto.length == 0){
                    window.alert("Ação cancelada!\nO campo não foi preenchido.")
                  } else {
                    atualizarTarefa(item.id,novoTexto)
                  }
                  
                }}>🖋️
                </button>

              </div>
            )))}
      </div>

      
      <div className="flex justify-center mt-10 mb-20">
          <form className="flex flex-col items-center"  onSubmit={(e) => {e.preventDefault(),adicionarTarefa()}}>
            <input className="border border-gray-400 rounded p-2 w-60 md:w-80 text-center" value={texto} onChange={atualizarTexto} placeholder="Adicione suas tarefas"/>
            <button className="bg-green-500 rounded border font-medium px-10 py-3 md:py-1 text-white hover:text-black hover:bg-green-200 mt-5 md:mt-3" type="submit">Enviar</button>
          </form>
      </div>

      <div className="flex justify-center items-end text-gray-400 hover:text-red-400 mb-10"> 
          <button onClick={fazerLogout}>LOGOUT</button>
      </div>

    </div>
  );
}