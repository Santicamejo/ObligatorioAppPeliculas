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

class Usuario{
    constructor(usuario, password, idpais){
        this.usuario = usuario
        this.password = password
        this.idpais = idpais
    }
}

class UsuarioConectado{
    constructor(usuario, password){
        this.usuario = usuario
        this.password = password
    }
}

class Pelicula{
    constructor(idCategoria, nombre, fecha){
        this.idCategoria = idCategoria
        this.nombre = nombre
        this.fecha = fecha
    }
}

Inicio();

function cerrarMenu(){
    MENU.close();
}

function Inicio(){
    ROUTEO.addEventListener("ionRouteDidChange", navegar);
    setFechaMaxima(); //Defino la fecha maxima para seleccionar en el calendario




    document.querySelector("#filtroFecha").addEventListener("ionChange", aplicarFiltroFecha);




    if(localStorage.getItem("usuario") && localStorage.getItem("password")){
        autoLogin();
        previaCargarCategorias();
    }else{
        previaCargarPaises();
        menuDeslogeado();
        ocultarPantallas();
        LOGIN.style.display = "block";
    }

    document.querySelector("#btnLogin").addEventListener("click", previaLogin);
    document.querySelector("#btnRegistrarUsuario").addEventListener("click", previaRegistroUsuario);
    document.querySelector("#btnRegistrarPelicula").addEventListener("click", previaRegistrarPelicula);
    BTNLISTAPELICULAS.addEventListener("click", previaCargarPeliculas);
    BTNREGISTROPELICULA.addEventListener("click", previaCargarCategorias);
    BTNESTADISTICASPELICULAS.addEventListener("click", previaCargarCategoriasEstadisticas);
    BTNLOGOUT.addEventListener("click", logout);
}

function navegar(event){

    let destino = event.detail.to;

    ocultarPantallas();
    if(destino == "/") LOGIN.style.display="block";
    if(destino == "/listaPeliculas") LISTAPELICULAS.style.display="block";
    if(destino == "/registroUsuario") REGISTROUSUARIO.style.display="block";
    if(destino == "/registroPelicula") REGISTROPELICULA.style.display="block";
    if(destino == "/estadisticasPeliculas") ESTADISTICASPELICULAS.style.display="block";
    if(destino == "/mapaUsuarios") MAPAUSUARIOS.style.display="block";
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

    fetch(`${URLBASE}/paises`)
    .then(function (response){
        return response.json();
    })
    .then(function (data){
        let paises = [];
        for(let unP of data.paises){
            paises.push(unP);
        }

        cargarPaises(paises);

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
            login(nuevoUsuario);
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
            ocultarPantallas();
            LISTAPELICULAS.style.display="block"
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", usuarioConectado.usuario);
            localStorage.setItem("password", usuarioConectado.password);
            menuLogeado();
            previaCargarPeliculas();
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
    login(new UsuarioConectado(usuario, password));
    document.querySelector("#loginUsuario").value = usuario;                  
    document.querySelector("#loginPassword").value = password;
  }else{
    menuDeslogeado();
    ocultarPantallas();
    LOGIN.style.display = "block";
    previaCargarPaises();
  }
}

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("password");

    menuDeslogeado();

    ocultarPantallas();

    LOGIN.style.display = "block";

    window.location.href = "/";

}

function previaCargarCategorias(){
    fetch(`${URLBASE}/categorias`, {
        method: "GET",
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json" 
        },
        body: JSON.stringify()
    })
    .then(function (response){
        return response.json();
    })
    .then(function (data){
        let categorias = [];
        for(let unaC of data.categorias){
            categorias.push(unaC);
        }

        cargarCategorias(categorias);

    })
    .catch(function (error){
        console.log(error);
    });
}

