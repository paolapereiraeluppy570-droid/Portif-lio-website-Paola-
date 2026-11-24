

const $ = (selector) => document.querySelector(selector);

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

let data = getLocalData();

async function loadPortfolioData() {
  try {
    const { data: result, error } = await supabaseClient
      .from("conteudo_site")
      .select("conteudo")
      .eq("secao", "portfolio")
      .maybeSingle();

    if (error) throw error;

    if (result && result.conteudo) {
      const remoteData = JSON.parse(result.conteudo);
      data = { ...portfolioData, ...remoteData };
    }

    localStorage.setItem("paolaPortfolio", JSON.stringify(data));
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    data = getLocalData();
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

function renderHeader() {
  $("#header").innerHTML = `
    <div class="container navbar">
      <a class="logo" href="index.html">
        <img src="./imagem/Logo-pp.png" alt="Logo PP Studio">
        <span>PP Studio | Paola Pereira</span>
      </a>
      <button class="menu-button" id="menuButton" aria-label="Abrir menu">☰</button>
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
      <p>© ${new Date().getFullYear()} ${data.nome}. Todos os direitos reservados.</p>
      <p>Feito com criatividade, tecnologia e propósito.</p>
    </div>
  `;
}

function heading(title, description) {
  return `
    <section class="page-heading">
      <div class="container">
        <span class="eyebrow">Paola Pereira</span>
        <h1>${title}</h1>
        <p>${description}</p>
      </div>
    </section>
  `;
}

function projectCard(project) {
  return `
    <article class="card">
      <img src="${project.imagem || "assets/images/placeholder.jpg"}"
           alt="${project.titulo}"
           onerror="this.style.display='none'">
      <span class="tag">${project.categoria || "Projeto"}</span>
      <h3>${project.titulo}</h3>
      <p>${project.descricao}</p>
      ${project.link ? `<a class="btn" href="${project.link}" target="_blank" rel="noopener">Ver projeto</a>` : ""}
    </article>
  `;
}

function renderHome() {
  $("#conteudo").innerHTML = `
    <section class="hero">
      <div class="container hero-content">
        <div>
          <span class="eyebrow">${data.profissao}</span>
          <h1>Olá, eu sou ${data.nome}.</h1>
          <p>${data.apresentacao}</p>
          <a href="projetos.html" class="btn">Conheça meus projetos</a>
          <a href="sobre.html" class="btn btn-secondary">Sobre mim</a>
        </div>
        <div>
          <img class="hero-image" src="${data.foto}"
               alt="Foto de ${data.nome}"
               onerror="this.outerHTML='<div class=placeholder-image>Adicione sua foto em assets/images/paola.jpg</div>'">
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
        <img class="hero-image" src="${data.foto}"
             alt="Paola Pereira"
             onerror="this.style.display='none'">
        <div>
          <span class="eyebrow">Prazer, sou a Paola</span>
          <h2>Tecnologia e criatividade caminham juntas.</h2>
          <p>${data.sobre}</p>
          <p><strong>Idade:</strong> ${age} anos</p>
          <p><strong>Formação:</strong> ${data.curso} — ${data.universidade}</p>
          <p><strong>Localização:</strong> ${data.cidade}</p>
        </div>
      </div>
    </section>
  `;
}

function renderServices() {
  $("#conteudo").innerHTML = `
    ${heading("Serviços", "Soluções criativas que conectam comunicação e tecnologia.")}
    <section class="section">
      <div class="container grid">
        ${data.servicos.map(item => `
          <article class="card">
            <h3>${item.titulo}</h3>
            <p>${item.descricao}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

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
    const filtered = data.projetos.filter(p =>
      `${p.titulo} ${p.categoria} ${p.descricao}`.toLowerCase().includes(query)
    );

    $("#projectGrid").innerHTML = filtered.map(projectCard).join("");
    $("#emptyProjects").hidden = filtered.length > 0;
  });
}

function renderCertificates() {
  $("#conteudo").innerHTML = `
    ${heading("Certificados", "Formação contínua e novos conhecimentos.")}
    <section class="section">
      <div class="container grid">
        ${data.certificados.length ? data.certificados.map(item => `
          <article class="card">
            <h3>${item.titulo}</h3>
            <p>${item.instituicao || ""}</p>
            <p>${item.ano || ""}</p>
          </article>
        `).join("") : "<p>Os certificados serão adicionados em breve.</p>"}
      </div>
    </section>
  `;
}

function renderEvents() {
  $("#conteudo").innerHTML = `
    ${heading("Eventos e experiências", "Momentos, participações e experiências importantes na minha trajetória.")}
    <section class="section">
      <div class="container grid">
        ${data.eventos.length ? data.eventos.map(item => `
          <article class="card">
            <h3>${item.titulo}</h3>
            <p>${item.data || ""}</p>
            <p>${item.descricao || ""}</p>
          </article>
        `).join("") : "<p>Novas experiências serão registradas aqui.</p>"}
      </div>
    </section>
  `;
}

