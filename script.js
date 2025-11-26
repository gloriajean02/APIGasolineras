import { base } from "./constants.js";

// ===== VARIABLES GLOBALES =====
let gasolinerasProvincia = []; // guardamos gasolineras por provincia
let gasolinerasMunicipio = []; // guardamos gasolineras por municipio

// 1. CARGAR PROVINCIAS
async function cargarProvincias() {
    const respuestaAPI = await fetch(base + "/Listados/Provincias");
    const data = await respuestaAPI.json();

    const select = document.getElementById("provincia");

    //Limpiar antes de agregar
    select.innerHTML = "<option value=''>Seleccione provincia</option>";

    console.log(data);

    data.forEach(provincia => {
        const opcionProvincia = document.createElement("option");
        //En el json pone IDPovincia en vez de IDProvincia
        opcionProvincia.value = provincia.IDPovincia;
        console.log(provincia.IDPovincia);
        opcionProvincia.textContent = provincia.Provincia;
        select.appendChild(opcionProvincia);
    });
}

// 2. CARGAR MUNICIPIOS
async function cargarMunicipios(idProvincia) {
    const respuestaAPI = await fetch(base + "/Listados/MunicipiosPorProvincia/" + idProvincia);
    const data = await respuestaAPI.json();

    const select = document.getElementById("municipio");

    //Limpiar antes de agregar
    select.innerHTML = "<option value=''>Seleccione municipio</option>";

    console.log(data);

    data.forEach(municipio => {
        const opcionMunicipio = document.createElement("option");
        opcionMunicipio.value = municipio.IDMunicipio;
        opcionMunicipio.textContent = municipio.Municipio;
        select.appendChild(opcionMunicipio);
    });
}

// 3. CARGAR GASOLINERAS SEGÚN PROVINCIAS
async function cargarGasolinerasProv(idProvincia) {
    const respuestaAPI = await fetch(base + "/EstacionesTerrestres/FiltroProvincia/" + idProvincia);
    const data = await respuestaAPI.json();
    console.log(data);

    //Dentro de la data(es decir, el json) hay una lista con las gasolineras llamada ListaEESSPrecio
    gasolinerasProvincia = data.ListaEESSPrecio;

    // Actualizar select de carburantes según la lista gasolinerasProvincia
    actualizarCarburantes(gasolinerasProvincia);

    // Mostrar gasolineras filtradas por provincia y, si es necesario, por carburante
    mostrarGasolineras(gasolinerasProvincia, document.getElementById("carburante").value);

}

// 4. CARGAR GASOLINERAS SEGÚN MUNICIPIOS
async function cargarGasolinerasMun(idMunicipio) {
    const respuesta = await fetch(`${base}/EstacionesTerrestres/FiltroMunicipio/${idMunicipio}`);
    const data = await respuesta.json();
    gasolinerasMunicipio = data.ListaEESSPrecio;

    // Actualizar select de carburantes según esta lista
    actualizarCarburantes(gasolinerasMunicipio);

    // Mostrar gasolineras filtradas por municipio y, si es necesario, por carburante
    mostrarGasolineras(gasolinerasMunicipio, document.getElementById("carburante").value);
}

// 5. ACTUALIZAR SELECT DE CARBURANTES 
function actualizarCarburantes(lista) {
    const select = document.getElementById("carburante");
    select.innerHTML = "<option value=''>Seleccione carburante</option>";

    //Hago un set para que no haya valores duplicados
    const setCarburante = new Set();
    lista.forEach(gasolinera => {
        for (let element in gasolinera) {
            //En el json, los carburantes empiezan siempre por Precio ... (Gasolina 95)
            if (element.startsWith("Precio ") && gasolinera[element]) {
                //Quito el principio "precio" para que aparezca solo el nombre del carburante en el select
                setCarburante.add(element.replace("Precio ", ""));
            }
        }
    });

    setCarburante.forEach(carburante => { 
        const opcionCarburante = document.createElement("option"); 
        opcionCarburante.value = carburante; opcionCarburante.textContent = carburante; 
        select.appendChild(opcionCarburante); 
    });
}

