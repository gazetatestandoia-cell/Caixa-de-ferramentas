Gerador de Threads com Backend Seguro para Vercel
Este projeto foi reestruturado para proteger sua chave de API do Google, permitindo que a aplicação seja hospedada de forma segura na Vercel.

Estrutura do Projeto
index.html: O frontend da aplicação que o usuário vê.

api/generate_thread.py: Uma "Função Serverless" que atua como nosso backend seguro. Ela recebe a requisição do frontend, usa a chave de API (que está segura na Vercel) para contatar a IA do Google e devolve a resposta.

requirements.txt: Lista os pacotes Python que a Vercel precisa instalar para que nossa função funcione.

Como Publicar na Vercel (Método Correto e Seguro)
Siga estes passos para colocar sua aplicação online com a chave de API protegida.

Estrutura de Pastas: Garanta que seu repositório no GitHub tenha esta estrutura:

/
|-- api/
|   |-- generate_thread.py
|-- index.html
|-- requirements.txt

Crie uma Conta na Vercel: Se ainda não tiver, crie uma conta gratuita na Vercel e conecte-a à sua conta do GitHub.

Importe o Projeto na Vercel:

No seu painel da Vercel, clique em "Add New..." -> "Project".

Selecione o repositório do GitHub que contém estes arquivos.

A Vercel deve detectar o projeto corretamente. Não é necessário alterar as configurações de build.

Configure a Variável de Ambiente (O Passo Mais Importante):

Antes de clicar em "Deploy", vá para a seção "Environment Variables" (Variáveis de Ambiente).

Crie uma nova variável com o NOME exato: GOOGLE_API_KEY

No campo de VALOR, cole a sua chave de API secreta do Google Gemini.

Clique em "Add".

Faça o Deploy:

Agora, clique no botão "Deploy".

A Vercel irá instalar as dependências, configurar a função serverless e publicar seu site. Em minutos, você terá um link público (.vercel.app) para sua aplicação, funcionando de forma segura! Sua chave de API não estará mais em risco.
