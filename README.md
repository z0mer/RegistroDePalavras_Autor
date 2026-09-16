# 📚 Registro de Palavras

Um aplicativo web para escritores acompanharem seu progresso de escrita diário.

![Dark Mode](https://img.shields.io/badge/theme-dark%20mode-1a1a2e)
![Firebase](https://img.shields.io/badge/database-Firebase-FFCA28)
![Responsive](https://img.shields.io/badge/responsive-mobile%20%26%20desktop-8b5cf6)

## ✨ Funcionalidades

- **Dashboard** com estatísticas de escrita:
  - Total de palavras escritas
  - Média de palavras por dia
  - Dias consecutivos de escrita (streak)
  - Melhor dia de escrita
  - Gráfico de linhas com histórico

- **Gerenciamento de Livros**:
  - Cadastro com título, autor, resumo, personagens e cenários
  - Cores personalizadas para cada livro
  - Visualização de estatísticas por livro

- **Registro Diário de Palavras**:
  - Quantidade de palavras escritas
  - Data do registro
  - Notas (ex: capítulos escritos)

- **Design Responsivo**:
  - Funciona em desktop e mobile
  - Dark mode elegante com tema violeta
  - Navegação adaptativa

## 🚀 Tecnologias

- HTML5
- SCSS/CSS3
- JavaScript (Vanilla)
- Firebase Firestore
- Chart.js

## 📦 Estrutura do Projeto

```
RegistroDePalavras_Autor/
├── index.html          # Página principal
├── css/
│   ├── styles.scss     # Estilos fonte (SCSS)
│   └── styles.css      # Estilos compilados
├── js/
│   ├── firebase-config.js  # Configuração do Firebase
│   ├── storage.js          # Funções CRUD do Firestore
│   └── app.js              # Lógica da aplicação
└── README.md
```

## 🔧 Configuração

### 1. Firebase

O projeto já está configurado com um projeto Firebase. Para usar seu próprio Firebase:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Atualize as credenciais em `js/firebase-config.js`

### 2. Desenvolvimento Local

Para compilar o SCSS durante o desenvolvimento:

```bash
# Instalar Sass globalmente
npm install -g sass

# Compilar SCSS para CSS
sass css/styles.scss css/styles.css

# Ou com watch para desenvolvimento
sass --watch css/styles.scss css/styles.css
```

### 3. Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com/)
3. Deploy automático! (não precisa de configuração especial)

## 📱 Screenshots

### Dashboard
- Cards com estatísticas
- Gráfico de palavras por dia
- Lista de registros recentes

### Livros
- Grid de cards com livros cadastrados
- Informações de progresso por livro

### Mobile
- Navegação inferior
- Botão flutuante para novo registro

## 📝 Uso

1. **Criar um Livro**: Clique em "Meus Livros" → "Novo Livro"
2. **Registrar Palavras**: Clique em "Novo Registro" e preencha os dados
3. **Acompanhar Progresso**: Veja o Dashboard para estatísticas gerais ou clique em um livro para detalhes

## 🎨 Personalização

### Cores dos Livros
Cada livro pode ter uma cor personalizada, escolhida no momento da criação.

### Tema
O tema dark mode pode ser customizado editando as variáveis no início do arquivo `css/styles.scss`.

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar!

---

Feito com 💜 para escritores
