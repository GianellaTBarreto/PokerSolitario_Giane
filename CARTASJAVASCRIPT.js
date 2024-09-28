let mazo = [];
let manoJugador = [];
let manoComputadora = [];
let pozoJugador = 100;
let pozoPC = 100;
let pozoTotal = 0;
let cambioHabilitado = false;
let cartasSeleccionadas = new Set();
const apuestaMaxima = 10;

document.getElementById('botonSee').style.display = 'none';
document.getElementById('botonRaise').style.display = 'none';
document.getElementById('botonFold').style.display = 'none';
document.getElementById('botonCambiar').style.display = 'none';

// Crear el mazo
function crearMazo() {
    const palos = ['♠', '♥', '♦', '♣'];
    const valores = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let mazo = [];

    for (let palo of palos) {
        for (let valor of valores) {
            mazo.push(valor + ' ' + palo);
        }
    }
    return mazo;
}

// Barajar el mazo
function barajarMazo(mazo) {
    return mazo.sort(() => Math.random() - 0.5);
}

// Iniciar el juego
function iniciarJuego() {
    mazo = barajarMazo(crearMazo());
    repartirCartas();
    document.getElementById('botonJugar').style.display = 'none'; // Ocultar botón de jugar
    document.getElementById('botonSee').style.display = 'flex';
    document.getElementById('botonRaise').style.display = 'flex';
    document.getElementById('botonFold').style.display = 'flex';
}

// Repartir las cartas iniciales
function repartirCartas() {
    manoJugador = [];
    manoComputadora = [];
    for (let i = 0; i < 5; i++) {
        manoJugador.push(mazo.pop());
        manoComputadora.push(mazo.pop());
    }
    mostrarCartasJugador();
    mostrarBotonesApuesta();
    habilitarApuestas();
    pozoTotal = 0;
    actualizarPozo();
}

// Mostrar las cartas del jugador
function mostrarCartasJugador() {
    const cartasDiv = document.getElementById('cartas-jugador');
    cartasDiv.innerHTML = '';

    manoJugador.forEach((carta, index) => {
        const cartaElemento = document.createElement('button');
        cartaElemento.textContent = carta;
        cartaElemento.classList.add('carta');
        cartaElemento.setAttribute('data-index', index);
        cartaElemento.onmouseenter = (e) =>{
            cartaElemento.classList.add('hover');
        }
        cartaElemento.onmouseleave = (e) => {
            cartaElemento.classList.remove('hover');
        }
        cartaElemento.onclick = () => {
            if (cambioHabilitado) {
                if (!cartasSeleccionadas.has(index)) {
                    cartaElemento.classList.toggle('seleccionada');
                }
            }
        };

        cartasDiv.appendChild(cartaElemento);
    });
}

// Habilitar los botones de apuesta
function mostrarBotonesApuesta() {
    document.getElementById('apuestas').style.display = 'flex';
}

// Habilitar apuestas
function habilitarApuestas() {
    document.getElementById('botonSee').onclick = () => {
        realizarApuesta(5, 'jugador');
        mostrarBotonesCambio();
    };

    document.getElementById('botonRaise').onclick = () => {
        realizarApuesta(10, 'jugador');
        mostrarBotonesCambio();
    };

    document.getElementById('botonFold').onclick = () => {
        terminarMano('Computadora Gana');
    };
}

function realizarApuesta(apuesta, jugador) {
    if (apuesta > apuestaMaxima) {
        alert('No puedes apostar más de $10.');
        return;
    }

    if (jugador === 'jugador') {
        pozoJugador -= apuesta;
    } else {
        pozoPC -= apuesta;
    }

    pozoTotal += apuesta * 2; // Apuesta del jugador y de la computadora
    actualizarPozo();
}

// Mostrar botones para cambiar cartas
function mostrarBotonesCambio() {
    document.getElementById('botonCambiar').style.display = 'flex';
    document.getElementById('cambio-cartas').style.display = 'flex';
    
    document.getElementById('botonCambiar').onclick = () => {
        cambiarCartasJugador();
    };
    cambioHabilitado = true;
}

// Cambiar las cartas seleccionadas por el jugador
function cambiarCartasJugador() {
    const cartasSeleccionadasElementos = document.querySelectorAll('.carta.seleccionada');
    cartasSeleccionadasElementos.forEach((carta) => {
        const index = parseInt(carta.getAttribute('data-index'));
        if (!cartasSeleccionadas.has(index)) {
            manoJugador[index] = mazo.pop();
            cartasSeleccionadas.add(index);
        }
    });

    // Solo permitir un cambio por carta
    if (cartasSeleccionadas.size > 0) {
        mostrarCartasJugador();
        cambiarCartasComputadora();
    }

    // Deshabilitar cambio de cartas después de la primera selección
    cambioHabilitado = false;
    document.getElementById('cambio-cartas').style.display = 'none';
}

// Cambiar las cartas de la computadora (no visible)
function cambiarCartasComputadora() {
    manoComputadora = manoComputadora.map(() => mazo.pop());
    mostrarResultado();
}

