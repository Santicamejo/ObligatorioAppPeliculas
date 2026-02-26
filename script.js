class Usuario{
    constructor(usuario, password, idPais){
        this.usuario = usuario
        this.password = password
        this.idPais = idPais
    }
}

class UsuarioConectado{
    constructor(usuario, password){
        this.usuario = usuario
        this.password = password
    }
}

class Pelicula{
    constructor(idCategoria, nombre, fechaEstreno){
        this.idCategoria = idCategoria
        this.nombre = nombre
        this.fechaEstreno = fechaEstreno
    }
}

const URLBASE = "https://movielist.develotion.com";

const MENU = document.querySelector("#menu");
const ROUTEO = document.querySelector("#routeo");

const LISTAPELICULAS = document.querySelector("#pantalla-listaPeliculas");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTROUSUARIO = document.querySelector("#pantalla-registroUsuario");
const REGISTROPELICULA = document.querySelector("#pantalla-registroPelicula");
const ESTADISTICASPELICULAS = document.querySelector("#pantalla-estdisticasPeliculas");
const MAPAUSUARIOS = document.querySelector("#pantalla-mapaUsuarios");

const BTNLISTAPELICULAS = document.querySelector("#btnMenuListaPeliculas");
const BTNREGISTROUSUARIO = document.querySelector("#btnMenuRegistroUsuario");
const BTNREGISTROPELICULA = document.querySelector("#btnMenuRegistroPelicula");
const BTNESTADISTICASPELICULAS = document.querySelector("#btnMenuEstadisticasPeliculas");
const BTNMAPAUSUARIOS = document.querySelector("#btnMapaUsuarios");
const BTNLOGOUT = document.querySelector("#btnMenuLogout");

let CATEGORIAS = [];
let PELICULAS = [];
let PAISES = [];

let map;

const PAISES_MAPA = [
    { nombre: "Uruguay", lat: -32.5228, lng: -55.7658 },
    { nombre: "Argentina", lat: -38.4161, lng: -63.6167 },
    { nombre: "Brazil", lat: -14.2350, lng: -51.9253 },
    { nombre: "Chile", lat: -35.6751, lng: -71.5430 },
    { nombre: "Bolivia", lat: -16.2902, lng: -63.5887 },
    { nombre: "Colombia", lat: 4.5709, lng: -74.2973 },
    { nombre: "Ecuador", lat: -1.8312, lng: -78.1834 },
    { nombre: "Peru", lat: -9.1900, lng: -75.0152 },
    { nombre: "Paraguay", lat: -23.4425, lng: -58.4438 },
    { nombre: "Venezuela", lat: 6.4238, lng: -66.5897 }
];

function cerrarMenu(){
    MENU.close();
}

Inicio();

function Inicio(){
    // autoLogin si hay credenciales
    if (localStorage.getItem("usuario") && localStorage.getItem("password")) {
        autoLogin();
    } else {
        menuDeslogeado();
    }

    previaCargarPaises();

    ROUTEO.addEventListener("ionRouteDidChange", navegar);

    document.querySelector("#filtroFecha").addEventListener("ionChange", aplicarFiltroFecha);
    document.querySelector("#btnLogin").addEventListener("click", previaLogin);
    document.querySelector("#btnRegistrarUsuario").addEventListener("click", previaRegistroUsuario);
    document.querySelector("#btnRegistrarPelicula").addEventListener("click", previaRegistrarPelicula);
    BTNESTADISTICASPELICULAS.addEventListener("click", cargarEstadisticas);
    BTNLOGOUT.addEventListener("click", logout);
}

function navegar(event){
    const destino = event.detail.to;

    ocultarPantallas();

    if (destino === "/") {
        LOGIN.style.display = "block";
    }

    if (destino === "/listaPeliculas") {
        LISTAPELICULAS.style.display = "block";
        previaCargarPeliculas();
    }

    if (destino === "/registroUsuario") {
        REGISTROUSUARIO.style.display = "block";
    }

    if (destino === "/registroPelicula") {
        REGISTROPELICULA.style.display = "block";
        previaCargarCategorias();
    }

    if (destino === "/estadisticasPeliculas") {
        ESTADISTICASPELICULAS.style.display = "block";
        cargarEstadisticas();
    }

    if (destino === "/mapaUsuarios") {
        MAPAUSUARIOS.style.display = "block";
        crearMapa();
    }
}


