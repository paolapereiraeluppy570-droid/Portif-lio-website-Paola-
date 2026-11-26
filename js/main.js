
const $ = selector => document.querySelector(selector);

const page = document.body.dataset.page || "inicio";

const pages = [
  ["Início", "index.html", "inicio"],
  ["Sobre mim", "sobre.html", "sobre"],
  ["Serviços", "servicos.html", "servicos"],
  ["Projetos", "projetos.html", "projetos"],
  ["Certificados", "certificados.html", "certificados"],
  ["Experiência", "experiencias.html", "experiencias"],
  ["Eventos", "eventos.html", "eventos"],
  ["Diário", "diario.html", "diario"],
  ["Contato", "contato.html", "contato"]
];

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
    experiencias: {
    title: "Experiências Profissionais",
    fields: [
      ["cargo", "Cargo"],
      ["empresa", "Empresa"],
      ["inicio", "Data de início"],
      ["fim", "Data de término"],
      ["atual", "Trabalho atualmente neste local", "checkbox"],
      ["descricao", "Descrição das atividades", "textarea"]
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

/* =====================================================
   FUNÇÕES GERAIS
===================================================== */

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

function newId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function normalizeImages(item) {
  let images = [];

  if (Array.isArray(item.imagens)) {
    images = item.imagens.map(image => {
      if (typeof image === "string") {
        return { url: image, posicao: "50% 50%" };
      }

      return {
        url: image.url || "",
        posicao: image.posicao || "50% 50%"
      };
    }).filter(image => image.url);
  }

  if (!images.length && item.imagem) {
    images = [{
      url: item.imagem,
      posicao: item.imagemPosicao || "50% 50%"
    }];
  }

  return images;
}

function completeData(source) {
  const result = { ...portfolioData, ...source };

      [
    "projetos",
    "certificados",
    "experiencias",
    "eventos",
    "diario",
    "servicos"
  ].forEach(key => {
    if (!Array.isArray(result[key])) result[key] = [];

    result[key] = result[key].map((item, index) => {
      const images = normalizeImages(item);

      return {
        ...item,
        id: item.id || `inicial-${key}-${index}`,
        imagens: images,
        imagem: images[0]?.url || item.imagem || "",
        imagemModo: item.imagemModo || "contain",
        imagemAltura: Number(item.imagemAltura) || 320
      };
    });
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
  result.fotoPosicao = result.fotoPosicao || "50% 50%";

  return result;
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

let data = completeData(getLocalData());

/* =====================================================
   SUPABASE
===================================================== */

async function loadPortfolioData() {
  try {
    const { data: result, error } = await supabaseClient
      .from("conteudo_site")
      .select("conteudo")
      .eq("secao", "portfolio")
      .maybeSingle();

    if (error) throw error;

    if (result && result.conteudo) {
      const savedContent = typeof result.conteudo === "string"
        ? JSON.parse(result.conteudo)
        : result.conteudo;

      data = completeData(savedContent);
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

/* =====================================================
   NAVEGAÇÃO E TÍTULOS
===================================================== */

function backButton(destination = "index.html") {
  return `
    <button class="back-button" type="button"
      onclick="if (history.length > 1) { history.back(); } else { location.href='${destination}'; }">
      ← Voltar
    </button>
  `;
}

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

/* =====================================================
   ÍCONES SOCIAIS
===================================================== */

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

/* =====================================================
   CABEÇALHO E RODAPÉ
===================================================== */

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

/* =====================================================
   IMAGENS E GALERIAS
===================================================== */

function getImages(item) {
  return normalizeImages(item);
}

function contentGallery(item, alt = "") {
  const images = getImages(item);

  if (!images.length) return "";

  return `
    <div class="pp-gallery"
      style="
        display:flex;
        gap:12px;
        overflow-x:auto;
        scroll-snap-type:x mandatory;
        padding-bottom:8px;
        margin-bottom:15px;
        -webkit-overflow-scrolling:touch;
      ">
      ${images.map((image, index) => `
        <div style="
          flex:0 0 100%;
          min-width:0;
          scroll-snap-align:start;
        ">
          <img
            src="${escapeHTML(image.url)}"
            alt="${escapeHTML(alt || item.titulo || "Imagem do portfólio")} ${index + 1}"
            style="
              width:100%;
              height:${Math.min(900, Math.max(100, Number(item.imagemAltura) || 320))}px;
              object-fit:${item.imagemModo === "cover" ? "cover" : "contain"};
              object-position:${escapeHTML(image.posicao || "50% 50%")};
              background:#101010;
              border-radius:10px;
              display:block;
            "
            onerror="this.style.display='none'">
        </div>
      `).join("")}
    </div>

    ${images.length > 1 ? `
      <p style="font-size:12px;opacity:.7;margin-top:-5px">
        Deslize para o lado para ver as ${images.length} fotos
      </p>
    ` : ""}
  `;
}

function projectCard(project) {
  const link = safeURL(project.link);

  return `
    <article class="card">
      ${contentGallery(project, project.titulo)}
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

/* =====================================================
   PÁGINA INICIAL
===================================================== */

function renderHome() {
  const largura = Math.min(100, Math.max(30, Number(data.fotoLargura) || 100));
  const altura = Math.min(900, Math.max(100, Number(data.fotoAltura) || 440));
  const modo = data.fotoModo === "cover" ? "cover" : "contain";

  $("#conteudo").innerHTML = `
    <section class="hero">
      <div class="container hero-content">

        <div class="hero-copy">

          <div class="hero-top">
            <div class="hero-heading">
              <span class="eyebrow">${escapeHTML(data.profissao)}</span>
              <h1>Olá, eu sou ${escapeHTML(data.nome)}.</h1>
            </div>

            <div class="hero-photo">
              ${data.foto ? `
                <img class="hero-image"
                  src="${escapeHTML(data.foto)}"
                  alt="Foto de ${escapeHTML(data.nome)}"
                  style="
                    width:${largura}%;
                    height:${altura}px;
                    max-height:none;
                    object-fit:${modo};
                    object-position:${escapeHTML(data.fotoPosicao)};
                  "
                  onerror="this.style.display='none'">
              ` : ""}
            </div>
          </div>

          <div class="hero-description">
            <p>${escapeHTML(data.apresentacao)}</p>

            <a href="projetos.html" class="btn">
              Conheça meus projetos
            </a>

            <a href="sobre.html" class="btn btn-secondary">
              Sobre mim
            </a>
          </div>

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

        <a href="projetos.html" class="btn">
          Ver todos os projetos
        </a>
      </div>
    </section>
  `;
}

/* =====================================================
   SOBRE MIM
===================================================== */

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
              object-position:${escapeHTML(data.fotoPosicao)};
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

/* =====================================================
   SERVIÇOS
===================================================== */

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

/* =====================================================
   PROJETOS
===================================================== */

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

/* =====================================================
   CERTIFICADOS
===================================================== */

function renderCertificates() {
  $("#conteudo").innerHTML = `
    ${heading("Certificados", "Formação contínua e novos conhecimentos.")}

    <section class="section">
      <div class="container grid">
        ${data.certificados.length ? data.certificados.map(item => `
          <article class="card">
            ${contentGallery(item, "Certificado " + item.titulo)}
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


/* =====================================================
   EXPERIÊNCIAS PROFISSIONAIS
===================================================== */

function renderExperiencias() {
  const experiencias = [...(data.experiencias || [])].reverse();

  $("#conteudo").innerHTML = `
    ${heading(
      "Experiências Profissionais",
      "Minha trajetória, aprendizados e experiências no mercado de trabalho."
    )}

    <section class="section">
      <div class="container">

        ${experiencias.length ? `
          <div class="grid">
            ${experiencias.map(item => `
              <article class="card">
                <h3>${escapeHTML(item.cargo)}</h3>

                <p><strong>${escapeHTML(item.empresa)}</strong></p>

                <p>
                  ${escapeHTML(item.inicio || "")}
                  —
                  ${item.atual ? "Atualmente" : escapeHTML(item.fim || "")}
                </p>

                <p>${escapeHTML(item.descricao || "")}</p>
              </article>
            `).join("")}
          </div>
        ` : `
          <p>Minhas experiências profissionais serão adicionadas em breve.</p>
        `}

      </div>
    </section>
  `;
}


/* =====================================================
   EVENTOS
===================================================== */

function renderEvents() {
  $("#conteudo").innerHTML = `
    ${heading("Eventos e experiências", "Momentos, participações e experiências importantes na minha trajetória.")}

    <section class="section">
      <div class="container grid">
        ${data.eventos.length ? data.eventos.map(item => `
          <article class="card">
            ${contentGallery(item, item.titulo)}
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

/* =====================================================
   DIÁRIO
===================================================== */

function renderDiary() {
  $("#conteudo").innerHTML = `
    ${heading("Notas de percurso", "Aprendizados, ideias e registros de uma trajetória em construção.")}

    <section class="section">
      <div class="container">
        ${data.diario.map(item => `
          <article class="card" style="margin-bottom:20px">
            ${contentGallery(item, item.titulo)}
            <span class="eyebrow">${escapeHTML(item.data || "")}</span>
            <h3>${escapeHTML(item.titulo)}</h3>
            <p>${escapeHTML(item.texto)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

/* =====================================================
   CONTATO
===================================================== */

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
          ` : "<p>O contato principal será adicionado em breve.</p>"}
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

/* =====================================================
   UPLOAD DE IMAGENS
===================================================== */

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
  const fileName = `${Date.now()}-${newId()}.${extension}`;

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

/* =====================================================
   PRÉVIA E AJUSTE MANUAL DAS FOTOS
===================================================== */

function renderImagePreviews(container, images, mode = "contain") {
  if (!container) return;

  container.innerHTML = images.map((image, index) => `
    <div class="pp-image-edit"
      data-image-index="${index}"
      style="
        display:inline-flex;
        flex-direction:column;
        vertical-align:top;
        width:180px;
        margin:8px;
        gap:7px;
      ">
      <div class="pp-image-frame"
        style="
          position:relative;
          width:180px;
          height:180px;
          overflow:hidden;
          background:#171717;
          border:1px solid #555;
          border-radius:10px;
          touch-action:none;
          cursor:grab;
        ">
        <img
          src="${escapeHTML(image.url)}"
          data-position="${escapeHTML(image.posicao || "50% 50%")}"
          style="
            width:100%;
            height:100%;
            object-fit:${mode === "cover" ? "cover" : "contain"};
            object-position:${escapeHTML(image.posicao || "50% 50%")};
            pointer-events:none;
          ">
      </div>

      <small>Arraste a foto para ajustar</small>

      <button type="button"
        class="btn btn-secondary"
        data-remove-image="${index}">
        Excluir esta foto
      </button>
    </div>
  `).join("");
}

function attachImageDragging(container, images, onChange) {
  if (!container) return;

  container.querySelectorAll(".pp-image-frame").forEach(frame => {
    const image = frame.querySelector("img");
    const wrapper = frame.closest("[data-image-index]");
    const index = Number(wrapper.dataset.imageIndex);

    let startX = 0;
    let startY = 0;
    let originX = 50;
    let originY = 50;
    let dragging = false;

    const current = String(images[index]?.posicao || "50% 50%")
      .split(" ")
      .map(value => Number(value.replace("%", "")));

    originX = current[0] || 50;
    originY = current[1] || 50;

    frame.addEventListener("pointerdown", event => {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      frame.setPointerCapture(event.pointerId);
      frame.style.cursor = "grabbing";
    });

    frame.addEventListener("pointermove", event => {
      if (!dragging) return;

      const rect = frame.getBoundingClientRect();

      const deltaX = (event.clientX - startX) / rect.width * 100;
      const deltaY = (event.clientY - startY) / rect.height * 100;

      const x = Math.max(0, Math.min(100, originX - deltaX));
      const y = Math.max(0, Math.min(100, originY - deltaY));

      const position = `${x}% ${y}%`;

      image.style.objectPosition = position;
      image.dataset.position = position;

      images[index].posicao = position;
      onChange();
    });

    const stopDragging = () => {
      if (!dragging) return;

      dragging = false;
      frame.style.cursor = "grab";

      const values = image.dataset.position.split(" ");
      originX = Number(values[0].replace("%", "")) || 50;
      originY = Number(values[1].replace("%", "")) || 50;
    };

    frame.addEventListener("pointerup", stopDragging);
    frame.addEventListener("pointercancel", stopDragging);
  });

  container.querySelectorAll("[data-remove-image]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeImage);

      if (!confirm("Deseja remover somente esta foto?")) return;

      images.splice(index, 1);
      onChange();
      renderImagePreviews(container, images);
      attachImageDragging(container, images, onChange);
    });
  });
}

/* =====================================================
   LOGIN ADMINISTRATIVO
===================================================== */

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

/* =====================================================
   FORMULÁRIOS DAS SEÇÕES
===================================================== */

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
          <label>Adicionar fotos</label>
          <input type="file" id="${type}Upload"
            accept="image/png,image/jpeg,image/webp"
            multiple>

          <input type="hidden" name="imagensJson" value="[]">

          <div id="${type}Preview"></div>

          <label>Como as fotos devem aparecer?</label>
          <select name="imagemModo">
            <option value="contain">Mostrar foto inteira, sem cortar</option>
            <option value="cover">Preencher o espaço, permitindo corte</option>
          </select>

          <label>Altura da galeria em pixels</label>
          <input name="imagemAltura" type="number"
            min="100" max="900" value="320">

          <p>Você pode selecionar várias fotos. Para ajustar uma foto, arraste-a na prévia. Para remover uma, clique em "Excluir esta foto".</p>
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

/* =====================================================
   LISTAGEM NO PAINEL
===================================================== */

function renderAdminCollections() {
  Object.entries(collections).forEach(([type]) => {
    const container = document.getElementById(type + "Lista");
    if (!container) return;

    const items = data[type] || [];

    container.innerHTML = items.map((item, index) => `
      <article class="card" style="margin:15px 0;padding:15px">
        ${contentGallery(item, item.titulo)}

        <h3>${escapeHTML(item.titulo || "Sem título")}</h3>
        <p>${escapeHTML(item.instituicao || item.categoria || item.data || item.descricao || "")}</p>

        <div class="admin-actions">
          <button class="btn" type="button"
            data-edit="${type}" data-id="${escapeHTML(item.id)}">Editar</button>

          <button class="btn btn-secondary" type="button"
            data-delete="${type}" data-id="${escapeHTML(item.id)}">Excluir</button>

          ${type === "projetos" ? `
            <button class="btn btn-secondary" type="button"
              data-move="up" data-id="${escapeHTML(item.id)}">↑</button>

            <button class="btn btn-secondary" type="button"
              data-move="down" data-id="${escapeHTML(item.id)}">↓</button>
          ` : ""}
        </div>
      </article>
    `).join("") || "<p>Nenhum conteúdo cadastrado ainda.</p>";
  });
}

/* =====================================================
   CONTATOS NO PAINEL
===================================================== */

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

      ${item.principal ? "<p><strong>Contato principal</strong></p>" : ""}

      <div class="admin-actions">
        <button class="btn" type="button"
          data-contact-edit="${escapeHTML(item.id)}">Editar</button>

        <button class="btn btn-secondary" type="button"
          data-contact-delete="${escapeHTML(item.id)}">Excluir</button>
      </div>
    </article>
  `).join("") || "<p>Nenhuma rede cadastrada ainda.</p>";
}

/* =====================================================
   PAINEL ADMINISTRATIVO
===================================================== */

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
          <button class="btn btn-secondary" id="logoutButton">Sair do painel</button>
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

            <input name="fotoPosicao" id="fotoPosicao" type="hidden"
              value="${escapeHTML(data.fotoPosicao)}">

            <div id="fotoPreview">
              ${data.foto ? `
                <div class="pp-image-frame"
                  style="
                    width:100%;
                    max-width:320px;
                    height:300px;
                    overflow:hidden;
                    background:#171717;
                    border-radius:12px;
                    touch-action:none;
                    cursor:grab;
                  ">
                  <img src="${escapeHTML(data.foto)}"
                    data-position="${escapeHTML(data.fotoPosicao)}"
                    style="
                      width:100%;
                      height:100%;
                      object-fit:${data.fotoModo};
                      object-position:${escapeHTML(data.fotoPosicao)};
                      pointer-events:none;
                    ">
                </div>
                <small>Arraste a foto para ajustar o enquadramento.</small>
              ` : ""}
            </div>

            <label>Largura da foto (%)</label>
            <input name="fotoLargura" type="number"
              min="30" max="100" value="${data.fotoLargura}">

            <label>Altura da foto (pixels)</label>
            <input name="fotoAltura" type="number"
              min="100" max="900" value="${data.fotoAltura}">

            <label>Enquadramento da foto</label>
            <select name="fotoModo">
              <option value="contain" ${data.fotoModo === "contain" ? "selected" : ""}>
                Mostrar foto inteira
              </option>
              <option value="cover" ${data.fotoModo === "cover" ? "selected" : ""}>
                Preencher espaço
              </option>
            </select>

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

            <button class="btn" type="submit">Salvar contato</button>

            <button class="btn btn-secondary" type="button"
              id="cancelarContato">Cancelar edição</button>
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
  
  /* ORGANIZAR AS ÁREAS DO PAINEL */

  const adminContainer = $("#conteudo .container");
  const adminPanels = Array.from(
    adminContainer.querySelectorAll(":scope > .admin-panel")
  );

  const adminGroups = [
    {
      title: "Conta e perfil",
      panels: [
        "Minha conta",
        "Perfil e apresentação",
        "Logo do PP Studio",
        "Redes sociais e contatos"
      ]
    },
    {
      title: "Portfólio",
      panels: ["Serviços", "Projetos"]
    },
    {
      title: "Carreira",
      panels: ["Certificados", "Experiências Profissionais"]
    },
    {
      title: "Atividades",
      panels: ["Eventos", "Diário"]
    },
    {
      title: "Backup",
      panels: ["Backup do portfólio"]
    }
  ];

  adminPanels.forEach(panel => panel.remove());

  adminGroups.forEach((group, index) => {
    const details = document.createElement("details");
    details.className = "admin-group";

    if (index === 0) details.open = true;

    const summary = document.createElement("summary");
    summary.textContent = group.title;

    details.appendChild(summary);

    group.panels.forEach(panelTitle => {
      const panel = adminPanels.find(item =>
        item.querySelector("h2")?.textContent.trim() === panelTitle
      );

      if (panel) details.appendChild(panel);
    });

    adminContainer.appendChild(details);
  });

  

  /* SAIR */

  $("#logoutButton").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("Não foi possível sair do painel.");
      return;
    }

    renderAdminLogin("Você saiu do painel.");
  });

  /* AJUSTE MANUAL DA FOTO DO PERFIL */

  function attachProfileDragging() {
    const frame = $("#fotoPreview .pp-image-frame");
    if (!frame) return;

    const image = frame.querySelector("img");
    let startX = 0;
    let startY = 0;
    let originX = 50;
    let originY = 50;
    let dragging = false;

    const values = String(data.fotoPosicao || "50% 50%")
      .split(" ")
      .map(value => Number(value.replace("%", "")));

    originX = values[0] || 50;
    originY = values[1] || 50;

    frame.addEventListener("pointerdown", event => {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      frame.setPointerCapture(event.pointerId);
    });

    frame.addEventListener("pointermove", event => {
      if (!dragging) return;

      const rect = frame.getBoundingClientRect();
      const x = Math.max(0, Math.min(100,
        originX - ((event.clientX - startX) / rect.width * 100)
      ));
      const y = Math.max(0, Math.min(100,
        originY - ((event.clientY - startY) / rect.height * 100)
      ));

      const position = `${x}% ${y}%`;

      image.style.objectPosition = position;
      image.dataset.position = position;
      $("#fotoPosicao").value = position;
    });

    const stop = () => {
      if (!dragging) return;
      dragging = false;

      const values = image.dataset.position.split(" ");
      originX = Number(values[0].replace("%", "")) || 50;
      originY = Number(values[1].replace("%", "")) || 50;
    };

    frame.addEventListener("pointerup", stop);
    frame.addEventListener("pointercancel", stop);
  }

  attachProfileDragging();

  $("#fotoUpload").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    const url = await uploadImage(file);

    if (url) {
      $("#fotoCaminho").value = url;
      $("#fotoPosicao").value = "50% 50%";

      $("#fotoPreview").innerHTML = `
        <div class="pp-image-frame"
          style="
            width:100%;
            max-width:320px;
            height:300px;
            overflow:hidden;
            background:#171717;
            border-radius:12px;
            touch-action:none;
            cursor:grab;
          ">
          <img src="${escapeHTML(url)}"
            data-position="50% 50%"
            style="
              width:100%;
              height:100%;
              object-fit:cover;
              object-position:50% 50%;
              pointer-events:none;
            ">
        </div>
        <small>Arraste a foto para ajustar o enquadramento.</small>
      `;

      attachProfileDragging();
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
    data.fotoPosicao = form.get("fotoPosicao") || "50% 50%";

    data.fotoLargura = Math.min(100, Math.max(30, Number(form.get("fotoLargura")) || 100));
    data.fotoAltura = Math.min(900, Math.max(100, Number(form.get("fotoAltura")) || 440));
    data.fotoModo = form.get("fotoModo") === "cover" ? "cover" : "contain";

    if (await saveData()) {
      alert("Perfil salvo na nuvem!");
    }
  });

  /* LOGO */

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

  /* CONTATOS */

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

    const previous = JSON.parse(JSON.stringify(data.contatos));

    if (principal) {
      data.contatos.forEach(item => item.principal = false);
    }

    if (contatoId) {
      const index = data.contatos.findIndex(item => item.id === contatoId);

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
        id: newId(),
        nome,
        url,
        principal: principal || data.contatos.length === 0
      });
    }

    if (await saveData()) {
      event.target.reset();
      event.target.elements.namedItem("contatoId").value = "";
      renderAdminContacts();
      renderFooter();
      alert("Contato salvo na nuvem!");
    } else {
      data.contatos = previous;
    }
  });

  $("#cancelarContato").addEventListener("click", () => {
    $("#contatosForm").reset();
    $("#contatosForm").elements.namedItem("contatoId").value = "";
  });

  /* FORMULÁRIOS DE CONTEÚDO */

  Object.entries(collections).forEach(([type, config]) => {
    const formElement = document.getElementById(type + "Form");

    let images = [];

    if (type !== "servicos") {
      const preview = document.getElementById(type + "Preview");
      const hiddenImages = formElement.elements.namedItem("imagensJson");

      const updateImages = () => {
        hiddenImages.value = JSON.stringify(images);
        renderImagePreviews(
          preview,
          images,
          formElement.elements.namedItem("imagemModo").value
        );
        attachImageDragging(preview, images, updateImages);
      };

      document.getElementById(type + "Upload")
        .addEventListener("change", async event => {
          const files = Array.from(event.target.files || []);
          if (!files.length) return;

          for (const file of files) {
            const url = await uploadImage(file);

            if (url) {
              images.push({
                url,
                posicao: "50% 50%"
              });
            }
          }

          updateImages();
          event.target.value = "";
        });

      formElement.elements.namedItem("imagemModo")
        .addEventListener("change", updateImages);

      formElement.addEventListener("reset", () => {
        images = [];
        hiddenImages.value = "[]";
        preview.innerHTML = "";
      });
    }

    formElement.addEventListener("submit", async event => {
      event.preventDefault();

      const form = new FormData(formElement);
      const itemId = String(form.get("itemId") || "");
      const item = {};

      config.fields.forEach(([name, label, kind]) => {
        item[name] = kind === "checkbox"
          ? form.get(name) === "on"
          : form.get(name);
      });

      if (type !== "servicos") {
        try {
          images = JSON.parse(form.get("imagensJson") || "[]");
        } catch {
          images = [];
        }

        item.imagens = images;
        item.imagem = images[0]?.url || "";
        item.imagemPosicao = images[0]?.posicao || "50% 50%";
        item.imagemModo = form.get("imagemModo") === "cover" ? "cover" : "contain";
        item.imagemAltura = Math.min(900, Math.max(100, Number(form.get("imagemAltura")) || 320));
      }

      const previous = JSON.parse(JSON.stringify(data[type]));

      if (itemId) {
        const index = data[type].findIndex(entry => String(entry.id) === itemId);

        if (index === -1) {
          alert("Não encontrei o conteúdo original para editar. Atualize o painel e tente novamente.");
          return;
        }

        item.id = data[type][index].id;

        if (type === "servicos") {
          item.imagens = data[type][index].imagens || [];
          item.imagem = data[type][index].imagem || "";
        }

        data[type][index] = item;
      } else {
        item.id = newId();

        if (type === "servicos") {
          item.imagens = [];
          item.imagem = "";
        }

        data[type].push(item);
      }

      if (await saveData()) {
        formElement.reset();
        formElement.elements.namedItem("itemId").value = "";
        images = [];

        if (type !== "servicos") {
          formElement.elements.namedItem("imagensJson").value = "[]";
          document.getElementById(type + "Preview").innerHTML = "";
        }

        renderAdminCollections();
        alert(`${config.title} salvo na nuvem!`);
      } else {
        data[type] = previous;
      }
    });

    document.querySelector(`[data-cancel="${type}"]`)
      .addEventListener("click", () => {
        formElement.reset();
        formElement.elements.namedItem("itemId").value = "";
        images = [];

        if (type !== "servicos") {
          formElement.elements.namedItem("imagensJson").value = "[]";
          document.getElementById(type + "Preview").innerHTML = "";
        }
      });

    /* Guardar a galeria atual para carregar ao editar */
    formElement._setImages = newImages => {
      images = newImages;
      if (type !== "servicos") {
        formElement.elements.namedItem("imagensJson").value =
          JSON.stringify(images);

        const preview = document.getElementById(type + "Preview");

        renderImagePreviews(
          preview,
          images,
          formElement.elements.namedItem("imagemModo").value
        );

        attachImageDragging(preview, images, () => {
          formElement.elements.namedItem("imagensJson").value =
            JSON.stringify(images);
        });
      }
    };
  });

  /* ===================================================
     EDITAR, EXCLUIR E REORDENAR
  =================================================== */

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

      const previous = JSON.parse(JSON.stringify(data.contatos));
      data.contatos.splice(index, 1);

      if (await saveData()) {
        renderAdminContacts();
        renderFooter();
        alert("Contato excluído!");
      } else {
        data.contatos = previous;
      }

      return;
    }

    /* EDITAR ITEM */

    if (editButton) {
      const type = editButton.dataset.edit;
      const id = editButton.dataset.id;
      const item = data[type].find(entry => String(entry.id) === String(id));

      if (!item) {
        alert("Não encontrei esse conteúdo. Atualize o painel e tente novamente.");
        return;
      }

      const form = document.getElementById(type + "Form");

      form.reset();

      /* CORREÇÃO PRINCIPAL: preencher o ID do item original */
      form.elements.namedItem("itemId").value = String(item.id);

      Object.entries(item).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (!field || key === "id") return;

        if (field.type === "checkbox") {
          field.checked = Boolean(value);
        } else if (key !== "imagens") {
          field.value = value ?? "";
        }
      });

      if (type !== "servicos") {
        form.elements.namedItem("imagemModo").value = item.imagemModo || "contain";
        form.elements.namedItem("imagemAltura").value = item.imagemAltura || 320;

        form._setImages(getImages(item));
      }

      form.scrollIntoView({ behavior: "smooth" });
      return;
    }

    /* EXCLUIR ITEM */

    if (deleteButton) {
      const type = deleteButton.dataset.delete;
      const id = deleteButton.dataset.id;
      const index = data[type].findIndex(item => String(item.id) === String(id));

      if (index === -1) return;
      if (!confirm("Deseja excluir este conteúdo?")) return;

      const previous = JSON.parse(JSON.stringify(data[type]));
      data[type].splice(index, 1);

      if (await saveData()) {
        renderAdminCollections();
        alert("Conteúdo excluído!");
      } else {
        data[type] = previous;
      }

      return;
    }

    /* REORDENAR PROJETOS */

    if (moveButton) {
      const id = moveButton.dataset.id;
      const index = data.projetos.findIndex(item => String(item.id) === String(id));
      const direction = moveButton.dataset.move;

      const newIndex = direction === "up"
        ? index - 1
        : index + 1;

      if (index < 0 || newIndex < 0 || newIndex >= data.projetos.length) return;

      const previous = JSON.parse(JSON.stringify(data.projetos));

      [data.projetos[index], data.projetos[newIndex]] =
        [data.projetos[newIndex], data.projetos[index]];

      if (await saveData()) {
        renderAdminCollections();
      } else {
        data.projetos = previous;
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

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

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
      experiencias: renderExperiencias,
      eventos: renderEvents,
      diario: renderDiary,
      contato: renderContact
    };

    (renderers[page] || renderHome)();
  }

  renderFooter();
}

document.addEventListener("DOMContentLoaded", start);
