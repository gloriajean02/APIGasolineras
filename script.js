import { base } from "./constants.js";

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
    const lista = data.ListaEESSPrecio;
    //Hago un set para que no haya valores duplicados
    const setCarburante = new Set();

    lista.forEach(gasolinera => {
        for (let element in gasolinera) {
            //En el json, los carburantes empiezan siempre por Precio ... (Gasolina 95)
            if (element.startsWith("Precio ") && gasolinera[element] !== "") {
                //Quito el principio "precio" para que aparezca solo el nombre del carburante en el select
                setCarburante.add(element.replace("Precio ", ""));
            }                                     
        }
    });

    const select = document.getElementById("carburante");

    //Limpiar antes de agregar
    select.innerHTML = "<option value=''>Seleccione carburante</option>";

    setCarburante.forEach(carburante => {
        const opcionCarburante = document.createElement("option");
        opcionCarburante.value = carburante;
        opcionCarburante.textContent = carburante;
        select.appendChild(opcionCarburante);
    })
    

}

// 4. CARGAR GASOLINERAS SEGÚN MUNICIPIOS
async function cargarGasolinerasMun(IDMunicipio) {
    const respuestaAPI = await fetch(base + "/EstacionesTerrestres/FiltroMunicipio/" + IDMunicipio);
    const data = await respuestaAPI.json();
    console.log(data);

    //Dentro de la data(es decir, el json) hay una lista con las gasolineras llamada ListaEESSPrecio
    const lista = data.ListaEESSPrecio;
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

    const select = document.getElementById("carburante");

    //Limpiar antes de agregar
    select.innerHTML = "<option value=''>Seleccione carburante</option>";

    setCarburante.forEach(carburante => {
        const opcionCarburante = document.createElement("option");
        opcionCarburante.value = carburante;
        opcionCarburante.textContent = carburante;
        select.appendChild(opcionCarburante);
    })
}


// EVENTOS
document.getElementById("provincia").addEventListener("change", event => {
    // event.target.value es el ID de la provincia seleccionada
    // Si hay provincia seleccionada -> carga los municipios, los carburantes y las gasolineras de esa provincia 
    if (event.target.value) {
        cargarMunicipios(event.target.value);
        cargarGasolinerasProv(event.target.value);
    }
});

document.getElementById("municipio").addEventListener("change", event => {
    // event.target.value es el ID del municipio seleccionado
    // Si hay municipio seleccionado -> carga los carburantes y las gasolineras de ese municipio 
    if (event.target.value) {
        cargarGasolinerasMun(event.target.value);
    }
});



// INICIO
cargarProvincias();
