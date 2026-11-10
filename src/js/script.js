// =========================================
// CONEXÃO COM O SUPABASE (BANCO REATIVADO)
// =========================================
const SUPABASE_URL = "https://rirhllndepjbnflxfaob.supabase.co";
// 💡 Certifique-se de que a KEY abaixo é a chave "anon / public" atual do projeto rirhllndepjbnflxfaob
const SUPABASE_KEY = "sb_publishable_hjvxhcIJpj1XOOMxrbRQsQ_ujc53ExL"; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================================
// CONTAGEM REGRESSIVA
// =========================================
const dataCasamento = new Date("2026-12-19T00:00:00");
const inicioConteudo = document.querySelector(".inicio-conteudo");
if (inicioConteudo) {
  const contador = document.createElement("p");
  contador.classList.add("contador");
  inicioConteudo.appendChild(contador);

  function atualizarContagem() {
    const agora = new Date();
    const diferenca = dataCasamento - agora;
    if (diferenca <= 0) {
      contador.textContent = "O nosso grande dia chegou!";
      return;
    }
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    contador.textContent = `Faltam ${dias} dias para o nosso casamento!`;
  }
  atualizarContagem();
}

// =========================================
// CONFIRMAÇÃO DE PRESENÇA
// =========================================
const formulario = document.getElementById("form-presenca");
const mensagemForm = document.getElementById("mensagem-form");

if (formulario && mensagemForm) {
  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    
    // Captura o select exatamente pelo ID "confirmacao" definido no seu HTML
    const campoSelect = document.getElementById("confirmacao");
    const presenca = campoSelect ? campoSelect.value : "";

    // Validação dos campos no JavaScript
    if (!nome || !telefone || !presenca) {
      mensagemForm.textContent = "Por favor, preencha todos os campos.";
      return;
    }

    mensagemForm.textContent = "Gravando sua confirmação...";

    try {
      // 1. SALVA NO BANCO DE DADOS DO SUPABASE
      const { error } = await supabaseClient.from("convidados").insert([
        { nome: nome, telefone: telefone, presenca: presenca }
      ]);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        mensagemForm.textContent = "Não foi possível registrar sua presença. Tente novamente.";
        return;
      }

      // 2. FORMATA A MENSAGEM QUE O CONVIDADO VAI TE ENVIAR
      let mensagem;
      if (presenca === "Sim") {
        mensagem = `Olá, David e Luísa! ❤️ Estou confirmando minha presença no casamento de vocês! Estou super feliz e preparando tudo para esse dia tão especial. Nos vemos no dia 19 de dezembro de 2026! Com carinho, ${nome}.`;
      } else {
        mensagem = `Olá, David e Luísa! ❤️ Infelizmente não poderei comparecer ao casamento de vocês, mas agradeço imensamente o carinho e o convite. Desejamos toda a felicidade do mundo para essa nova fase! Com carinho, ${nome}.`;
      }

      const seuNumeroWhats = "5511966042173"; 
      const mensagemCodificada = encodeURIComponent(mensagem);

      mensagemForm.textContent = "Sua confirmação foi registrada! Abrindo o WhatsApp... ❤️";
      formulario.reset();

      // 3. ABRE O WHATSAPP DO CONVIDADO COM A MENSAGEM PRONTA
      window.open(`https://wa.me/${seuNumeroWhats}?text=${mensagemCodificada}`, "_blank");

    } catch (erro) {
      console.error("Erro na comunicação geral:", erro);
      mensagemForm.textContent = "Ocorreu um erro ao processar. Tente novamente.";
    }
  });
}

// =========================================
// LISTA DE CONVIDADOS (PAINEL ADMINISTRATIVO)
// =========================================
const botaoLista = document.getElementById("mostrar-lista");
const listaConvidados = document.getElementById("lista-convidados");

if (botaoLista && listaConvidados) {
  listaConvidados.style.display = "none";

  botaoLista.addEventListener("click", async function () {
    if (listaConvidados.style.display === "block") {
      listaConvidados.style.display = "none";
      botaoLista.textContent = "Mostrar convidados";
    } else {
      const senhaAdmin = "Dl@19042207"; 
      const senhaDigitada = prompt("Digite a senha de administrador para visualizar a lista:");

      if (senhaDigitada !== senhaAdmin) {
        alert("Senha incorreta!");
        return;
      }

      listaConvidados.style.display = "block";
      botaoLista.textContent = "Ocultar convidados";
      listaConvidados.innerHTML = "<p>Carregando lista de convidados...</p>";

      try {
        const { data, error } = await supabaseClient
          .from("convidados")
          .select("nome, telefone, presenca")
          .order("nome", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          listaConvidados.innerHTML = "<p>Nenhum convidado registrado ainda.</p>";
          return;
        }

        let htmlLista = `
          <div style="margin-top: 15px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; background: #fff; color: #333; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <thead>
                <tr style="background-color: #f4f4f4; font-weight: bold;">
                  <th style="padding: 12px 15px; border-bottom: 2px solid #ddd;">Nome</th>
                  <th style="padding: 12px 15px; border-bottom: 2px solid #ddd;">Telefone</th>
                  <th style="padding: 12px 15px; border-bottom: 2px solid #ddd;">Confirmou?</th>
                </tr>
              </thead>
              <tbody>
        `;

        data.forEach(item => {
          const corPresenca = item.presenca === "Sim" ? "green" : "red";
          htmlLista += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 15px;">${item.nome}</td>
              <td style="padding: 10px 15px;">${item.telefone}</td>
              <td style="padding: 10px 15px; color: ${corPresenca}; font-weight: bold;">${item.presenca}</td>
            </tr>
          `;
        });

        htmlLista += `
              </tbody>
            </table>
            <p style="margin-top: 10px; font-weight: bold; color: #fff;">Total de registros: ${data.length}</p>
          </div>
        `;

        listaConvidados.innerHTML = htmlLista;

      } catch (erro) {
        console.error("Erro ao carregar lista:", erro);
        listaConvidados.innerHTML = "<p>Erro ao carregar a lista. Certifique-se de que rodou os comandos de liberação de SELECT no banco.</p>";
      }
    }
  });
}
