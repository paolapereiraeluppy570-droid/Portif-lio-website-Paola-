
const $ = selector => document.querySelector(selector);

const page = document.body.dataset.page || "inicio";

const pages = [
  ["Início", "index.html", "inicio"],
  ["Sobre mim", "sobre.html", "sobre"],
  ["Serviços", "servicos.html", "servicos"],
  ["Projetos", "projetos.html", "projetos"],
  ["Certificados", "certificados.html", "certificados"],
  ["Eventos", "eventos.html", "eventos"],
  ["Diário", "diario.html", "diario"],
  ["Contato", "contato.html", "contato"]
];

/* CONTATOS INICIAIS */

const defaultContacts = [
  {
    id: "whatsapp",
    nome: "WhatsApp",
    url: "https://wa.me/message/OQVCHWIGD4X4H1",
    principal: true
  },
  {
    id: "instagram",
    nome: "Instagram",
    url: "https://www.instagram.com/paolapereirar?fqnt=NnpncDN2cHVrNnZjlikdin",
    principal: false
  },
  {
    id: "linkedin",
    nome: "LinkedIn",
    url: "https://www.linkedin.com/in/paola-pereira-a64626413?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    principal: false
  }
];

const collections = {
  servicos: {
    title: "Serviços",
    fields: [
      ["titulo", "Nome do serviço"],
      ["descricao", "Descrição", "textarea"]
    ]
  },
  projetos: {
    title: "Projetos",
    fields: [
      ["titulo", "Título"],
      ["categoria", "Categoria"],
      ["descricao", "Descrição", "textarea"],
      ["link", "Link do projeto", "url"],
      ["destaque", "Mostrar na página inicial", "checkbox"]
    ]
  },
  certificados: {
    title: "Certificados",
    fields: [
      ["titulo", "Nome do certificado"],
      ["instituicao", "Instituição"],
      ["ano", "Ano"],
      ["link", "Link do certificado", "url"]
    ]
  },
  eventos: {
    title: "Eventos",
    fields: [
      ["titulo", "Nome do evento"],
      ["data", "Data"],
      ["local", "Local"],
      ["descricao", "Descrição", "textarea"]
    ]
  },
  diario: {
    title: "Diário",
    fields: [
      ["titulo", "Título"],
      ["data", "Data"],
      ["texto", "Texto", "textarea"]
    ]
  }
};

/* FUNÇÕES GERAIS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function safeURL(value) {
  const url = String(value || "").trim();

  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
    return escapeHTML(url);
  }

  return "";
}

function getLocalData() {
  try {
    const saved = JSON.parse(localStorage.getItem("paolaPortfolio"));

    return saved
      ? { ...portfolioData, ...saved }
      : { ...portfolioData };
  } catch {
    return { ...portfolioData };
  }
}

function completeData(source) {
  const result = { ...portfolioData, ...source };

  [
    "projetos",
    "certificados",
    "eventos",
    "diario",
    "servicos"
  ].forEach(key => {
    if (!Array.isArray(result[key])) result[key] = [];

    result[key] = result[key].map((item, index) => ({
      ...item,
      id: item.id || `inicial-${key}-${index}`,
      imagemModo: item.imagemModo || "contain",
      imagemAltura: Number(item.imagemAltura) || 320
    }));
  });

  if (!Array.isArray(result.contatos)) {
    result.contatos = JSON.parse(JSON.stringify(defaultContacts));
  }

  result.contatos = result.contatos.map((item, index) => ({
    ...item,
    id: item.id || `contato-${index}`
  }));

  result.fotoLargura = Number(result.fotoLargura) || 100;
  result.fotoAltura = Number(result.fotoAltura) || 440;
  result.fotoModo = result.fotoModo || "contain";

  return result;
}

let data = completeData(getLocalData());

/* CARREGAR E SALVAR NA NUVEM */