function ocultarPantallas(){
    LISTAPELICULAS.style.display="none";
    LOGIN.style.display="none";
    REGISTROUSUARIO.style.display="none";
    REGISTROPELICULA.style.display="none";
    ESTADISTICASPELICULAS.style.display="none";
    MAPAUSUARIOS.style.display="none";
}

function menuOcultarTodo(){
    BTNLISTAPELICULAS.style.display="none";
    BTNREGISTROUSUARIO.style.display="none";
    BTNREGISTROPELICULA.style.display="none";
    BTNESTADISTICASPELICULAS.style.display="none";
    BTNMAPAUSUARIOS.style.display="none";
    BTNLOGOUT.style.display="none";
}

function menuDeslogeado(){
    menuOcultarTodo();
    BTNREGISTROUSUARIO.style.display="block";
}

function menuLogeado(){
    menuOcultarTodo();
    BTNLISTAPELICULAS.style.display="block";
    BTNREGISTROPELICULA.style.display="block";
    BTNESTADISTICASPELICULAS.style.display="block";
    BTNMAPAUSUARIOS.style.display="block";
    BTNLOGOUT.style.display="block";
}


function previaCargarPaises(){

    PAISES = [];

    fetch(`${URLBASE}/paises`)
    .then(function (response){
        return response.json();
    })
    .then(function (data){
        for(let unP of data.paises){
            PAISES.push(unP);
        }
        cargarPaises(PAISES);
    })
    .catch(function (error){
        console.log(error);
    });
}

function cargarPaises(listaPaises){

    let miSelect = "";

    for(let unP of listaPaises){
        miSelect += 
            `<ion-select-option value="${unP.id}">
                ${unP.nombre}
            </ion-select-option>`;
    }
    document.querySelector("#registroPais").innerHTML = miSelect;
}


function previaRegistroUsuario(){

    const usuario = document.querySelector("#registroUsuario").value;
    const password = document.querySelector("#registroPassword").value;
    const idPais = document.querySelector("#registroPais").value;

    if(usuario == "" || password == "" || idPais == null){
        alert("Ningun campo debe estar vacio");
        return
    }
    
    let nuevoUsuario = new Usuario(usuario, password, idPais);

    registrarUsuario(nuevoUsuario);
}

function registrarUsuario(nuevoUsuario) {

    fetch(`${URLBASE}/usuarios`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(nuevoUsuario)
    })
    .then(function (response){
        return response.json();
    })
    .then(function (data){
        if(data.codigo==200){

            const usuarioConectado = new UsuarioConectado(nuevoUsuario.usuario, nuevoUsuario.password);
            login(usuarioConectado);

            alert("Usuario registrado con exito")
        }else{
            alert(data.mensaje)
        }
    })
    .catch(function (error){
        console.log(error);
    });
}


function aplicarFiltroFecha(){
    const filtro = document.querySelector("#filtroFecha").value;

    if(filtro === "todas"){
        cargarPeliculas(PELICULAS);
        return;
    }

    let dias;

    if(filtro === "mes"){
        dias = 30;
    }

    if(filtro === "semana"){
        dias = 7;
    }

    let hoy = new Date();
    hoy.setHours(0,0,0,0);

    let limite = new Date(hoy);
    limite.setDate(limite.getDate() - dias);

    let peliculasFiltradas = [];

    for(let unaP of PELICULAS){
        let fechaPelicula = new Date(unaP.fechaEstreno);
        fechaPelicula.setHours(0,0,0,0)
        if(fechaPelicula >= limite && fechaPelicula <= hoy){
            peliculasFiltradas.push(unaP)
        }
    }
    cargarPeliculas(peliculasFiltradas);
}


function previaLogin(){
    let usuario; 
    let password; 

    if(localStorage.getItem("token")){
        usuario = localStorage.getItem("usuario");
        password = localStorage.getItem("password")
    }else{
        usuario = document.querySelector("#loginUsuario").value;
        password = document.querySelector("#loginPassword").value;

        if(usuario == "" || password == ""){
            alert("No se permiten campos vacios")
            return
        }

    }

    let nuevoUsuarioConectado = new UsuarioConectado(usuario, password);

    login(nuevoUsuarioConectado);
}

