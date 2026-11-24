
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

const collections = {
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
  });

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

/* CABEÇALHO E RODAPÉ */

function heading(title, description) {
  return `
    <section class="page-heading">
      <div class="container">
        <span class="eyebrow">Paola Pereira</span>
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(description)}</p>
      </div>
    </section>
  `;
}

function renderHeader() {
  $("#header").innerHTML = `
    <div class="container navbar">
      <a class="logo" href="index.html">
        <img src="./imagem/Logo-pp.png" alt="Logo PP Studio">
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
  $("#footer").innerHTML = `
    <div class="container">
      <p>© ${new Date().getFullYear()} ${escapeHTML(data.nome)}. Todos os direitos reservados.</p>
      <p>Feito com criatividade, tecnologia e propósito.</p>
    </div>
  `;
}

/* CARTÕES DE PROJETOS */

function projectCard(project) {
  const link = safeURL(project.link);

  return `
    <article class="card">
      ${project.imagem ? `
        <img src="${escapeHTML(project.imagem)}"
             alt="${escapeHTML(project.titulo)}"
             onerror="this.style.display='none'">
      ` : ""}

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

        <div>
          ${data.foto ? `
            <img class="hero-image" src="${escapeHTML(data.foto)}"
                 alt="Foto de ${escapeHTML(data.nome)}"
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

  $("#conteudo").innerHTML = `
    ${heading("Sobre mim", "Um pouco da minha história, formação e trajetória.")}

    <section class="section">
      <div class="container about-layout">
        ${data.foto ? `
          <img class="hero-image" src="${escapeHTML(data.foto)}"
               alt="Paola Pereira">
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
        ${data.servicos.map(item => `
          <article class="card">
            <h3>${escapeHTML(item.titulo)}</h3>
            <p>${escapeHTML(item.descricao)}</p>
          </article>
        `).join("")}
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
            ${item.imagem ? `
              <img src="${escapeHTML(item.imagem)}"
                   alt="Certificado ${escapeHTML(item.titulo)}">
            ` : ""}

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
            ${item.imagem ? `
              <img src="${escapeHTML(item.imagem)}"
                   alt="${escapeHTML(item.titulo)}">
            ` : ""}

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
            ${item.imagem ? `
              <img src="${escapeHTML(item.imagem)}"
                   alt="${escapeHTML(item.titulo)}">
            ` : ""}

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
  $("#conteudo").innerHTML = `
    ${heading("Vamos conversar?", "Entre em contato para projetos, parcerias e oportunidades.")}

    <section class="section">
      <div class="container">
        <form class="contact-form" id="contactForm">
          <label>Seu nome</label>
          <input name="nome" required placeholder="Digite seu nome">

          <label>Seu e-mail</label>
          <input name="email" type="email" required placeholder="seu@email.com">

          <label>Mensagem</label>
          <textarea name="mensagem" required placeholder="Escreva sua mensagem"></textarea>

          <button class="btn" type="submit">Enviar mensagem</button>
        </form>
      </div>
    </section>
  `;

  $("#contactForm").addEventListener("submit", event => {
    event.preventDefault();

    const form = new FormData(event.target);
    const message = `Olá, Paola! Sou ${form.get("nome")}.\n${form.get("mensagem")}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  });
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

        <label>Imagem</label>
        <input type="file" id="${type}Upload"
          accept="image/png,image/jpeg,image/webp">

        <input type="hidden" name="imagem" id="${type}Imagem">

        <div id="${type}Preview"></div>

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
               style="width:100%;max-width:180px;border-radius:10px">
        ` : ""}

        <h3>${escapeHTML(item.titulo || "Sem título")}</h3>
        <p>${escapeHTML(item.instituicao || item.categoria || item.data || "")}</p>

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

/* PAINEL ADMINISTRATIVO COMPLETO */

function renderAdmin() {
  Object.keys(collections).forEach(type => {
    if (!Array.isArray(data[type])) data[type] = [];
  });

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
                     style="width:130px;border-radius:12px">
              ` : ""}
            </div>

            <button class="btn" type="submit">Salvar perfil</button>
          </form>
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
        <img src="${escapeHTML(url)}" alt="Prévia da foto"
             style="width:130px;border-radius:12px">
      `;

      alert("Foto enviada! Agora clique em Salvar perfil.");
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

    if (await saveData()) {
      alert("Perfil salvo na nuvem!");
    }
  });

  /* CADASTRO, EDIÇÃO E IMAGENS DAS SEÇÕES */

  Object.entries(collections).forEach(([type, config]) => {
    const formElement = document.getElementById(type + "Form");

    document.getElementById(type + "Upload")
      .addEventListener("change", async event => {
        const file = event.target.files[0];
        if (!file) return;

        const url = await uploadImage(file);

        if (url) {
          document.getElementById(type + "Imagem").value = url;

          document.getElementById(type + "Preview").innerHTML = `
            <img src="${escapeHTML(url)}" alt="Prévia da imagem"
                 style="width:150px;border-radius:10px">
          `;

          alert("Imagem enviada! Agora salve o conteúdo.");
        }
      });

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

      item.imagem = form.get("imagem") || "";

      if (itemId) {
        const index = data[type].findIndex(entry => entry.id === itemId);

        if (index !== -1) {
          item.id = itemId;
          data[type][index] = item;
        }
      } else {
        item.id = crypto.randomUUID();
        data[type].push(item);
      }

      if (await saveData()) {
        formElement.reset();
        document.getElementById(type + "Imagem").value = "";
        document.getElementById(type + "Preview").innerHTML = "";

        renderAdminCollections();
        alert("Conteúdo salvo na nuvem!");
      }
    });

    document.querySelector(`[data-cancel="${type}"]`)
      .addEventListener("click", () => {
        formElement.reset();
        document.getElementById(type + "Imagem").value = "";
        document.getElementById(type + "Preview").innerHTML = "";
      });
  });

  /* BOTÕES DE EDITAR, EXCLUIR E REORDENAR */

  $("#conteudo").addEventListener("click", async event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    const moveButton = event.target.closest("[data-move]");

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

      document.getElementById(type + "Preview").innerHTML =
        item.imagem
          ? `<img src="${escapeHTML(item.imagem)}"
                 alt="Imagem atual"
                 style="width:150px;border-radius:10px">`
          : "";

      form.scrollIntoView({ behavior: "smooth" });
    }

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
    }

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
