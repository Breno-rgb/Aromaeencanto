(function () {
  var WA = "5511951429371";
  var CHAVE = "aroma-pedido-v2";
  var pedido = {};
  var itens = Array.prototype.slice.call(document.querySelectorAll(".item"));

  function brl(v) { return "R$ " + v.toFixed(2).replace(".", ","); }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(pedido)); } catch (e) {} }
  function carregar() {
    try {
      var b = localStorage.getItem(CHAVE);
      if (b) { var o = JSON.parse(b); if (o && typeof o === "object") pedido = o; }
    } catch (e) { pedido = {}; }
  }

  function ler(el) {
    var sel = el.querySelector(".sel-opcao");
    var pr = el.getAttribute("data-preco");
    return {
      id: el.getAttribute("data-id"),
      nome: el.getAttribute("data-nome"),
      preco: pr === "" ? null : parseFloat(pr),
      opcao: sel ? sel.value : null,
      rotulo: sel ? sel.getAttribute("data-rotulo") : null
    };
  }

  function sincronizar(el) {
    var id = el.getAttribute("data-id"), it = pedido[id];
    var add = el.querySelector(".add"), cont = el.querySelector(".escolha");
    var q = el.querySelector(".qtd");
    if (it && it.qtd > 0) {
      el.classList.add("escolhido"); add.hidden = true; cont.hidden = false;
      q.textContent = it.qtd;
      var sel = el.querySelector(".sel-opcao");
      if (sel && it.opcao && sel.value !== it.opcao) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === it.opcao) { sel.selectedIndex = i; break; }
        }
      }
    } else {
      el.classList.remove("escolhido"); add.hidden = false; cont.hidden = true;
      q.textContent = "0";
    }
  }

  function totais() {
    var n = 0, s = 0, consulta = false;
    for (var id in pedido) {
      var it = pedido[id];
      if (!it || !it.qtd) continue;
      n += it.qtd;
      if (it.preco === null || isNaN(it.preco)) consulta = true; else s += it.preco * it.qtd;
    }
    return { n: n, soma: s, consulta: consulta };
  }

  function desenhar() {
    itens.forEach(sincronizar);
    var t = totais();
    document.getElementById("topo-qtd").textContent = t.n;

    var barra = document.getElementById("barra");
    if (t.n > 0) {
      barra.hidden = false;
      document.body.classList.add("com-barra");
      document.getElementById("barra-itens").textContent =
        t.n === 1 ? "1 peça escolhida" : t.n + " peças escolhidas";
      document.getElementById("barra-total").textContent =
        brl(t.soma) + (t.consulta ? " + a combinar" : "");
    } else {
      barra.hidden = true;
      document.body.classList.remove("com-barra");
    }

    var lista = document.getElementById("lista-pedido");
    lista.innerHTML = "";
    document.getElementById("pedido-vazio").hidden = t.n > 0;
    document.getElementById("pedido-cheio").hidden = t.n === 0;

    for (var id in pedido) {
      var it = pedido[id];
      if (!it || !it.qtd) continue;
      var li = document.createElement("li");

      var nome = document.createElement("span");
      nome.className = "li-nome";
      nome.textContent = it.qtd + " × " + it.nome;
      li.appendChild(nome);

      var val = document.createElement("span");
      val.className = "li-val";
      val.textContent = (it.preco === null || isNaN(it.preco)) ? "a combinar" : brl(it.preco * it.qtd);
      li.appendChild(val);

      if (it.opcao) {
        var det = document.createElement("span");
        det.className = "li-det";
        det.textContent = it.rotulo + ": " + it.opcao;
        li.appendChild(det);
      }

      var tirar = document.createElement("button");
      tirar.type = "button";
      tirar.className = "li-tirar";
      tirar.textContent = "Tirar do pedido";
      tirar.setAttribute("data-tirar", id);
      li.appendChild(tirar);

      lista.appendChild(li);
    }
    document.getElementById("total").textContent =
      brl(t.soma) + (t.consulta ? " + a combinar" : "");
    atualizarLink();
    salvar();
  }

  itens.forEach(function (el) {
    var id = el.getAttribute("data-id");
    el.querySelector(".add").addEventListener("click", function () {
      var d = ler(el); d.qtd = 1; pedido[id] = d; desenhar();
    });
    el.querySelector(".mais").addEventListener("click", function () {
      if (pedido[id]) { pedido[id].qtd++; desenhar(); }
    });
    el.querySelector(".menos").addEventListener("click", function () {
      if (!pedido[id]) return;
      pedido[id].qtd--;
      if (pedido[id].qtd <= 0) delete pedido[id];
      desenhar();
    });
    var sel = el.querySelector(".sel-opcao");
    if (sel) sel.addEventListener("change", function () {
      if (pedido[id]) { pedido[id].opcao = sel.value; desenhar(); }
    });
  });

  document.getElementById("lista-pedido").addEventListener("click", function (ev) {
    var a = ev.target.closest("[data-tirar]");
    if (!a) return;
    delete pedido[a.getAttribute("data-tirar")];
    desenhar();
  });

  function texto() {
    var L = ["Olá! Vim pelo site da Aroma & Encanto e quero fazer um pedido.", ""];
    var n = 0, t = totais();
    for (var id in pedido) {
      var it = pedido[id];
      if (!it || !it.qtd) continue;
      n++;
      L.push(n + ") " + it.nome);
      if (it.opcao) L.push("   " + it.rotulo + ": " + it.opcao);
      L.push("   Quantidade: " + it.qtd);
      L.push("   Valor: " + ((it.preco === null || isNaN(it.preco)) ? "a combinar" : brl(it.preco * it.qtd)));
      L.push("");
    }
    if (n > 0) {
      L.push("Total aproximado: " + brl(t.soma) + (t.consulta ? " (mais os itens a combinar)" : ""));
      L.push("");
    }
    var nome = document.getElementById("nome").value.trim();
    var bairro = document.getElementById("bairro").value.trim();
    var obs = document.getElementById("obs").value.trim();
    var ent = document.querySelector('input[name="entrega"]:checked');
    if (nome) L.push("Meu nome: " + nome);
    if (bairro) L.push("Bairro/cidade: " + bairro);
    if (ent) L.push("Entrega: " + ent.value);
    if (obs) { L.push(""); L.push("Sob medida: " + obs); }
    return L.join("\n");
  }

  var botao = document.getElementById("enviar");

  function atualizarLink() {
    botao.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto());
  }

  function temPedido() {
    return totais().n > 0 || document.getElementById("obs").value.trim() !== "";
  }

  function avisarVazio() {
    var av = document.querySelector(".aviso");
    av.textContent = "Escolha ao menos uma peça do catálogo, ou descreva o que você quer no campo acima.";
    av.style.color = "#A3844B";
    av.style.fontStyle = "normal";
    document.getElementById("catalogo").scrollIntoView({ block: "start" });
  }

  // o link é real: funciona em qualquer navegador, inclusive dentro de prévia em sandbox
  botao.addEventListener("click", function (ev) {
    if (!temPedido()) { ev.preventDefault(); avisarVazio(); return; }
    atualizarLink();
  });

  // Enter dentro do formulário não recarrega a página
  document.getElementById("form-pedido").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!temPedido()) { avisarVazio(); return; }
    atualizarLink();
    botao.click();
  });

  // nome, bairro, entrega e observação entram no link assim que são digitados
  ["nome", "bairro", "obs"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", atualizarLink);
  });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="entrega"]'), function (r) {
    r.addEventListener("change", atualizarLink);
  });

  document.getElementById("ano").textContent = new Date().getFullYear();
  carregar();
  desenhar();
})();

