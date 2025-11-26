import { base } from "./constants.js";

// 1. CARGAR PROVINCIAS
async function cargarProvincias() {
    const respuestaAPI = await fetch(base + "/Listados/Provincias");
    const data = await respuestaAPI.json();

    const select = document.getElementById("provincia");

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

    console.log(data);

    data.forEach(municipio => {
        const opcionMunicipio = document.createElement("option");
        opcionMunicipio.value = municipio.IDMunicipio;
        opcionMunicipio.textContent = municipio.Municipio;
        select.appendChild(opcionMunicipio);
    });
}


// EVENTOS
document.getElementById("provincia").addEventListener("change", event => {
    // event.target.value es el ID de la provincia seleccionada
    // Si hay provincia seleccionada -> carga los municipios de esa provincia
    if (event.target.value) cargarMunicipios(event.target.value);
});


// INICIO
cargarProvincias();