async function loadPortfolioData() {
  try {
    const { data: result, error } = await supabaseClient
      .from("conteudo_site")
      .select("conteudo")
      .eq("secao", "portfolio")
      .maybeSingle();

    if (error) throw error;

    if (result && result.conteudo) {
      data = completeData(JSON.parse(result.conteudo));
    }

    localStorage.setItem("paolaPortfolio", JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    data = completeData(getLocalData());
  }
}

async function saveData() {
  try {
    const { error } = await supabaseClient
      .from("conteudo_site")
      .upsert(
        {
          secao: "portfolio",
          conteudo: JSON.stringify(data)
        },
        { onConflict: "secao" }
      );

    if (error) throw error;

    localStorage.setItem("paolaPortfolio", JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Não foi possível salvar na nuvem. Confira sua conexão e tente novamente.");
    return false;
  }
}

/* BOTÃO VOLTAR */

function backButton(destination = "index.html") {
  return `
    <button class="back-button" type="button"
      onclick="if (history.length > 1) { history.back(); } else { location.href='${destination}'; }">
      ← Voltar
    </button>
  `;
}

/* TÍTULOS DAS PÁGINAS */

function heading(title, description) {
  return `
    <section class="page-heading">
      <div class="container">
        ${backButton()}
        <span class="eyebrow">PP Studio</span>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(description)}</p>
      </div>
    </section>
  `;
}

/* ÍCONES DAS REDES SOCIAIS */

function socialIcon(name) {
  const key = String(name || "").toLowerCase();

  const icons = {
    instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5"
          fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="4"
          fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="18" cy="6" r="1.3" fill="currentColor"/>
      </svg>
    `,
    whatsapp: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 8.5c.4 2.3 2.2 4.1 4.5 4.8l1.3-1.1 2 1"
          fill="none" stroke="currentColor" stroke-width="1.7"
          stroke-linecap="round"/>
      </svg>
    `,
    linkedin: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9v10M5 5v.1M10 19v-6a3 3 0 0 1 6 0v6M10 10v9"
          fill="none" stroke="currentColor" stroke-width="2.4"
          stroke-linecap="round"/>
      </svg>
    `,
    tiktok: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 4v10.5a4 4 0 1 1-4-4"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round"/>
        <path d="M14 4c.5 3 2.3 4.7 5 5"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round"/>
      </svg>
    `,
    github: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.1-1.5 6.1-6.6a5.1 5.1 0 0 0-1.4-3.5 4.7 4.7 0 0 0-.1-3.5s-1.2-.4-3.7 1.4a12.8 12.8 0 0 0-6.7 0C5.8 1.4 4.6 1.8 4.6 1.8a4.7 4.7 0 0 0-.1 3.5A5.1 5.1 0 0 0 3.1 8.8c0 5.1 3.1 6.3 6.1 6.6a3.4 3.4 0 0 0-.9 2.7V22"
          fill="none" stroke="currentColor" stroke-width="1.7"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  };

  const found = Object.keys(icons).find(item => key.includes(item));

  return found
    ? icons[found]
    : `<span>${escapeHTML(String(name || "?").charAt(0).toUpperCase())}</span>`;
}

/* CABEÇALHO E RODAPÉ */

function renderHeader() {
  const logoAtual = data.logo || "./imagem/Logo-pp.png";

  $("#header").innerHTML = `
    <div class="container navbar">
      <a class="logo" href="index.html">
        <img src="${escapeHTML(logoAtual)}"
          alt="Logo PP Studio"
          onerror="this.style.display='none'">
        <span>PP Studio | Paola Pereira</span>
      </a>

      <button class="menu-button" id="menuButton"
        aria-label="Abrir menu">☰</button>

      <nav class="nav-links" id="navLinks">
        ${pages.map(([name, url, id]) =>
          `<a class="${page === id ? "active" : ""}" href="${url}">${name}</a>`
        ).join("")}
      </nav>
    </div>
  `;

  $("#menuButton").addEventListener("click", () => {
    $("#navLinks").classList.toggle("open");
  });
}

function renderFooter() {
  const contacts = data.contatos || [];

  $("#footer").innerHTML = `
    <div class="container">
      <div class="social-links">
        ${contacts.filter(item => safeURL(item.url)).map(item => `
          <a class="social-link"
            href="${safeURL(item.url)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${escapeHTML(item.nome)}">
            <span class="social-icon">${socialIcon(item.nome)}</span>
            <span>${escapeHTML(item.nome)}</span>
          </a>
        `).join("")}
      </div>

      <p>© ${new Date().getFullYear()} ${escapeHTML(data.nome)}. Todos os direitos reservados.</p>
      <p>Feito com criatividade, tecnologia e propósito.</p>
    </div>
  `;
}

/* ESTILO DAS IMAGENS DO CONTEÚDO */

function contentImage(item, alt = "") {
  if (!item.imagem) return "";

  const modo = item.imagemModo === "cover" ? "cover" : "contain";
  const altura = Math.min(900, Math.max(100, Number(item.imagemAltura) || 320));

  return `
    <img
      src="${escapeHTML(item.imagem)}"
      alt="${escapeHTML(alt || item.titulo || "Imagem do portfólio")}"
      style="
        width:100%;
        height:${altura}px;
        max-height:none;
        object-fit:${modo};
        object-position:center;
        background:#101010;
        border-radius:10px;
        display:block;
      "
      onerror="this.style.display='none'">
  `;
}

/* CARTÕES DE PROJETOS */

function projectCard(project) {
  const link = safeURL(project.link);

  return `
    <article class="card">
      ${contentImage(project, project.titulo)}

      <span class="tag">${escapeHTML(project.categoria || "Projeto")}</span>
      <h3>${escapeHTML(project.titulo)}</h3>
      <p>${escapeHTML(project.descricao)}</p>

      ${link ? `
        <a class="btn" href="${link}"
          target="_blank" rel="noopener">Ver projeto</a>
      ` : ""}
    </article>
  `;
}

/* PÁGINA INICIAL */

function renderHome() {
  const largura = Math.min(100, Math.max(30, Number(data.fotoLargura) || 100));
  const altura = Math.min(900, Math.max(100, Number(data.fotoAltura) || 440));
  const modo = data.fotoModo === "cover" ? "cover" : "contain";

  $("#conteudo").innerHTML = `
    <section class="hero">
      <div class="container hero-content">
        <div>
          <span class="eyebrow">${escapeHTML(data.profissao)}</span>
          <h1>Olá, eu sou ${escapeHTML(data.nome)}.</h1>
          <p>${escapeHTML(data.apresentacao)}</p>
          <a href="projetos.html" class="btn">Conheça meus projetos</a>
          <a href="sobre.html" class="btn btn-secondary">Sobre mim</a>
        </div>

        <div style="display:flex;justify-content:center">
          ${data.foto ? `
            <img class="hero-image"
              src="${escapeHTML(data.foto)}"
              alt="Foto de ${escapeHTML(data.nome)}"
              style="
                width:${largura}%;
                height:${altura}px;
                max-height:none;
                object-fit:${modo};
                object-position:center;
              "
              onerror="this.style.display='none'">
          ` : ""}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <span class="eyebrow">Meu trabalho</span>
          <h2>Projetos em destaque</h2>
        </div>

        <div class="grid">
          ${data.projetos.filter(p => p.destaque).map(projectCard).join("")}
        </div>

        <a href="projetos.html" class="btn">Ver todos os projetos</a>
      </div>
    </section>
  `;
}

/* SOBRE MIM */

function renderAbout() {
  const birthday = new Date(data.aniversario + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();

  if (
    today.getMonth() < birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() < birthday.getDate())
  ) age--;

  const largura = Math.min(100, Math.max(30, Number(data.fotoLargura) || 100));
  const altura = Math.min(900, Math.max(100, Number(data.fotoAltura) || 440));
  const modo = data.fotoModo === "cover" ? "cover" : "contain";

  $("#conteudo").innerHTML = `
    ${heading("Sobre mim", "Um pouco da minha história, formação e trajetória.")}

    <section class="section">
      <div class="container about-layout">
        ${data.foto ? `
          <img class="hero-image"
            src="${escapeHTML(data.foto)}"
            alt="Paola Pereira"
            style="
              width:${largura}%;
              height:${altura}px;
              max-height:none;
              object-fit:${modo};
              object-position:center;
            ">
        ` : ""}

        <div>
          <span class="eyebrow">Prazer, sou a Paola</span>
          <h2>Tecnologia e criatividade caminham juntas.</h2>
          <p>${escapeHTML(data.sobre)}</p>
          <p><strong>Idade:</strong> ${age} anos</p>
          <p><strong>Formação:</strong> ${escapeHTML(data.curso)} — ${escapeHTML(data.universidade)}</p>
          <p><strong>Localização:</strong> ${escapeHTML(data.cidade)}</p>
        </div>
      </div>
    </section>
  `;
}

/* SERVIÇOS */

function renderServices() {
  $("#conteudo").innerHTML = `
    ${heading("Serviços", "Soluções criativas que conectam comunicação e tecnologia.")}

    <section class="section">
      <div class="container grid">
        ${data.servicos.length ? data.servicos.map(item => `
          <article class="card">
            <h3>${escapeHTML(item.titulo)}</h3>
            <p>${escapeHTML(item.descricao)}</p>
          </article>
        `).join("") : "<p>Novos serviços serão adicionados em breve.</p>"}
      </div>
    </section>
  `;
}

/* PROJETOS */

function renderProjects() {
  $("#conteudo").innerHTML = `
    ${heading("Projetos", "Experiências, ideias e trabalhos desenvolvidos ao longo da minha trajetória.")}

    <section class="section">
      <div class="container">
        <input class="search-box" id="projectSearch"
          placeholder="Pesquisar projetos..." aria-label="Pesquisar projetos">

        <div class="grid" id="projectGrid">
          ${data.projetos.map(projectCard).join("")}
        </div>

        <p id="emptyProjects" hidden>Nenhum projeto encontrado.</p>
      </div>
    </section>
  `;

  $("#projectSearch").addEventListener("input", event => {
    const query = event.target.value.toLowerCase();

    const filtered = data.projetos.filter(project =>
      `${project.titulo} ${project.categoria} ${project.descricao}`
        .toLowerCase().includes(query)
    );

    $("#projectGrid").innerHTML = filtered.map(projectCard).join("");
    $("#emptyProjects").hidden = filtered.length > 0;
  });
}

/* CERTIFICADOS */

function renderCertificates() {
  $("#conteudo").innerHTML = `
    ${heading("Certificados", "Formação contínua e novos conhecimentos.")}

    <section class="section">
      <div class="container grid">
        ${data.certificados.length ? data.certificados.map(item => `
          <article class="card">
            ${contentImage(item, "Certificado " + item.titulo)}

            <h3>${escapeHTML(item.titulo)}</h3>
            <p>${escapeHTML(item.instituicao || "")}</p>
            <p>${escapeHTML(item.ano || "")}</p>

            ${safeURL(item.link) ? `
              <a class="btn" href="${safeURL(item.link)}"
                target="_blank" rel="noopener">Ver certificado</a>
            ` : ""}
          </article>
        `).join("") : "<p>Os certificados serão adicionados em breve.</p>"}
      </div>
    </section>
  `;
}

/* EVENTOS */

function renderEvents() {
  $("#conteudo").innerHTML = `
    ${heading("Eventos e experiências", "Momentos, participações e experiências importantes na minha trajetória.")}

    <section class="section">
      <div class="container grid">
        ${data.eventos.length ? data.eventos.map(item => `
          <article class="card">
            ${contentImage(item, item.titulo)}

            <h3>${escapeHTML(item.titulo)}</h3>
            <p>${escapeHTML(item.data || "")}</p>
            <p>${escapeHTML(item.local || "")}</p>
            <p>${escapeHTML(item.descricao || "")}</p>
          </article>
        `).join("") : "<p>Novas experiências serão registradas aqui.</p>"}
      </div>
    </section>
  `;
}

/* DIÁRIO */

function renderDiary() {
  $("#conteudo").innerHTML = `
    ${heading("Notas de percurso", "Aprendizados, ideias e registros de uma trajetória em construção.")}

    <section class="section">
      <div class="container">
        ${data.diario.map(item => `
          <article class="card" style="margin-bottom:20px">
            ${contentImage(item, item.titulo)}

            <span class="eyebrow">${escapeHTML(item.data || "")}</span>
            <h3>${escapeHTML(item.titulo)}</h3>
            <p>${escapeHTML(item.texto)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

/* CONTATO */

function renderContact() {
  const contacts = [...(data.contatos || [])];
  const whatsapp = contacts.find(item =>
    item.principal && safeURL(item.url)
  );

  const otherContacts = contacts.filter(item =>
    item.id !== whatsapp?.id && safeURL(item.url)
  );

  $("#conteudo").innerHTML = `
    ${heading("Vamos conversar?", "Entre em contato para projetos, parcerias e oportunidades.")}

    <section class="section">
      <div class="container">

        <div class="card">
          <span class="eyebrow">Contato principal</span>
          <h2>Vamos conversar?</h2>
          <p>Para projetos, parcerias ou oportunidades, será um prazer conversar com você.</p>

          ${whatsapp ? `
            <a class="btn"
              href="${safeURL(whatsapp.url)}"
              target="_blank"
              rel="noopener noreferrer">
              ${socialIcon("WhatsApp")}
              Conversar pelo WhatsApp
            </a>
          ` : `
            <p>O contato principal será adicionado em breve.</p>
          `}
        </div>

        ${otherContacts.length ? `
          <div class="section-title" style="margin-top:45px">
            <span class="eyebrow">Me encontre também</span>
            <h2>Minhas redes</h2>
          </div>

          <div class="social-links">
            ${otherContacts.map(item => `
              <a class="social-link"
                href="${safeURL(item.url)}"
                target="_blank"
                rel="noopener noreferrer">
                <span class="social-icon">${socialIcon(item.nome)}</span>
                <span>${escapeHTML(item.nome)}</span>
              </a>
            `).join("")}
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

/* ENVIO DE IMAGENS */

async function uploadImage(file) {
  if (!file) return null;

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Escolha uma imagem PNG, JPG ou WEBP.");
    return null;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem deve ter no máximo 5 MB.");
    return null;
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabaseClient.storage
    .from("imagens-portfolio")
    .upload(fileName, file);

  if (error) {
    console.error(error);
    alert("Erro ao enviar imagem: " + error.message);
    return null;
  }

  const { data: publicData } = supabaseClient.storage
    .from("imagens-portfolio")
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}

/* LOGIN ADMINISTRATIVO */

function renderAdminLogin(message = "") {
  $("#conteudo").innerHTML = `
    ${heading("Acesso administrativo", "Entre para editar seu portfólio.")}

    <section class="section">
      <div class="container">
        <div class="admin-panel">
          <h2>Entrar</h2>

          <form id="loginForm" class="admin-form">
            <label>E-mail</label>
            <input name="email" type="email" required
              placeholder="Seu e-mail cadastrado">

            <label>Senha</label>
            <input name="password" type="password" required
              placeholder="Sua senha">

            <button class="btn" type="submit">Entrar no painel</button>
            <p id="loginMessage">${escapeHTML(message)}</p>
          </form>
        </div>
      </div>
    </section>
  `;

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.target);
    const button = event.target.querySelector("button");

    button.disabled = true;
    button.textContent = "Entrando...";

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password")
    });

    if (error) {
      $("#loginMessage").textContent =
        "Não foi possível entrar. Confira seu e-mail e sua senha.";

      button.disabled = false;
      button.textContent = "Entrar no painel";
      return;
    }

    await loadPortfolioData();
    renderAdmin();
    renderFooter();
  });
}