function cargarCategorias(listaCategorias){

    CATEGORIAS = listaCategorias;

    let miSelect = "";

    for(let unaC of listaCategorias){
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

function previaRegistrarPelicula(){
    const idCategoria = document.querySelector("#registroPeliculaCategoria").value;
    const nombre = document.querySelector("#registroPeliculaNombre").value;
    const fecha = document.querySelector("#registoPeliculaFecha").value;

    const hoy = new Date().toJSON().slice(0, 10);

    if(fecha > hoy){
        alert("La fecha no puede ser posterior a hoy");
        return;
    }

    const nuevaPelicula = new Pelicula(idCategoria, nombre, fecha);

    registrarPelicula(nuevaPelicula);
}

async function registrarPelicula(nuevaPelicula){
    try{
        const comentario = document.querySelector("#registoPeliculaComentario").value;

        const evaluacion = await evaluarComentario(comentario);

        if(evaluacion === 1){

            const response = await fetch(`${URLBASE}/peliculas`, {
                method: "POST",
                headers: { 
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevaPelicula)
            });

            const data = await response.json();

            if(data.codigo === 200){
                alert("Pelicula registrada con exito");
            }else{
                alert(data.mensaje);
            }

        }else{
            alert("La pelicula es muy mala");
        }

    }catch(error){
        console.log(error);
        alert("Error evaluando el comentario o registrando la película");
    }
}

function setFechaMaxima(){
    const hoy = new Date().toJSON().slice(0, 10);
    document.querySelector("#registoPeliculaFecha").setAttribute("max", hoy);
}

async function evaluarComentario(comentario){
  const response = await fetch(`${URLBASE}/genai`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: comentario })
  });

  const data = await response.json();

  if(data.sentiment === "Positivo" || data.sentiment === "Neutro") return 1;

  return 0;
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

  let contenido = "";

  for(let unaP of listaPeliculas){

    const categoriaTexto = obtenerCategoria(unaP.idCategoria);

    contenido += `
      <ion-item>
        <ion-label>
          <h2>${unaP.nombre}</h2>
          <p>Fecha de salida: ${unaP.fechaEstreno}</p>
          <p>Categoría: ${categoriaTexto}</p>
        </ion-label>

        <ion-button color="danger" fill="outline" slot="end"
          onclick="previaBorrarPelicula(${unaP.id})">
          Borrar
        </ion-button>
      </ion-item>
    `;
  }

  document.querySelector("#listaPeliculas").innerHTML = contenido;
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

function previaCargarCategoriasEstadisticas(){

    fetch(`${URLBASE}/categorias`, {
        method: "GET",
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){

        let categorias = data.categorias || [];

        previaCargarPeliculasEstadisticas(categorias);
    })
    .catch(function(error){
        console.log(error);
        alert("Error cargando categorías");
    });
}

function previaCargarPeliculasEstadisticas(categorias){

    fetch(`${URLBASE}/peliculas`, {
        method: "GET",
        headers: { 
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    })
    .then(function(response){
        return response.json();
    })
    .then(function(info){

        let peliculas = info.peliculas || [];

        cargarEstadisticas(categorias, peliculas);
    })
    .catch(function(error){
        console.log(error);
        alert("Error cargando películas");
    });
}

function cargarEstadisticas(categorias, peliculas){

    let contenido = "";

    for(let unaC of categorias){

        let contador = 0;

        for(let unaP of peliculas){
            if(unaP.idCategoria === unaC.id){
                contador++;
            }
        }

        contenido += `
            <ion-item>
                <ion-label>
                    ${unaC.emoji} ${unaC.nombre} ${unaC.edad_requerida}
                </ion-label>
                <ion-badge slot="end" color="primary">
                    ${contador}
                </ion-badge>
            </ion-item>
        `;
    }

    document.querySelector("#listaStatsCategorias").innerHTML = contenido;

    let categoriasPorId = {};
    for(let unaC of categorias){
        categoriasPorId[unaC.id] = unaC;
    }

    let total = peliculas.length;
    let mayores12 = 0;

    for(let unaP of peliculas){
        let cat = categoriasPorId[unaP.idCategoria];

        if(cat && Number(cat.edad_requerida) > 12){
            mayores12++;
        }
    }

    let porcentaje = 0;
    if(total > 0){
        porcentaje = Math.round((mayores12 * 100) / total);
    }

    document.querySelector("#txtPorcentajeApt12").innerHTML =
        `${porcentaje}% (${mayores12} de ${total})`;
}