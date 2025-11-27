|| rodar o back-end || (Em um terminal)

Acessar /back-end
Executar: npm install && node index.js

|| rodar o front-end || (Em outro terminal)

Acessar /front-end
Executar: npm install && npm run dev


ACESSAR PÁGINA: http://localhost:5173/
Usuário de acesso na página de login: Gustavo (Senha: admin)


Preencher .env dentro da pasta back-end com o SUPABASE_URL do seu SUPABASE e também SUPABASE_KEY.

BANCO DE DADOS:

TABELA pessoa
Coluna id INT8 PRIMARY
Coluna nome VARCHAR
Coluna senha VARCHAR

TABELA tarefas
Coluna ID INT8 PRIMARY
descricao varchar

