import { useEffect, useState } from "react";
import './output.css'

export default function App() {
  const [logado, setLogado] = useState(false)

  return logado ? <Home setLogado={setLogado} /> : <Login setLogado={setLogado}/>
}

function Login({ setLogado }){

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Login sendo feito...</h3>
    </div>
    )}

  // Tela de erro
  if(erro){
    return(
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h3>Erro interno no servidor</h3>
    </div>
    )}

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-2">
      <div className="text-2xl font-bold mb-6">
        <span>LOGIN</span>
      </div>
      <form onSubmit={(e) => {e.preventDefault(),validarLogin()}}>
        <ul>
          <li><input className="border border-gray-400 rounded p-2 w-68 text-center" type="text" name="nome" placeholder="Nome" value={nome} onChange={atualizarNome}/></li>
          <li><input className="border border-gray-400 rounded p-2 w-68 text-center" type="text" name="senha" placeholder="Senha" value={senha} onChange={atualizarSenha}/></li>
        </ul>
        <div className="flex justify-center">
          <button type="submit"/>
        </div>
      </form>
    </div>
  )
}

function Home({ setLogado }){

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

  function apagarTarefa(id,index){
    try{

      let novaLista = [...lista]
      novaLista[index].descricao += " (APAGANDO) "
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
      novaLista[index].descricao = novoTexto + " (...) "
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
    <div className="min-h-screen flex flex-row justify-center gap-4 p-2">

      <div className="flex justify-center items-center p-2"> 
        <span className="block">TAREFAS</span>
      </div>
      
      <div className=" flex items-center gap-2 p-2">
        <form onSubmit={(e) => {e.preventDefault(),adicionarTarefa()}}>
            {lista.length === 0 ? (
                <div className="flex justify-center items-center p-2">
                  <span>Não há tarefas cadastradas</span>
                </div>
            ): (
              lista.length > 0 && lista.map((item, index) => (
              <div key={item.id}>
                
                <button type="button" onClick={() => {
                  const antigoTexto = item.descricao
                  const novoTexto = window.prompt("Edite sua tarefa.",antigoTexto)
                  atualizarTarefa(item.id,novoTexto,index)
                }}>📝
                </button>
                
                <button type="button" onClick={() => apagarTarefa(item.id,index)}> 
                  { item.descricao } 
                </button>

              </div>
            )))}
          <input className="border border-gray-400 rounded p-2 w-68 text-center" value={texto} onChange={atualizarTexto} placeholder="Adicione suas tarefas"/>
          <button type="submit"/>
        </form>
      </div>

      <div className="flex justify-center items-center p-2"> 
        <button onClick={fazerLogout}>LOGOUT</button>
      </div>

    </div>
  );
}