/* ---------- carrosséis ---------- */
(function () {
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-carrossel]"), function (sec) {
    var trilho = sec.querySelector(".trilho");
    var ant = sec.querySelector(".ant");
    var prox = sec.querySelector(".prox");
    var barra = sec.querySelector(".progresso span");
    if (!trilho) return;

    function passo() {
      var it = trilho.querySelector(".item");
      if (!it) return trilho.clientWidth;
      var gap = parseFloat(getComputedStyle(trilho).columnGap || getComputedStyle(trilho).gap) || 0;
      var larg = it.getBoundingClientRect().width + gap;
      var cabem = Math.max(1, Math.floor(trilho.clientWidth / larg));
      return larg * cabem;
    }

    function atualizar() {
      var max = trilho.scrollWidth - trilho.clientWidth;
      if (ant) ant.disabled = trilho.scrollLeft <= 2;
      if (prox) prox.disabled = trilho.scrollLeft >= max - 2;
      if (barra) {
        var vis = trilho.scrollWidth ? trilho.clientWidth / trilho.scrollWidth : 1;
        var pos = trilho.scrollWidth ? trilho.scrollLeft / trilho.scrollWidth : 0;
        barra.style.transform = "translateX(" + (pos * 100) + "%) scaleX(" + Math.min(1, vis) + ")";
      }
    }

    function mover(dir) {
      trilho.scrollBy({ left: dir * passo(), behavior: reduz ? "auto" : "smooth" });
    }
    if (ant) ant.addEventListener("click", function () { mover(-1); });
    if (prox) prox.addEventListener("click", function () { mover(1); });

    trilho.addEventListener("scroll", function () {
      if (trilho._t) cancelAnimationFrame(trilho._t);
      trilho._t = requestAnimationFrame(atualizar);
    }, { passive: true });

    trilho.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight") { ev.preventDefault(); mover(1); }
      if (ev.key === "ArrowLeft") { ev.preventDefault(); mover(-1); }
    });

    /* ----- arrastar com o mouse, com inércia ----- */
    var puxando = false, xIni = 0, scrollIni = 0, andou = 0;
    var vel = 0, xAnt = 0, tAnt = 0, giro = null;

    function naoArrastar(alvo) {
      return !!(alvo && alvo.closest && alvo.closest("select,input,textarea,button,a,label"));
    }

    trilho.addEventListener("pointerdown", function (ev) {
      if (ev.pointerType !== "mouse" || ev.button !== 0) return;
      if (naoArrastar(ev.target)) return;
      puxando = true; andou = 0; vel = 0;
      xIni = ev.clientX; scrollIni = trilho.scrollLeft;
      xAnt = ev.clientX; tAnt = ev.timeStamp;
      if (giro) { cancelAnimationFrame(giro); giro = null; }
      trilho.style.scrollSnapType = "none";
      trilho.style.scrollBehavior = "auto";
      trilho.classList.add("arrastando");
      try { trilho.setPointerCapture(ev.pointerId); } catch (e) {}
    });

    trilho.addEventListener("pointermove", function (ev) {
      if (!puxando) return;
      var dx = ev.clientX - xIni;
      if (Math.abs(dx) > andou) andou = Math.abs(dx);
      trilho.scrollLeft = scrollIni - dx;
      var dt = ev.timeStamp - tAnt;
      if (dt > 0) { vel = (ev.clientX - xAnt) / dt; xAnt = ev.clientX; tAnt = ev.timeStamp; }
      ev.preventDefault();
    });

    function assentar() {
      trilho.style.scrollBehavior = "";
      trilho.style.scrollSnapType = "";
      atualizar();
    }

    function soltar(ev) {
      if (!puxando) return;
      puxando = false;
      trilho.classList.remove("arrastando");
      if (ev && ev.pointerId != null) { try { trilho.releasePointerCapture(ev.pointerId); } catch (e) {} }
      if (reduz) { assentar(); return; }
      var v = vel * 16;                       // px por quadro
      if (Math.abs(v) > 60) v = 60 * (v < 0 ? -1 : 1);
      (function desliza() {
        if (Math.abs(v) < 0.5) { assentar(); giro = null; return; }
        var antes = trilho.scrollLeft;
        trilho.scrollLeft -= v;
        if (trilho.scrollLeft === antes) { assentar(); giro = null; return; }  // bateu na ponta
        v *= 0.93;
        giro = requestAnimationFrame(desliza);
      })();
    }

    trilho.addEventListener("pointerup", soltar);
    trilho.addEventListener("pointercancel", soltar);
    window.addEventListener("pointerup", soltar);
    trilho.addEventListener("dragstart", function (ev) { ev.preventDefault(); });

    // engole o clique que vem logo depois de um arraste de verdade
    trilho.addEventListener("click", function (ev) {
      if (andou > 6) { ev.preventDefault(); ev.stopPropagation(); }
      andou = 0;
    }, true);

    window.addEventListener("resize", atualizar, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(atualizar).observe(trilho);
    atualizar();
    setTimeout(atualizar, 400);
  });
})();

/* ---------- revelar ao rolar ---------- */
(function () {
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var alvos = document.querySelectorAll(".rev");
  if (reduz || !("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });

  Array.prototype.forEach.call(alvos, function (el) {
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
      el.classList.add("pre");
      io.observe(el);
    }
  });
})();