// Función para comparar manos y mostrar el resultado
function mostrarResultado() {
    const manoJugadorEvaluada = evaluarMano(manoJugador);
    const manoComputadoraEvaluada = evaluarMano(manoComputadora);

    let resultado;

    if (manoJugadorEvaluada.fuerza > manoComputadoraEvaluada.fuerza) {
        resultado = 'Jugador Gana';
        pozoJugador += pozoTotal;
    } else if (manoJugadorEvaluada.fuerza < manoComputadoraEvaluada.fuerza) {
        resultado = 'Computadora Gana';
        pozoPC += pozoTotal;
    } else {
        resultado = manoJugadorEvaluada.cartaAlta > manoComputadoraEvaluada.cartaAlta ? 'Jugador Gana' : 'Computadora Gana';
        if (resultado === 'Jugador Gana') {
            pozoJugador += pozoTotal;
        } else {
            pozoPC += pozoTotal;
        }
    }

    pozoTotal = 0;
    actualizarPozo();
    document.getElementById('resultado').textContent = `Resultado: ${resultado}`;

    // Preguntar si el usuario quiere volver a jugar
    setTimeout(() => {
        if (confirm('¿Quieres volver a jugar?')) {
            reiniciarJuego();
        } else {
            document.getElementById('resultado').textContent = 'Juego Finalizado';
            reiniciarJuego();
            pozoJugador =0;
            pozoPC=0;
        }
    }, 3000); 
}

// Evaluar la mano
function evaluarMano(mano) {
    let valores = mano.map(carta => carta.split(' ')[0]);
    let palos = mano.map(carta => carta.split(' ')[1]);

    let valoresNumericos = valores.map(convertirValorACarta);

    if (esEscaleraDeColor(valoresNumericos, palos)) return { tipo: "Escalera de Color", fuerza: 9 };
    if (esPoker(valoresNumericos)) return { tipo: "Póker", fuerza: 8 };
    if (esFullHouse(valoresNumericos)) return { tipo: "Full House", fuerza: 7 };
    if (esColor(palos)) return { tipo: "Color", fuerza: 6 };
    if (esEscalera(valoresNumericos)) return { tipo: "Escalera", fuerza: 5 };
    if (esTrio(valoresNumericos)) return { tipo: "Trío", fuerza: 4 };
    if (esDoblePareja(valoresNumericos)) return { tipo: "Doble Pareja", fuerza: 3 };
    if (esPareja(valoresNumericos)) return { tipo: "Pareja", fuerza: 2 };

    return { tipo: "Carta Alta", fuerza: 1, cartaAlta: Math.max(...valoresNumericos) };
}

// Función para convertir el valor a carta numérica
function convertirValorACarta(valor) {
    const conversion = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return conversion[valor] || 0;
}

// Funciones para verificar el tipo de mano
function esPareja(valores) {
    return Object.values(contarValores(valores)).includes(2);
}

function esDoblePareja(valores) {
    let conteo = contarValores(valores);
    let pares = Object.values(conteo).filter(c => c === 2).length;
    return pares === 2;
}

function esTrio(valores) {
    return Object.values(contarValores(valores)).includes(3);
}

function esPoker(valores) {
    return Object.values(contarValores(valores)).includes(4);
}

function esFullHouse(valores) {
    let conteo = contarValores(valores);
    let tieneTrio = Object.values(conteo).includes(3);
    let tienePareja = Object.values(conteo).includes(2);
    return tieneTrio && tienePareja;
}

function esColor(palos) {
    return new Set(palos).size === 1;
}

function esEscalera(valores) {
    valores.sort((a, b) => a - b);
    for (let i = 0; i < valores.length - 1; i++) {
        if (valores[i] + 1 !== valores[i + 1]) {
            return false;
        }
    }
    return true;
}

function esEscaleraDeColor(valores, palos) {
    return esColor(palos) && esEscalera(valores);
}

function contarValores(valores) {
    let conteo = {};
    valores.forEach((valor) => {
        conteo[valor] = (conteo[valor] || 0) + 1;
    });
    return conteo;
}

// Actualizar el pozo
function actualizarPozo() {
    document.getElementById('pozo').innerHTML = `Pozo Total: ${pozoTotal} <br> Pozo Jugador: ${pozoJugador} <br> Pozo Computadora: ${pozoPC}`;
}

// Reiniciar el juego
function reiniciarJuego() {
    document.getElementById('resultado').textContent = '';
    document.getElementById('cambio-cartas').style.display = 'none';
    document.getElementById('apuestas').style.display = 'none';
    document.getElementById('botonJugar').style.display = 'block';
    document.getElementById('cartas-jugador').innerHTML = ''; // Limpiar cartas del jugador
    cartasSeleccionadas.clear(); // Resetear cartas seleccionadas
}

// Inicializar el juego
document.getElementById('botonJugar').addEventListener('click', iniciarJuego);