function renderDiary() {
  $("#conteudo").innerHTML = `
    ${heading("Notas de percurso", "Aprendizados, ideias e registros de uma trajetória em construção.")}
    <section class="section">
      <div class="container">
        ${data.diario.map(item => `
          <article class="card" style="margin-bottom:20px">
            <span class="eyebrow">${item.data || ""}</span>
            <h3>${item.titulo}</h3>
            <p>${item.texto}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

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

function renderAdminLogin(message = "") {
  $("#conteudo").innerHTML = `
    ${heading("Acesso administrativo", "Entre para editar seu portfólio.")}
    <section class="section">
      <div class="container">
        <div class="admin-panel">
          <h2>Entrar</h2>
          <form id="loginForm" class="admin-form">
            <label>E-mail</label>
            <input name="email" type="email" required placeholder="Seu e-mail cadastrado">
            <label>Senha</label>
            <input name="password" type="password" required placeholder="Sua senha">
            <button class="btn" type="submit">Entrar no painel</button>
            <p id="loginMessage">${message}</p>
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

async function uploadImage(file) {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    alert("Selecione um arquivo de imagem.");
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
    alert("Erro ao enviar imagem: " + error.message);
    return null;
  }

  const { data } = supabaseClient.storage
    .from("imagens-portfolio")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

function renderAdmin() {
  $("#conteudo").innerHTML = `
    ${heading("Painel administrativo", "Área de edição do conteúdo do portfólio.")}
    <section class="section">
      <div class="container">
        <div class="notice">
          Suas alterações serão salvas na nuvem e poderão aparecer em todos os dispositivos.
        </div>

        <div class="admin-panel">
          <button class="btn btn-secondary" id="logoutButton">Sair do painel</button>
        </div>

        <div class="admin-panel">
          <h2>Informações pessoais</h2>
          <form id="adminForm" class="admin-form">
            <label>Nome</label>
            <input name="nome" value="${data.nome}">
            <label>Profissão</label>
            <input name="profissao" value="${data.profissao}">
            <label>Apresentação</label>
            <textarea name="apresentacao">${data.apresentacao}</textarea>
            <label>Sobre mim</label>
            <textarea name="sobre">${data.sobre}</textarea>
            <label>Foto pessoal</label>
<input type="file" id="fotoUpload" accept="image/png,image/jpeg,image/webp">
<input name="foto" id="fotoCaminho" value="${data.foto}" type="hidden">
            <button class="btn" type="submit">Salvar alterações</button>
          </form>
        </div>

        <div class="admin-panel">
          <h2>Adicionar projeto</h2>
          <form id="projectForm" class="admin-form">
            <label>Título</label>
            <input name="titulo" required>
            <label>Categoria</label>
            <input name="categoria">
            <label>Descrição</label>
            <textarea name="descricao" required></textarea>
            <label>Imagem (caminho)</label>
            <input name="imagem" placeholder="assets/images/meu-projeto.jpg">
            <label>Link do projeto</label>
            <input name="link" type="url">
            <label><input type="checkbox" name="destaque"> Mostrar na página inicial</label>
            <button class="btn" type="submit">Adicionar projeto</button>
          </form>
        </div>

        <div class="admin-panel">
          <h2>Gerenciar projetos</h2>
          <div id="adminProjects"></div>
        </div>

        <div class="admin-panel">
          <h2>Pré-visualização</h2>
          <a class="btn" href="index.html" target="_blank">Ver meu site</a>
          <button class="btn btn-secondary" id="exportData">Exportar conteúdo</button>
          <button class="btn btn-secondary" id="resetData">Restaurar dados iniciais</button>
        </div>
      </div>
    </section>
  `;

  $("#logoutButton").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("Não foi possível sair. Tente novamente.");
      return;
    }

    renderAdminLogin("Você saiu do painel.");
  });

  $("#adminForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.target);

    data.nome = form.get("nome");
    data.profissao = form.get("profissao");
    data.apresentacao = form.get("apresentacao");
    data.sobre = form.get("sobre");
    data.foto = form.get("foto");

    if (await saveData()) {
      alert("Informações salvas na nuvem!");
    }
  });

  $("#projectForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.target);

    data.projetos.push({
      titulo: form.get("titulo"),
      categoria: form.get("categoria"),
      descricao: form.get("descricao"),
      imagem: form.get("imagem"),
      link: form.get("link"),
      destaque: form.get("destaque") === "on"
    });

    if (await saveData()) {
      event.target.reset();
      showAdminProjects();
      alert("Projeto salvo na nuvem!");
    }
  });

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

  $("#resetData").addEventListener("click", async () => {
    if (!confirm("Deseja restaurar os dados iniciais?")) return;

    data = JSON.parse(JSON.stringify(portfolioData));

    if (await saveData()) {
      alert("Dados iniciais restaurados!");
      renderAdmin();
    }
  });

  showAdminProjects();
}

function showAdminProjects() {
  const container = $("#adminProjects");

  container.innerHTML = data.projetos.map((project, index) => `
    <div class="card" style="margin-bottom:12px">
      <h3>${project.titulo}</h3>
      <p>${project.categoria || ""}</p>
      <div class="admin-actions">
        <button class="btn" data-action="up" data-index="${index}">↑</button>
        <button class="btn" data-action="down" data-index="${index}">↓</button>
        <button class="btn btn-secondary" data-action="delete" data-index="${index}">Excluir</button>
      </div>
    </div>
  `).join("");

  container.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.index);
      const action = button.dataset.action;

      if (action === "delete") {
        if (!confirm("Excluir este projeto?")) return;
        data.projetos.splice(index, 1);
      }

      if (action === "up" && index > 0) {
        [data.projetos[index - 1], data.projetos[index]] =
          [data.projetos[index], data.projetos[index - 1]];
      }

      if (action === "down" && index < data.projetos.length - 1) {
        [data.projetos[index + 1], data.projetos[index]] =
          [data.projetos[index], data.projetos[index + 1]];
      }

      if (await saveData()) {
        showAdminProjects();
      }
    });
  });
}

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
