# 🎬 CineMatch

CineMatch é um projeto de recomendação de filmes com foco em experiência de usuário, responsividade e integração com APIs reais. Você pode descobrir filmes populares, mais bem avaliados ou filtrar por gênero, nota e muito mais — tudo com um visual elegante e rápido.

> ✅ Totalmente responsivo  
> 🔍 Busca inteligente com autocomplete  
> 🧠 Projetado com foco em usabilidade

---

## 🌟 Features

- ✅ **Sugestões por popularidade e avaliação**
- 🔎 **Busca com debounce e sugestões instantâneas**
- 🎛️ **Filtros por gênero, nota, popularidade e data**
- 🧩 **Card de filme com 3 tamanhos personalizáveis**
- 🧠 **Scroll infinito para carregamento dinâmico**
- 🎞️ **Carrossel com filmes em cartaz e recomendados**
- 🎬 **Detalhes completos do filme: sinopse, trailer, elenco, onde assistir**
- 📱 **Layout responsivo para todas as telas**
- ☁️ **Deploy completo na Vercel**

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia        | Função                                      |
| ----------------- | ------------------------------------------- |
| **Vue 3 + TS**    | Framework principal + tipagem robusta       |
| **Pinia**         | Gerenciamento global de estado              |
| **TailwindCSS**   | Estilização rápida e responsiva             |
| **Axios**         | Requisições HTTP                            |
| **VueUse**        | Utilitários reativos (debounce, scroll etc) |
| **Vue3 Carousel** | Carrossel de filmes                         |
| **TMDb API**      | Fonte dos dados de filmes                   |
| **Vercel**        | Deploy e hospedagem                         |

---

## 🚀 Acesse o Projeto

> 🔗 [cinematch.vercel.app](https://cinematch-rho.vercel.app/)  
> 📦 [Repositório no GitHub](https://github.com/jpst-dev/cinematch)

---

## 📷 Screenshots

### 🎬 Página Inicial
![image](https://github.com/user-attachments/assets/1dcf7790-2af5-4d5e-a8c2-986e98e71a02)
![image](https://github.com/user-attachments/assets/527626ca-4d03-4a2e-8ad0-e8f4c2b8bbe6)


### 🔎 Busca com sugestões

![image](https://github.com/user-attachments/assets/22490088-f67f-4b1e-89b9-ad1be09bc83c)


### 🎥 Detalhes do filme

![image](https://github.com/user-attachments/assets/46ae3524-fc94-4429-b7a1-3082f5bcef1d)
![image](https://github.com/user-attachments/assets/3ff40fc9-efd7-454f-a282-f5bcf78e0c9a)
![image](https://github.com/user-attachments/assets/c560b4ce-12a8-4316-81f2-1fb36250a099)
![image](https://github.com/user-attachments/assets/0b2feeda-f676-429e-8c1e-fe7553d388e3)





> 💡 As imagens acima são exemplos. Crie uma pasta `screenshots/` com prints reais e atualize os caminhos.

---

## ✍️ Sobre o Projeto

Este projeto foi desenvolvido com o objetivo de unir estética e funcionalidade em uma aplicação real consumindo APIs externas. Além disso, serve como um projeto de portfólio para demonstrar domínio em Vue 3, Tailwind, integrações de API, UX e arquitetura de código.

---

## 📌 Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/jpst-dev/cinematch.git

# Instale as dependências
npm install

# Configure sua chave da API TMDb no .env.local
VITE_TMDB_API_KEY=your_api_key_here

# Rode o servidor local
npm run dev
```