/* FORMULÁRIOS DAS SEÇÕES */

function collectionForm(type, config) {
  const fields = config.fields.map(([name, label, kind]) => {
    if (kind === "textarea") {
      return `
        <label>${label}</label>
        <textarea name="${name}"></textarea>
      `;
    }

    if (kind === "checkbox") {
      return `
        <label>
          <input type="checkbox" name="${name}">
          ${label}
        </label>
      `;
    }

    return `
      <label>${label}</label>
      <input name="${name}"
        type="${kind === "url" ? "url" : "text"}">
    `;
  }).join("");

  return `
    <div class="admin-panel">
      <h2>${config.title}</h2>

      <form class="admin-form" id="${type}Form">
        <input type="hidden" name="itemId">

        ${fields}

        ${type !== "servicos" ? `
          <label>Imagem</label>
          <input type="file" id="${type}Upload"
            accept="image/png,image/jpeg,image/webp">

          <input type="hidden" name="imagem" id="${type}Imagem">

          <div id="${type}Preview"></div>

          <label>Como a imagem deve aparecer?</label>
          <select name="imagemModo">
            <option value="contain">Mostrar imagem inteira (recomendado)</option>
            <option value="cover">Preencher espaço (pode cortar)</option>
          </select>

          <label>Altura da imagem em pixels</label>
          <input name="imagemAltura" type="number"
            min="100" max="900" value="320">

          <p>Use "imagem inteira" para certificados, prints de sites e imagens que não podem ser cortadas.</p>
        ` : ""}

        <button class="btn" type="submit">
          Salvar ${config.title.toLowerCase()}
        </button>

        <button class="btn btn-secondary" type="button"
          data-cancel="${type}">Cancelar edição</button>
      </form>

      <div id="${type}Lista"></div>
    </div>
  `;
}

