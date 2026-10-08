# 🐾 Pet Simulator X — Value List & Database

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Framer_Motion-14-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/GSAP-3-0AE448?style=for-the-badge&logo=greensock&logoColor=black" alt="GSAP" />
  <img src="https://img.shields.io/badge/Lenis-Smooth_Scroll-purple?style=for-the-badge" alt="Lenis" />
</p>

Uma aplicação web ultra-fluida e moderna para visualização e consulta de valores, raridades e variantes de pets do **Pet Simulator X** (Roblox). Desenvolvida com **React 18**, **Vite** e animações dinâmicas de alta performance.

---

## ✨ Funcionalidades Principais

- 🔍 **Busca em Tempo Real:** Pesquise instantaneamente por nome ou categoria de qualquer pet do jogo.
- 💎 **Filtro por Raridade:** Organização por ordem oficial de raridade:
  - *Basic* ➔ *Rare* ➔ *Epic* ➔ *Legendary* ➔ *Mythical* ➔ *Exclusive*
- 🌈 **Visualização de Variantes:**
  - Versão **Normal**
  - Versão **Golden**
  - Versão **Rainbow**
  - Versão **Dark Matter**
  - Regras inteligentes para pets *Exclusive* e *Huge*.
- ⚡ **Performance e Fluidez:**
  - Motor de rolagem **Lenis Smooth Scroll** com interpolação suave de física.
  - Animações refinadas via **Framer Motion** e **GSAP**.
  - Renderização otimizada com scroll infinito / lazy display.
- 🎨 **Design Moderno:** Interface escura em tons Obsidian e Neon inspirada na identidade visual premium do jogo.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/)
- **Scroll Engine:** [Lenis](https://github.com/darkroomengineering/lenis)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📁 Estrutura do Projeto

```plaintext
Value-List/
├── Images/              # Assets e sprites dos pets organizados por mundos/zonas
├── Values/              # Definições em JSON de valores e estatísticas de cada pet
├── Pets/                # Metadados adicionais dos pets
├── src/
│   ├── App.jsx          # Componente principal da aplicação e lógica de filtros
│   ├── main.jsx         # Ponto de entrada do React
│   └── index.css        # Estilos globais e temas
├── index.html           # HTML base
├── vite.config.js       # Configurações do Vite e servidor local
└── package.json         # Dependências e scripts
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Gerenciador de pacotes `npm` ou `yarn`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/bomzinho77888/Value-List.git
   cd Value-List
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   Abra `http://localhost:5173` para visualizar a aplicação.

---

## 📦 Build para Produção

Para gerar a versão otimizada pronta para deploy:

```bash
npm run build
```

Os arquivos compilados estarão na pasta `dist/`.

---

## 📜 Licença

Distribuído sob a licença MIT. Sinta-se livre para customizar e expandir a base de dados!
