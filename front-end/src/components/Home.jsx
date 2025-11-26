import { useEffect, useState } from "react";
import '../output.css'

export default function Home({setLogado}){

  const [atualizar, setAtualizar] = useState(0)
  const [usuarioNome, setUsuarioNome] = useState("")
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
        setUsuarioNome(respostajson.usuario),
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
        atualizarUseEffect()
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
  
  /**
   * FAZER LOGOUT
   * 
   * É enviado um get para http://localhost:8000/logout junto com a sessão (credentials:"include")
   * o estado de "Logado" é definido como false
   */

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


  /**
   * PÁGINA DE LOADING
   * 
   * Quando carregando for TRUE
   */

  if(carregando){
    return(
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Carregando página...</h3>
    </div>
    )}

  /**
   * PÁGINA DE ERRO
   * 
   * Quando erro for TRUE
   */

  if(erro){
    return(
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Erro interno no servidor</h3>
    </div>
    )}


  return (

  /**
   * DIV PAI
   * 
   * ocupa toda a tela.
   */
    
    <div className="bg-gray-100 min-h-screen flex flex-col">

      {/* 
          HEADER
          
          Contém o nome do usuário, m botão para logout e o titulo
      */}

      <div className="bg-gray-400 grid grid-cols-1 md:grid-cols-2 border-b p-1">
        <div className="justify-center items-center text-center md:text-start md:items-start text-gray-200 ml-0 md:ml-40"> 
            Olá, {usuarioNome}.
        </div>
        <div className="justify-center text-end hidden md:block text-gray-200 mr-40"> 
          <button className="hover:text-red-500 hover:font-bold select-none" onClick={fazerLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-row pt-20"> 
        <div className="w-full text-4xl font-medium flex justify-center text-center items-center select-none">
          <span>
            SUAS TAREFAS
          </span>
        </div>
      </div>


      {/* 
          MAIN

          Nessa parte é exibido:
          O menu de tarefas cadastradas.
          O item clicável para edição das tarefas.
          O input para enviar uma nova terefa
      */}

      <div 
      className="bg-brown-500 flex flex-col justify-start items-center flex-1 mt-20">

            {lista.length === 0 ? (

                <div 
                className="text-center font-medium select-none">
                  <span>
                    Não há tarefas cadastradas
                  </span>
                </div>

            ): (lista

              .slice() // cria cópia da lista
              .sort((a,b) => a.id - b.id) // ordena por id crescente
              .map((item) => (
              <div key={item.id}>
                
                {/* DESCRIÇÃO DAS TAREFAS */}
                <button className="ml-10 bg-white border-r-4 mb-1 border-r-gray-500 
                text-left break-words font-medium leading-5 px-3 py-3 w-96 md:w-[550px] 
                hover:bg-red-400 hover:text-white select-none" 
                type="button" 
                onClick={() => apagarTarefa(item.id)}> 
                  {item.descricao} 
                </button>

                {/* ITEM DE EDIÇÃO DA TAREFA */}
                <button className="pl-3 hover:w-[20px] py-2 select-none" 
                type="button" 
                onClick={() => {
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

      <div className="flex flex-col justify-center pt-10 pb-20">
          <form className="flex flex-col items-center" 
          onSubmit={(e) => {e.preventDefault(),adicionarTarefa()}}>

            {/* INPUT QUE RECEBE A NOVA TAREFA */}
            <input className="border border-gray-400 rounded p-2 w-60 md:w-80 text-center" 
            value={texto} 
            onChange={atualizarTexto} 
            placeholder="Adicione suas tarefas"/>

            {/* BOTÃO PARA ENVIAR A NOVA TAREFA */}
            <button className="bg-green-500 rounded font-medium px-10 py-3 md:py-1 text-white 
            hover:text-black hover:bg-green-200 mt-5 md:mt-3 select-none" 
            type="submit">
              Enviar
            </button>

          </form>
      </div>

      {/* 
          FOOTER

          Nesta parte contém um botão para logout;
          Também possuí uma div de apresentação do dev.
      */}   

      <div className="flex justify-center text-gray-400 md:hidden pb-10 select-none"> 
          <button className="hover:text-red-400 hover:bg-gray-200 hover:font-bold p-1 rounded" onClick={fazerLogout}>
            LOGOUT
          </button>
      </div>

      <div className="bg-gray-200 border-t flex-row justify-center text-center hidden md:block text-gray-400 select-none">
        <span>
          by: Gustavo Medeiros Schmeller
        </span>
      </div>

    </div>
  );
}