/* LISTAGEM DOS CONTEÚDOS NO PAINEL */

function renderAdminCollections() {
  Object.entries(collections).forEach(([type]) => {
    const container = document.getElementById(type + "Lista");
    if (!container) return;

    const items = data[type] || [];

    container.innerHTML = items.map((item, index) => `
      <article class="card" style="margin:15px 0;padding:15px">
        ${item.imagem ? `
          <img src="${escapeHTML(item.imagem)}"
            alt="${escapeHTML(item.titulo)}"
            style="
              width:100%;
              max-width:240px;
              height:${Math.min(900, Math.max(100, Number(item.imagemAltura) || 320))}px;
              object-fit:${item.imagemModo === "cover" ? "cover" : "contain"};
              background:#101010;
              border-radius:10px;
            ">
        ` : ""}

        <h3>${escapeHTML(item.titulo || "Sem título")}</h3>
        <p>${escapeHTML(item.instituicao || item.categoria || item.data || item.descricao || "")}</p>

        <div class="admin-actions">
          <button class="btn" type="button"
            data-edit="${type}" data-index="${index}">Editar</button>

          <button class="btn btn-secondary" type="button"
            data-delete="${type}" data-index="${index}">Excluir</button>

          ${type === "projetos" ? `
            <button class="btn btn-secondary" type="button"
              data-move="up" data-index="${index}">↑</button>

            <button class="btn btn-secondary" type="button"
              data-move="down" data-index="${index}">↓</button>
          ` : ""}
        </div>
      </article>
    `).join("") || "<p>Nenhum conteúdo cadastrado ainda.</p>";
  });
}