// 6. MOSTRAR GASOLINERAS
function mostrarGasolineras(lista, carburanteSeleccionado) {
    const contenedor = document.getElementById("resultado-gasolineras");
    contenedor.innerHTML = "";

    if (!lista || !lista.length) {
        contenedor.innerHTML = "<p>No hay gasolineras disponibles para este filtro.</p>";
        return;
    }

    // Obtenemos la hora actual en formato HH:mm
    const ahora = new Date();

    //Ejemplo: 15:30 -> 1530
    //Hacemos 15 * 100 = 1500
    //Para “pegar” los minutos después con una suma: 1500 + 30 = 1530
    const horaActual = ahora.getHours() * 100 + ahora.getMinutes(); 
    
    // Checkbox de abiertas
    const soloAbiertas = document.getElementById("abierta").checked;

    lista.forEach(gasolinera => { 
        // Crear Map de carburantes y precios disponibles 
        const mapCarburantes = new Map(); 
        for (let element in gasolinera) { 
            if (element.startsWith("Precio ") && gasolinera[element]) { 
                mapCarburantes.set(element.replace("Precio ", ""), `${gasolinera[element]}€`); 
            } 
        }

        // Crear HTML de precios
        //Boolean para saber si debo mostrar una gasolinera o no 
        let mostrar = true;
        let preciosHTML = "";

        //Si hay un carburante seleccionado 
        if (carburanteSeleccionado) {
            //Sacamos su precio
            const precio = mapCarburantes.get(carburanteSeleccionado);

            //Si hay precio, lo guardamos en preciosHTML
            if (precio) {
                preciosHTML = `<p>${carburanteSeleccionado}: ${precio}</p>`;

            //Si no hay precio, quiere decir que no existe ese carburante en esta gasolinera,
            //así que no debe mostrarse esta gasolinera    
            } else {
                mostrar = false;
            }
        //Si no hay carburante seleccionado, mostramos todos los de cada gasolinera
        } else {
            mapCarburantes.forEach((precio, nombre) => {
                preciosHTML += `<p>${nombre}: ${precio}</p>`;
            });
        }

        // -------- FILTRO DE HORARIO --------
        if (soloAbiertas && gasolinera.Horario) {
            // Obtenemos la parte del horario después de "L-D: "
            // Por ejemplo: "L-D: 07:00-16:00" -> "07:00-16:00", o "L-D: 24H" -> "24H"
            const horario = gasolinera.Horario.split(": ")[1]; 
            
            if (horario === "24H") {
                // Siempre abierta, no hacemos nada porque mostrar estará true si existe el carburante buscado
                // o si no se está buscando carburante alguno
            } else {
                // "07:00-16:00" -> ["07:00", "16:00"]
                const [inicioStr, finStr] = horario.split("-");
                const inicio = parseInt(inicioStr.replace(":", ""), 10); // 07:00 -> 700
                const fin = parseInt(finStr.replace(":", ""), 10);       // 16:00 -> 1600

                if (horaActual < inicio || horaActual > fin) {
                    mostrar = false; // No mostrar si no está abierta ahora
                }
            }
        }

        //Siempre que mostrar sea true, se imprime la gasolinera
        if (mostrar) {
            const div = document.createElement("div");
            div.classList.add("gasolinera-card");
            div.innerHTML = `
                <h3>${gasolinera.Rótulo || "Sin nombre"}</h3>
                <p><strong>Dirección:</strong> ${gasolinera.Dirección || "-"}</p>
                <p><strong>Localidad:</strong> ${gasolinera.Localidad || "-"}</p>
                <p><strong>Provincia:</strong> ${gasolinera.Provincia || "-"}</p>
                <p><strong>Horario:</strong> ${gasolinera.Horario || "-"}</p>
                <div><strong>Precios:</strong>${preciosHTML}</div>
            `;
            contenedor.appendChild(div);
        }
    });
}

// 7. ACTUALIZAR GASOLINERAS SEGÚN FILTROS
function actualizarGasolineras() {
    const provincia = document.getElementById("provincia").value;
    const municipio = document.getElementById("municipio").value;
    const carburante = document.getElementById("carburante").value;

    if (municipio) {
        mostrarGasolineras(gasolinerasMunicipio, carburante);
    } else if (provincia) {
        mostrarGasolineras(gasolinerasProvincia, carburante);
    } else {
        document.getElementById("resultado-gasolineras").innerHTML = "";
    }
}

// 8. RESET
function resetear() {
    document.getElementById("provincia").value = "";
    const selectMunicipio = document.getElementById("municipio");
    selectMunicipio.innerHTML = "<option value=''>Seleccione municipio</option>";

    const selectCarburante = document.getElementById("carburante");
    selectCarburante.innerHTML = "<option value=''>Seleccione carburante</option>";
    document.getElementById("abierta").checked = false;
    document.getElementById("resultado-gasolineras").innerHTML = "";
    gasolinerasProvincia = [];
    gasolinerasMunicipio = [];
}

// EVENTOS
document.getElementById("provincia").addEventListener("change", e => {
    const id = e.target.value;
    if (id) {
        cargarMunicipios(id);
        cargarGasolinerasProv(id);
    } else {
        resetearFiltros();
    }
});

document.getElementById("municipio").addEventListener("change", e => {
    const id = e.target.value;
    if (id) {
        cargarGasolinerasMun(id);
    } else {
        actualizarGasolineras();
    } 
});

document.getElementById("carburante").addEventListener("change", actualizarGasolineras);

document.getElementById("abierta").addEventListener("change", actualizarGasolineras);

document.getElementById("resetear").addEventListener("click", resetear);

// INICIO
cargarProvincias();
