(() => {
  const lista = document.querySelector(".lista-certificados");
  if (!lista) return;
  const tarjetas = [...lista.querySelectorAll(".certificado")];
  if (!tarjetas.length) return;
  const movimientoReducido = matchMedia("(prefers-reduced-motion: reduce)");
  const carrusel = document.createElement("div");
  carrusel.className = "carrusel-certificados";
  lista.before(carrusel);
  carrusel.append(lista);
  lista.id ||= "lista-certificados";
  lista.tabIndex = 0;
  lista.setAttribute("role", "region");
  lista.setAttribute(
    "aria-label",
    "Carrusel de certificados. Usa las flechas para desplazarte.",
  );

  function boton(texto, etiqueta) {
    const elemento = document.createElement("button");
    elemento.type = "button";
    elemento.className = "control-certificados";
    elemento.textContent = texto;
    elemento.setAttribute("aria-label", etiqueta);
    elemento.setAttribute("aria-controls", lista.id);
    return elemento;
  }
  const anterior = boton("‹", "Certificado anterior");
  const siguiente = boton("›", "Certificado siguiente");
  carrusel.prepend(anterior);
  carrusel.append(siguiente);
  const indicadores = document.createElement("div");
  indicadores.className = "indicadores-certificados";
  indicadores.setAttribute("role", "group");
  indicadores.setAttribute("aria-label", "Posiciones del carrusel");
  carrusel.after(indicadores);
  let destinos = [];
  let puntos = [];
  let cuadro = 0;

  function posicionActual() {
    return destinos.reduce(
      (mejor, destino, indice) =>
        Math.abs(destino - lista.scrollLeft) <
        Math.abs(destinos[mejor] - lista.scrollLeft)
          ? indice
          : mejor,
      0,
    );
  }
  function ir(indice) {
    lista.scrollTo({
      left: destinos[
        ((indice % destinos.length) + destinos.length) % destinos.length
      ],
      behavior: movimientoReducido.matches ? "instant" : "smooth",
    });
  }
  function actualizar() {
    const activo = posicionActual();
    anterior.disabled = siguiente.disabled = tarjetas.length <= 1;
    puntos.forEach((punto, indice) => {
      punto.classList.toggle("activo", indice === activo);
      if (indice === activo) punto.setAttribute("aria-current", "true");
      else punto.removeAttribute("aria-current");
    });
  }
  function medir() {
    const maximo = Math.max(0, lista.scrollWidth - lista.clientWidth);
    const inicio = tarjetas[0].offsetLeft;
    destinos = [
      ...new Set(
        tarjetas.map((tarjeta) =>
          Math.round(
            Math.min(maximo, Math.max(0, tarjeta.offsetLeft - inicio)),
          ),
        ),
      ),
    ];
    if (maximo > 2 && destinos.at(-1) !== maximo) destinos.push(maximo);
    indicadores.replaceChildren();
    puntos = destinos.map((destino, indice) => {
      const punto = boton(
        "",
        `Ir a la posición ${indice + 1} de ${destinos.length}`,
      );
      punto.className = "punto-certificados";
      punto.addEventListener("click", () => ir(indice));
      indicadores.append(punto);
      return punto;
    });
    const sinDesplazamiento = maximo <= 2;
    indicadores.hidden = sinDesplazamiento;
    actualizar();
  }
  function avanzar(direccion) {
    if (destinos.length > 1) {
      ir(posicionActual() + direccion);
      return;
    }
    if (tarjetas.length <= 1) return;
    if (direccion > 0) lista.append(lista.firstElementChild);
    else lista.prepend(lista.lastElementChild);
    tarjetas.splice(
      0,
      tarjetas.length,
      ...lista.querySelectorAll(".certificado"),
    );
    medir();
  }
  anterior.addEventListener("click", () => avanzar(-1));
  siguiente.addEventListener("click", () => avanzar(1));
  lista.addEventListener("keydown", (evento) => {
    if (evento.target !== lista) return;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
      evento.preventDefault();
      avanzar(evento.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    const indice = posicionActual();
    const teclas = {
      ArrowLeft: indice - 1,
      ArrowRight: indice + 1,
      Home: 0,
      End: destinos.length - 1,
    };
    if (!(evento.key in teclas)) return;
    evento.preventDefault();
    ir(teclas[evento.key]);
  });
  lista.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(actualizar);
    },
    { passive: true },
  );
  const observadorTamano = new ResizeObserver(medir);
  observadorTamano.observe(lista);
  tarjetas.forEach((tarjeta) => observadorTamano.observe(tarjeta));
  medir();
})();
