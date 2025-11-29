|| rodar o back-end

Acessar /back-end
Executar: npm install && node index.js

|| rodar o front-end

Acessar /front-end
Executar: npm install && npm run dev

ACESSAR PÁGINA: http://localhost:5173/
Usuário de acesso na página de login: Gustavo (Senha: admin)

Preencher .env dentro da pasta back-end com o SUPABASE_URL do seu SUPABASE e também SUPABASE_KEY.

Banco de Dados (Supabase)

Tabela: pessoa
Coluna	Tipo	Atributos
id	INT8	PRIMARY KEY
nome	VARCHAR	
senha	VARCHAR	

Tabela: tarefas
Coluna	Tipo	Atributos
id	INT8	PRIMARY KEY
descricao	VARCHAR