/* REDES SOCIAIS NO PAINEL */

function renderAdminContacts() {
  const container = $("#contatosLista");
  if (!container) return;

  container.innerHTML = data.contatos.map(item => `
    <article class="card" style="margin:15px 0;padding:15px">
      <div class="social-links">
        <span class="social-icon">${socialIcon(item.nome)}</span>
        <h3>${escapeHTML(item.nome)}</h3>
      </div>

      <p style="word-break:break-all">${escapeHTML(item.url)}</p>

      ${item.principal ? `
        <p><strong>Contato principal</strong></p>
      ` : ""}

      <div class="admin-actions">
        <button class="btn" type="button"
          data-contact-edit="${escapeHTML(item.id)}">
          Editar
        </button>

        <button class="btn btn-secondary" type="button"
          data-contact-delete="${escapeHTML(item.id)}">
          Excluir
        </button>
      </div>
    </article>
  `).join("") || "<p>Nenhuma rede cadastrada ainda.</p>";
}

/* PAINEL ADMINISTRATIVO */

function renderAdmin() {
  Object.keys(collections).forEach(type => {
    if (!Array.isArray(data[type])) data[type] = [];
  });

  if (!Array.isArray(data.contatos)) {
    data.contatos = JSON.parse(JSON.stringify(defaultContacts));
  }

  $("#conteudo").innerHTML = `
    ${heading("Painel administrativo", "Gerencie todo o conteúdo do PP Studio.")}

    <section class="section">
      <div class="container">

        <div class="admin-panel">
          <h2>Minha conta</h2>
          <button class="btn btn-secondary" id="logoutButton">
            Sair do painel
          </button>
        </div>

        <div class="admin-panel">
          <h2>Perfil e apresentação</h2>

          <form id="adminForm" class="admin-form">
            <label>Nome</label>
            <input name="nome" value="${escapeHTML(data.nome)}">

            <label>Profissão</label>
            <input name="profissao" value="${escapeHTML(data.profissao)}">

            <label>Apresentação</label>
            <textarea name="apresentacao">${escapeHTML(data.apresentacao)}</textarea>

            <label>Sobre mim</label>
            <textarea name="sobre">${escapeHTML(data.sobre)}</textarea>

            <label>Curso</label>
            <input name="curso" value="${escapeHTML(data.curso)}">

            <label>Universidade</label>
            <input name="universidade" value="${escapeHTML(data.universidade)}">

            <label>Cidade</label>
            <input name="cidade" value="${escapeHTML(data.cidade)}">

            <label>Data de aniversário</label>
            <input name="aniversario" type="date"
              value="${escapeHTML(data.aniversario)}">

            <label>Foto pessoal</label>
            <input type="file" id="fotoUpload"
              accept="image/png,image/jpeg,image/webp">

            <input name="foto" id="fotoCaminho" type="hidden"
              value="${escapeHTML(data.foto)}">

            <div id="fotoPreview">
              ${data.foto ? `
                <img src="${escapeHTML(data.foto)}"
                  alt="Foto atual"
                  style="
                    width:${data.fotoLargura}%;
                    height:${data.fotoAltura}px;
                    object-fit:${data.fotoModo};
                    background:#101010;
                  ">
              ` : ""}
            </div>

            <label>Largura da foto (%)</label>
            <input name="fotoLargura" type="number"
              min="30" max="100"
              value="${data.fotoLargura}">

            <label>Altura da foto (pixels)</label>
            <input name="fotoAltura" type="number"
              min="100" max="900"
              value="${data.fotoAltura}">

            <label>Enquadramento da foto</label>
            <select name="fotoModo">
              <option value="contain" ${data.fotoModo === "contain" ? "selected" : ""}>
                Mostrar foto inteira
              </option>
              <option value="cover" ${data.fotoModo === "cover" ? "selected" : ""}>
                Preencher espaço
              </option>
            </select>

            <p>Escolha "mostrar foto inteira" para evitar cortes.</p>

            <button class="btn" type="submit">Salvar perfil</button>
          </form>
        </div>

        <div class="admin-panel">
          <h2>Logo do PP Studio</h2>
          <p>Escolha uma nova imagem para a identidade visual do seu site.</p>

          <form id="logoForm" class="admin-form">
            <label>Enviar nova logo</label>
            <input type="file" id="logoUpload"
              accept="image/png,image/jpeg,image/webp">

            <input type="hidden" name="logo" id="logoCaminho"
              value="${escapeHTML(data.logo || "./imagem/Logo-pp.png")}">

            <div id="logoPreview">
              <img src="${escapeHTML(data.logo || "./imagem/Logo-pp.png")}"
                alt="Logo atual do PP Studio"
                style="width:160px;max-height:120px;object-fit:contain">
            </div>

            <button class="btn" type="submit">Salvar nova logo</button>
          </form>
        </div>

        <div class="admin-panel">
          <h2>Redes sociais e contatos</h2>
          <p>Adicione os links das suas redes. Você pode editar ou excluir quando quiser.</p>

          <form id="contatosForm" class="admin-form">
            <input type="hidden" name="contatoId">

            <label>Nome da rede ou contato</label>
            <input name="nome" required
              placeholder="Ex.: WhatsApp, Instagram, TikTok, GitHub">

            <label>Link do perfil</label>
            <input name="url" type="url" required
              placeholder="https://...">

            <label>
              <input type="checkbox" name="principal">
              Definir como contato principal
            </label>

            <button class="btn" type="submit">
              Salvar contato
            </button>

            <button class="btn btn-secondary" type="button"
              id="cancelarContato">
              Cancelar edição
            </button>
          </form>

          <div id="contatosLista"></div>
        </div>

        ${Object.entries(collections).map(([type, config]) =>
          collectionForm(type, config)
        ).join("")}

        <div class="admin-panel">
          <h2>Backup do portfólio</h2>

          <button class="btn btn-secondary" id="exportData">
            Exportar conteúdo
          </button>

          <button class="btn btn-secondary" id="resetData">
            Restaurar dados iniciais
          </button>

          <a class="btn" href="index.html" target="_blank">
            Visualizar meu site
          </a>
        </div>

      </div>
    </section>
  `;

  /* SAIR DO PAINEL */

  $("#logoutButton").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("Não foi possível sair do painel.");
      return;
    }

    renderAdminLogin("Você saiu do painel.");
  });

  /* FOTO DO PERFIL */

  $("#fotoUpload").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    const url = await uploadImage(file);

    if (url) {
      $("#fotoCaminho").value = url;

      $("#fotoPreview").innerHTML = `
        <img src="${escapeHTML(url)}"
          alt="Prévia da foto"
          style="
            width:100%;
            max-width:100%;
            height:300px;
            object-fit:contain;
            background:#101010;
            border-radius:12px;
          ">
      `;

      alert("Foto enviada! Ajuste o tamanho e clique em Salvar perfil.");
    }
  });

  /* SALVAR PERFIL */

  $("#adminForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.target);

    data.nome = form.get("nome");
    data.profissao = form.get("profissao");
    data.apresentacao = form.get("apresentacao");
    data.sobre = form.get("sobre");
    data.curso = form.get("curso");
    data.universidade = form.get("universidade");
    data.cidade = form.get("cidade");
    data.aniversario = form.get("aniversario");
    data.foto = form.get("foto");

    data.fotoLargura = Math.min(100, Math.max(30, Number(form.get("fotoLargura")) || 100));
    data.fotoAltura = Math.min(900, Math.max(100, Number(form.get("fotoAltura")) || 440));
    data.fotoModo = form.get("fotoModo") === "cover" ? "cover" : "contain";

    if (await saveData()) {
      alert("Perfil salvo na nuvem!");
    }
  });

  /* ENVIAR E SALVAR LOGO */

  $("#logoUpload").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    const url = await uploadImage(file);

    if (url) {
      $("#logoCaminho").value = url;

      $("#logoPreview").innerHTML = `
        <img src="${escapeHTML(url)}" alt="Prévia da nova logo"
          style="width:160px;max-height:120px;object-fit:contain">
      `;

      alert("Logo enviada! Agora clique em Salvar nova logo.");
    }
  });

  $("#logoForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.target);
    data.logo = form.get("logo");

    if (await saveData()) {
      renderHeader();
      alert("Logo do PP Studio salva na nuvem!");
    }
  });

  /* CADASTRAR, EDITAR E EXCLUIR REDES SOCIAIS */

  $("#contatosForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.target);
    const contatoId = form.get("contatoId");
    const nome = String(form.get("nome") || "").trim();
    const url = String(form.get("url") || "").trim();
    const principal = form.get("principal") === "on";

    if (!nome || !safeURL(url)) {
      alert("Confira o nome e o link informado.");
      return;
    }

    if (principal) {
      data.contatos.forEach(item => {
        item.principal = false;
      });
    }

    if (contatoId) {
      const index = data.contatos.findIndex(item =>
        item.id === contatoId
      );

      if (index !== -1) {
        data.contatos[index] = {
          ...data.contatos[index],
          nome,
          url,
          principal
        };
      }
    } else {
      data.contatos.push({
        id: crypto.randomUUID(),
        nome,
        url,
        principal
      });
    }

    if (await saveData()) {
      event.target.reset();
      event.target.elements.namedItem("contatoId").value = "";

      renderAdminContacts();
      renderFooter();
      alert("Contato salvo na nuvem!");
    }
  });

  $("#cancelarContato").addEventListener("click", () => {
    $("#contatosForm").reset();
    $("#contatosForm").elements.namedItem("contatoId").value = "";
  });

  /* CADASTRO, EDIÇÃO E IMAGENS DAS SEÇÕES */

  Object.entries(collections).forEach(([type, config]) => {
    const formElement = document.getElementById(type + "Form");

    if (type !== "servicos") {
      document.getElementById(type + "Upload")
        .addEventListener("change", async event => {
          const file = event.target.files[0];
          if (!file) return;

          const url = await uploadImage(file);

          if (url) {
            document.getElementById(type + "Imagem").value = url;

            document.getElementById(type + "Preview").innerHTML = `
              <img src="${escapeHTML(url)}"
                alt="Prévia da imagem"
                style="
                  width:100%;
                  max-width:260px;
                  height:300px;
                  object-fit:contain;
                  background:#101010;
                  border-radius:10px;
                ">
            `;

            alert("Imagem enviada! Escolha o enquadramento e salve o conteúdo.");
          }
        });
    }

    formElement.addEventListener("submit", async event => {
      event.preventDefault();

      const form = new FormData(formElement);
      const itemId = form.get("itemId");
      const item = {};

      config.fields.forEach(([name, label, kind]) => {
        item[name] = kind === "checkbox"
          ? form.get(name) === "on"
          : form.get(name);
      });

      if (type !== "servicos") {
        item.imagem = form.get("imagem") || "";
        item.imagemModo = form.get("imagemModo") === "cover" ? "cover" : "contain";
        item.imagemAltura = Math.min(900, Math.max(100, Number(form.get("imagemAltura")) || 320));
      }

      if (itemId) {
        const index = data[type].findIndex(entry => entry.id === itemId);

        if (index !== -1) {
          item.id = itemId;

          if (type === "servicos") {
            item.imagem = data[type][index].imagem || "";
          }

          data[type][index] = item;
        }
      } else {
        item.id = crypto.randomUUID();
        data[type].push(item);
      }

      if (await saveData()) {
        formElement.reset();

        if (type !== "servicos") {
          document.getElementById(type + "Imagem").value = "";
          document.getElementById(type + "Preview").innerHTML = "";
          formElement.elements.namedItem("imagemAltura").value = 320;
          formElement.elements.namedItem("imagemModo").value = "contain";
        }

        renderAdminCollections();
        alert(`${config.title} salvo na nuvem!`);
      }
    });

    document.querySelector(`[data-cancel="${type}"]`)
      .addEventListener("click", () => {
        formElement.reset();

        if (type !== "servicos") {
          document.getElementById(type + "Imagem").value = "";
          document.getElementById(type + "Preview").innerHTML = "";
          formElement.elements.namedItem("imagemAltura").value = 320;
          formElement.elements.namedItem("imagemModo").value = "contain";
        }
      });
  });

  /* BOTÕES DE EDITAR, EXCLUIR E REORDENAR */

  $("#conteudo").addEventListener("click", async event => {
    const contactEditButton = event.target.closest("[data-contact-edit]");
    const contactDeleteButton = event.target.closest("[data-contact-delete]");

    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    const moveButton = event.target.closest("[data-move]");

    /* EDITAR CONTATO */

    if (contactEditButton) {
      const id = contactEditButton.dataset.contactEdit;
      const item = data.contatos.find(contact => contact.id === id);

      if (!item) return;

      const form = $("#contatosForm");

      form.elements.namedItem("contatoId").value = item.id;
      form.elements.namedItem("nome").value = item.nome;
      form.elements.namedItem("url").value = item.url;
      form.elements.namedItem("principal").checked = Boolean(item.principal);

      form.scrollIntoView({ behavior: "smooth" });
      return;
    }

    /* EXCLUIR CONTATO */

    if (contactDeleteButton) {
      const id = contactDeleteButton.dataset.contactDelete;
      const index = data.contatos.findIndex(item => item.id === id);

      if (index === -1) return;

      if (!confirm("Deseja excluir este contato?")) return;

      const removed = data.contatos.splice(index, 1);

      if (await saveData()) {
        renderAdminContacts();
        renderFooter();
        alert("Contato excluído!");
      } else {
        data.contatos.splice(index, 0, removed[0]);
      }

      return;
    }

    /* EDITAR ITEM */

    if (editButton) {
      const type = editButton.dataset.edit;
      const index = Number(editButton.dataset.index);
      const item = data[type][index];
      const form = document.getElementById(type + "Form");

      form.reset();

      Object.entries(item).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (!field) return;

        if (field.type === "checkbox") {
          field.checked = Boolean(value);
        } else {
          field.value = value ?? "";
        }
      });

      if (type !== "servicos") {
        form.elements.namedItem("imagemModo").value = item.imagemModo || "contain";
        form.elements.namedItem("imagemAltura").value = item.imagemAltura || 320;

        document.getElementById(type + "Preview").innerHTML =
          item.imagem
            ? `
              <img src="${escapeHTML(item.imagem)}"
                alt="Imagem atual"
                style="
                  width:100%;
                  max-width:260px;
                  height:300px;
                  object-fit:contain;
                  background:#101010;
                  border-radius:10px;
                ">
            `
            : "";
      }

      form.scrollIntoView({ behavior: "smooth" });
      return;
    }

    /* EXCLUIR ITEM */

    if (deleteButton) {
      const type = deleteButton.dataset.delete;
      const index = Number(deleteButton.dataset.index);

      if (!confirm("Deseja excluir este conteúdo?")) return;

      const removed = data[type].splice(index, 1);

      if (await saveData()) {
        renderAdminCollections();
        alert("Conteúdo excluído!");
      } else {
        data[type].splice(index, 0, removed[0]);
      }

      return;
    }

    /* REORDENAR PROJETOS */

    if (moveButton) {
      const index = Number(moveButton.dataset.index);
      const direction = moveButton.dataset.move;
      const projects = data.projetos;

      const newIndex = direction === "up"
        ? index - 1
        : index + 1;

      if (newIndex < 0 || newIndex >= projects.length) return;

      [projects[index], projects[newIndex]] =
        [projects[newIndex], projects[index]];

      if (await saveData()) {
        renderAdminCollections();
      } else {
        [projects[index], projects[newIndex]] =
          [projects[newIndex], projects[index]];
      }
    }
  });

  /* EXPORTAR BACKUP */

  $("#exportData").addEventListener("click", () => {
    const file = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "portfolio-paola-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  });

  /* RESTAURAR DADOS INICIAIS */

  $("#resetData").addEventListener("click", async () => {
    if (!confirm("Deseja restaurar os dados iniciais? Isso substituirá o conteúdo atual.")) {
      return;
    }

    const previousData = data;

    data = completeData(
      JSON.parse(JSON.stringify(portfolioData))
    );

    if (await saveData()) {
      alert("Dados iniciais restaurados!");
      renderAdmin();
    } else {
      data = previousData;
    }
  });

  renderAdminCollections();
  renderAdminContacts();
}

/* INICIALIZAÇÃO DO SITE */

async function start() {
  await loadPortfolioData();

  renderHeader();

  if (page === "admin") {
    const { data: sessionData, error } =
      await supabaseClient.auth.getSession();

    if (error || !sessionData.session) {
      renderAdminLogin();
    } else {
      renderAdmin();
    }
  } else {
    const renderers = {
      inicio: renderHome,
      sobre: renderAbout,
      servicos: renderServices,
      projetos: renderProjects,
      certificados: renderCertificates,
      eventos: renderEvents,
      diario: renderDiary,
      contato: renderContact
    };

    (renderers[page] || renderHome)();
  }

  renderFooter();
}

document.addEventListener("DOMContentLoaded", start);