function login(usuarioConectado){
    fetch(`${URLBASE}/login`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(usuarioConectado)
    })
    .then(function (response){
        return response.json();
    })
    .then(function (data){

        if(data.codigo == 200){
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", usuarioConectado.usuario);
            localStorage.setItem("password", usuarioConectado.password);

            ocultarPantallas();
            LISTAPELICULAS.style.display="block"
            previaCargarPeliculas();
            previaCargarCategorias();
            menuLogeado();
            alert("Usuario logeado con exito");
        }else{
            alert(data.mensaje)
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function autoLogin(){
    const usuario = localStorage.getItem("usuario");
    const password = localStorage.getItem("password");

    if(usuario && password){
        // opcional: precargar inputs
        const uInput = document.querySelector("#loginUsuario");
        const pInput = document.querySelector("#loginPassword");
        if (uInput) uInput.value = usuario;
        if (pInput) pInput.value = password;

        login(new UsuarioConectado(usuario, password));
    }else{
        menuDeslogeado();
        ocultarPantallas();
        LOGIN.style.display = "block";
    }
}


function logout(){
    if(!confirm("¿Seguro que querés salir?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("password");

    menuDeslogeado();

    ocultarPantallas();

    LOGIN.style.display = "block";
}


function previaCargarCategorias(){

    CATEGORIAS = [];

    fetch(`${URLBASE}/categorias`, {
        method: "GET",
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json" 
        }
    })
    .then(function (response){ return response.json(); })
    .then(function (data){

        for(let unaC of data.categorias){
            CATEGORIAS.push(unaC);
        }

        cargarCategorias();

        if(PELICULAS.length > 0){
            aplicarFiltroFecha();
        }
    })
    .catch(function (error){
        console.log(error);
    });
}

function cargarCategorias(){

    let miSelect = "";

    for(let unaC of CATEGORIAS){
        miSelect += 
            `<ion-select-option value="${unaC.id}">
                ${unaC.emoji} | ${unaC.nombre}
            </ion-select-option>`;
    }

    document.querySelector("#registroPeliculaCategoria").innerHTML = miSelect;
}

function obtenerCategoria(idCategoria){

    for(let unaC of CATEGORIAS){
        if(unaC.id == idCategoria){
            return `${unaC.emoji}`;
        }
    }

    return "Sin categoría";
}

function setFechaMaxima(){
    const hoy = new Date().toJSON().slice(0, 10);
    document.querySelector("#registroPeliculaFecha").setAttribute("max", hoy);
}

setFechaMaxima();


function previaRegistrarPelicula(){
    const idCategoria = document.querySelector("#registroPeliculaCategoria").value;
    const nombre = document.querySelector("#registroPeliculaNombre").value;
    const fechaEstreno = document.querySelector("#registroPeliculaFecha").value;
    const comentario = document.querySelector("#registroPeliculaComentario").value;

    const hoy = new Date().toJSON().slice(0, 10);

    if(fechaEstreno > hoy){
        alert("La fecha no puede ser futura");
        return;
    }

    evaluarComentario(comentario).then(function(resultado){

        if(resultado != 1){
            alert("El comentario es negativo, no se subió la película");
            return;
        }

        const nuevaPelicula = new Pelicula(idCategoria, nombre, fechaEstreno);
        registrarPelicula(nuevaPelicula);
    })
}

function registrarPelicula(nuevaPelicula){
    fetch (`${URLBASE}/peliculas`,{
    method: "POST",
    headers: { 
        "Authorization": "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json" 
    },
    body: JSON.stringify(nuevaPelicula)
    })
    .then(function (response){
    return response.json()
    })
    .then(function(informacion){
        console.log(informacion)
        if (informacion.codigo==200){
            alert("La pelicula fue subida correctamente!")
        }else{
            alert("Hubo problemas al subir la pelicula")
        }
    })
    .catch(function(error){
        console.log(error)
    })
}


function evaluarComentario(comentario){
    return fetch(`${URLBASE}/genai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: comentario })
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if(data.sentiment === "Positivo" || data.sentiment === "Neutro"){
            return 1;
        }
        return 0;
    })
    .catch(function(error){
        console.log(error);
        return 0;
    });
}

function previaCargarPeliculas(){
    fetch(`${URLBASE}/peliculas`, {
        method: "GET",
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    })
    .then(function (response){
        return response.json();
    })
    .then(function (info){
        PELICULAS = info.peliculas || [];
        aplicarFiltroFecha();
    })
    .catch(function (error){
        console.log(error);
    });
}

function cargarPeliculas(listaPeliculas){
    const contenedor = document.querySelector("#listaPeliculas");
    contenedor.innerHTML = "";

    // primero chequeo que exista
    if (!listaPeliculas || listaPeliculas.length === 0) {
        contenedor.innerHTML = 
            `<ion-item lines="none">
                <ion-label>No hay películas registradas</ion-label>
            </ion-item>`;
        return;
    }

    let contenido = "";

    for (let unaP of listaPeliculas) {
        const categoriaTexto = obtenerCategoria(unaP.idCategoria);

        contenido += 
            `<ion-item>
                <ion-label> 
                    <h2>${unaP.nombre}</h2> <p>Fecha de salida: ${unaP.fechaEstreno}</p> <p>Categoría: ${categoriaTexto}</p>
                </ion-label>

                <ion-button color="danger" fill="outline" slot="end" onclick="previaBorrarPelicula(${unaP.id})">Borrar</ion-button>
            </ion-item>`;
    }

    contenedor.innerHTML = contenido;
}


function previaBorrarPelicula(idPelicula){
    if(!confirm("¿Seguro que querés borrar esta película?")) return;

    fetch(`${URLBASE}/peliculas/${idPelicula}`, {
        method: "DELETE",
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
    }
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if(data.codigo === 200){
            previaCargarPeliculas();
        }else{
            alert(data.mensaje);
        }
    })
    .catch(function(error){
        console.log(error);
    });
}


function cargarEstadisticas() {
    const contenedor = document.querySelector("#listaStatsCategorias");
    contenedor.innerHTML = "";

    let contenido = "";

    for (let unaC of CATEGORIAS) {
        let contador = 0;

        for (let unaP of PELICULAS) {
            if (unaP.idCategoria === unaC.id) {
                contador++;
            }
        }

        contenido += 
            `<ion-item>
                <ion-label>
                    ${unaC.emoji} ${unaC.nombre} ${unaC.edad_requerida}
                </ion-label>
                <ion-badge slot="end" color="primary">
                    ${contador}
                </ion-badge>
            </ion-item>`;
    }

    contenedor.innerHTML = contenido;

    let categoriasPorId = {};

    for (let unaC of CATEGORIAS) {
        categoriasPorId[unaC.id] = unaC;
    }

    let total = PELICULAS.length;
    let mayores12 = 0;

    for (let unaP of PELICULAS) {
        let cat = categoriasPorId[unaP.idCategoria];

        if (cat && Number(cat.edad_requerida) > 12) {
            mayores12++;
        }
    }

    let porcentaje = total > 0
        ? Math.round((mayores12 * 100) / total) : 0;

    document.querySelector("#txtPorcentajeApt12").innerHTML = `${porcentaje}% (${mayores12} de ${total})`;
}


function crearMapa() {

    if (map) map.remove();

    const contenedor = document.querySelector("#contenedorMapa");
    contenedor.style.width = "90vw";
    contenedor.style.height = "80vh";

    map = L.map('contenedorMapa').setView([-15, -65], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 5,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    cargarUsuariosPorPais();
}

function cargarUsuariosPorPais() {
    fetch(`${URLBASE}/usuariosPorPais`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (info) {

        let listaPaises = info.paises || [];
        mostrarMarkers(listaPaises);

    })
    .catch(function (error) {
        console.log(error);
    });
}

function mostrarMarkers(listaPaises) {

    for (let unPais of PAISES_MAPA) {

        let cantidad = 0;

        for (let otroPais of listaPaises) {
            if (unPais.nombre === otroPais.nombre) {
                cantidad = otroPais.cantidadDeUsuarios;
            }
        }

L.circleMarker([unPais.lat, unPais.lng], {
    radius: Math.max(15, Math.min(5, cantidad)),
    fillOpacity: 0.5,
    weight: 1
})
.addTo(map)
.bindTooltip(`<strong>${unPais.nombre}</strong><br>${cantidad} usuarios`, {
    permanent: true,
    direction: "top",
    offset: [0, -5]
})
.openTooltip();
    }
}