# Hi, I'm Omkar Jagtap 👋

<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=38BDF8&center=true&vCenter=true&width=650&lines=Full-Stack+Engineer+%26+AI+Systems+Builder;High-Performance+Distributed+Backend+Architectures;AI+Semantic+Vector+Search+%26+Predictive+ML;Passionate+about+Scalability+%26+Clean+Code)](https://git.io/typing-svg)

<p align="center">
  <a href="https://github.com/Omkarjagtap15"><img src="https://img.shields.io/badge/GitHub-Omkarjagtap15-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <a href="https://twitter.com/Omkar_j_1304"><img src="https://img.shields.io/badge/Twitter-@Omkar__j__1304-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>
  <a href="mailto:jagtapomkar319@gmail.com"><img src="https://img.shields.io/badge/Email-Contact%20Me-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

</div>

---

### 👨‍💻 About Me

I am a **Full-Stack Software Engineer** passionate about building high-throughput backend services, intelligent AI applications, and resilient data architectures. 

- 🚀 **Backend & Distributed Systems**: Engineered systems featuring **sub-3ms multi-tier caching (2,380x speedup)** and custom **Single-Flight request deduplication** to eliminate the *thundering herd* problem.
- 🧠 **AI & Machine Learning**: Deployed production **1536-dimensional vector search engines (`pgvector`)**, automated Information Retrieval benchmarking suites (Precision@K / MRR), and **proactive time-series liquidity risk forecasting models**.
- 🛠️ **Full-Stack Craftsmanship**: Building sleek, responsive user interfaces with **React 18, Next.js, and Tailwind CSS**, backed by resilient Node.js / Express and Python microservices.
- 🔭 **Current Focus**: Architecting scalable Retrieval-Augmented Generation (RAG) systems, asynchronous background queues (BullMQ), and real-time observability telemetry.

---

## 🛠 Tech Stack

<div align="center">

| Domain | Technologies & Frameworks |
|---|---|
| **Languages** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![SQL](https://img.shields.io/badge/SQL-025E8C?style=flat-square&logo=postgresql&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Backend & APIs** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) ![REST APIs](https://img.shields.io/badge/REST_APIs-02569B?style=flat-square) ![BullMQ](https://img.shields.io/badge/BullMQ-E0234E?style=flat-square) ![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=flat-square&logo=streamlit&logoColor=white) |
| **Databases & Caching** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) ![pgvector](https://img.shields.io/badge/pgvector-025E8C?style=flat-square) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white) ![Neon Database](https://img.shields.io/badge/Neon_Serverless-00E599?style=flat-square&logo=neon&logoColor=black) |
| **AI & Data Science** | ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white) ![Gemini AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white) ![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white) ![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=flat-square&logo=plotly&logoColor=white) |
| **Frontend & UI** | ![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **DevOps & Cloud** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Docker Compose](https://img.shields.io/badge/Compose-2496ED?style=flat-square) ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black) |

</div>

---

## 🚀 Featured Engineering Projects

### 🎬 [Cinemate — AI-Powered Movie Discovery & Recommendation Platform](https://github.com/Omkarjagtap15/Cinemate)
> **Production-grade full-stack movie intelligence engine with sub-3ms multi-tier caching and AI vector discovery.**
>
> 🌐 [**Live Demo**](https://cinemate-jktz.onrender.com) • 📊 [**Live Telemetry Dashboard**](https://cinemate-jktz.onrender.com/admin) *(Secret: `cinemate-admin-secret`)* • 💻 [**Source Code**](https://github.com/Omkarjagtap15/Cinemate)

- **Performance Engineering**: Implemented deterministic Redis caching with automated in-memory L1 fallback, slashing average query latency from **7,675ms to 3.2ms (2,383x speedup)**.
- **Cache Stampede Mitigation**: Designed a custom **Single-Flight Promise coalescer** that prevents the *thundering herd* problem during burst queries (**95% reduction in outbound network overhead**).
- **AI Vector Search**: Stored 1536-dimensional OpenAI embeddings directly in **PostgreSQL 16 using `pgvector`**, executing natural language semantic queries alongside relational filters in **< 0.2ms** (+31.6% Precision@5 vs. lexical search).
- **Explainable Recommendations**: Designed a multi-factor hybrid scoring algorithm combining vector cosine similarity, genre affinity, normalized vote quality, and dynamic human-readable reasoning.
- *Tech Stack*: `React 18`, `Node.js`, `Express 4`, `PostgreSQL 16 (pgvector)`, `Redis 7`, `BullMQ`, `OpenAI`, `Docker`, `Tailwind CSS`.

---

### 📈 [FinPulse — Dynamic Liquidity Exposure Monitor](https://github.com/Omkarjagtap15/FinPulse)
> **Proactive liquidity risk intelligence platform forecasting banking distress 30 days in advance.**
>
> 🌐 [**Live Demo**](https://finpulse-4emtrj3zww3kb4cmfxi6vl.streamlit.app/) • 💻 [**Source Code**](https://github.com/Omkarjagtap15/FinPulse)

- **Predictive Risk Analytics**: Replaced reactive overdraft logging with predictive time-series modeling (**Holt-Winters Exponential Smoothing**) across **1,000 retail banking customers** in **8 behavioral segments**.
- **Early Warning Signals (EWS)**: Automated multi-tier risk alert thresholds, enabling relationship managers to intervene days to weeks before liquidity breaches occur.
- **AI-Powered Synthesized Insights**: Integrated Google Gemini 1.5 Flash to automatically interpret complex time-series trends into actionable executive summaries.
- *Tech Stack*: `Python 3.10+`, `Streamlit`, `Scikit-Learn`, `Plotly`, `Gemini 1.5 Flash`, `Statistical Time-Series`.

---

### ⚡ [QuickAI — Full-Stack AI Productivity & Document Intelligence Suite](https://github.com/Omkarjagtap15/QuickAI)
> **Multi-modal AI workspace for text generation, automated PDF parsing, and digital asset workflows.**
>
> 💻 [**Source Code**](https://github.com/Omkarjagtap15/QuickAI)

- **Document Parsing & Extraction**: Built asynchronous document extraction pipelines parsing large PDF files (`pdf-parse`) and generating structured summaries via OpenAI.
- **Scalable Architecture**: Integrated Neon Serverless PostgreSQL with Clerk authentication and Cloudinary image pipelines under Express 5.
- **Streaming AI Pipelines**: Designed real-time token streaming endpoints for interactive text completion, prompt templates, and code assistance.
- **Secure File Storage**: Engineered secure multipart/form-data upload flows using Multer with Cloudinary CDN media optimization.
- *Tech Stack*: `React`, `Node.js / Express 5`, `OpenAI API`, `Neon PostgreSQL`, `Cloudinary`, `Clerk Auth`, `Multer`.

---

### 💼 [InterviewMentorAI — AI-Powered Technical Interview Mentorship](https://github.com/Omkarjagtap15/InterviewMentorAI)
> **Interactive AI interview simulation platform delivering real-time candidate feedback.**
>
> 💻 [**Source Code**](https://github.com/Omkarjagtap15/InterviewMentorAI)

- **Real-Time Evaluation**: Leverages prompt-engineered LLM chains to analyze candidate answers against technical rubrics and output targeted, constructive critiques.
- **Dynamic Scoring Matrix**: Assesses code complexity, algorithmic efficiency, system design tradeoffs, and communication clarity.
- **Adaptive Questioning**: Synthesizes follow-up probing questions dynamically based on previous responses to simulate authentic technical screening rounds.
- **Type-Safe Full-Stack**: Built with end-to-end TypeScript, Next.js, and Tailwind CSS for rapid state updates and zero-latency user feedback.
- *Tech Stack*: `TypeScript`, `Next.js`, `Tailwind CSS`, `Generative AI`, `LLM Prompt Engineering`.

---

### ☕ [Cafeecafii — Modern Responsive Web Platform](https://github.com/Omkarjagtap15/Cafeecafii)
> **Aesthetic café web experience blending modern typography, sleek design, and responsive layouts.**
>
> 💻 [**Source Code**](https://github.com/Omkarjagtap15/Cafeecafii)

- **Modern Architecture**: Developed using Next.js and TypeScript, leveraging modern component patterns and server-side performance optimizations.
- **Tailored Design System**: Crafted a customized dark-mode aesthetic with fluid typography, responsive grid layouts, and smooth micro-interactions.
- **Interactive State**: Implemented seamless client-side state for menu exploration, category filtering, and item selection.
- **Web Performance**: Optimized asset delivery, layout stability, and SEO metadata to achieve top-tier Lighthouse scores across mobile and desktop.
- *Tech Stack*: `Next.js`, `TypeScript`, `Tailwind CSS`, `Lucide Icons`.

---

## 📊 GitHub Analytics & Activity

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=Omkarjagtap15&show_icons=true&theme=tokyonight&hide_border=true&count_private=true" height="175" alt="Omkar's GitHub Stats" />
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Omkarjagtap15&layout=compact&theme=tokyonight&hide_border=true" height="175" alt="Top Languages" />

<br />

<img src="https://github-readme-streak-stats.herokuapp.com/?user=Omkarjagtap15&theme=tokyonight&hide_border=true" alt="GitHub Streak" />

</div>

---

## 🤝 Let's Connect!

I am always open to discussing full-stack engineering opportunities, distributed systems challenges, AI application design, or open-source collaboration.

- 💬 **Ask me about**: Node.js microservices, Redis caching patterns, pgvector, and LLM integrations.
- 📫 **Email**: [jagtapomkar319@gmail.com](mailto:jagtapomkar319@gmail.com)
- 🐦 **Twitter / X**: [@Omkar_j_1304](https://twitter.com/Omkar_j_1304)
- 🔗 **GitHub**: [github.com/Omkarjagtap15](https://github.com/Omkarjagtap15)

<div align="center">
  <sub>Designed & built with care by <b>Omkar Jagtap</b>.</sub>
</div>
