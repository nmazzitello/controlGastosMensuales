const formulario= document.querySelector("#agregar-gasto");
const gastoListado= document.querySelector("#gastos ul")
const btnReiniciarMes= document.querySelector("#btnReiniciar")

class Presupuesto{
    constructor(presupuesto){
        this.presupuesto=Number(presupuesto);
        this.restante=Number(presupuesto);
        this.gastos=[];
    };

    nuevoGasto(gasto){
        // this.gastos.push(gasto); //tambien funciona asi
        this.gastos=[...this.gastos, gasto];
        this.restarGasto(gasto.cant);
    };

    restarGasto(monto){
        this.restante = this.restante-monto;
    };

    eliminarGasto(id, cant){
        this.gastos= this.gastos.filter( gasto => gasto.id !== id);
        this.restante=this.restante+cant;
    };

    actualizarRestanteYgasto(restanteGuardado, gastosGuardados){
        this.restante=restanteGuardado;
        this.gastos= gastosGuardados
    }
}

class UI{
    insertarPresupuesto(cantidad){
        const {presupuesto, restante}= cantidad;
        document.querySelector("#total").textContent=presupuesto;
        document.querySelector("#restante").textContent=restante;
    };

    imprimirAlerta(mensaje, tipo){
        const divMensa= document.createElement("div");
        divMensa.textContent=mensaje;

        if(tipo==="error"){
            divMensa.classList.add("error");
        }else{
            divMensa.classList.add("agregado");
        }

        formulario.appendChild(divMensa);
        
        setTimeout(()=>{
            divMensa.remove();
        },3000);
    };

    imprimirListadoGastos(gastos){
        this.limpiarListado();

        gastos.forEach(gast => {

            const {cant, nombre, id}= gast;

            const nuevoGasto= document.createElement("li");
            nuevoGasto.className="list-group-item d-flex justify-content-between align-items-center";
            nuevoGasto.dataset.id=id;
            nuevoGasto.innerHTML=`
                ${nombre} <span class=" badge bg-primary" bg-pill> ${cant} </span>
            `;

            const btnBorrar= document.createElement("button");
            btnBorrar.textContent="Borrar x";  
            btnBorrar.classList.add("btn", "btn-danger");
            btnBorrar.onclick= ()=> {
                eliminarGasto(id, cant);
            }
            nuevoGasto.appendChild(btnBorrar);
            
            gastoListado.appendChild(nuevoGasto);
        }); 
    };

    limpiarListado(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    };

    actualizarRestante(){
        let presu= presupuesto.restante;

        document.querySelector("#restante").textContent=presu;
    };

    comprobarPresupuesto(){
        //si el presupuesto restante, es mayor al 50% del presupuestp
        const pres= presupuesto.presupuesto;
        const rest= presupuesto.restante;
        const labelRes= document.querySelector(".group2");

        if(rest <= 0){
           ui.imprimirAlerta("El presupuesto se agoto","error");
           formulario.querySelector('input[type="submit"]').disabled=true;
        }else if(rest < (pres*0.25)){
            labelRes.classList.remove("resto50");
            labelRes.classList.add("resto75");
        }else if(rest < (pres*0.5)){
            labelRes.classList.remove("resto75");
            labelRes.classList.add("resto50");
        }
        else{
            labelRes.classList.remove("resto75", "resto50");
        }
    };
}

const ui= new UI();

let presupuesto;

eventListeners();

function eventListeners(){
    document.addEventListener("DOMContentLoaded", preguntarPresupuesto);
    formulario.addEventListener("submit",agregarGasto);
    btnReiniciarMes.addEventListener("click", reiniciarMes);
}

function preguntarPresupuesto(){
    const hayAlgo=cargarLocalStorage();

    if(hayAlgo==null || hayAlgo.presu==null){
        const presupuestoUsuario= prompt("Ingresa tu presupuesto mensual: ");
        if(presupuestoUsuario === "" || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario<=0){
        window.location.reload();
        }
        presupuesto= new Presupuesto(presupuestoUsuario);
        ui.insertarPresupuesto(presupuesto);

        guardarLocalStorage(presupuesto);
    }
    else{
        const pasoPresupuestoAstring= String(hayAlgo.presupuesto);
        presupuesto= new Presupuesto(pasoPresupuestoAstring);
        presupuesto.actualizarRestanteYgasto(Number(hayAlgo.restante), hayAlgo.gastos);
        
        ui.insertarPresupuesto(presupuesto);

        ui.imprimirListadoGastos(presupuesto.gastos);
    }
}

function agregarGasto(e){
    e.preventDefault();
    
    const nombre= document.querySelector("#gasto").value;
    const cant= Number(document.querySelector("#cantidad").value);

    if(nombre==="" || cant==="" ){
        ui.imprimirAlerta("Ambos campos son obligatorios", "error");
        return;
    }
    else if( isNaN(cant) ){
        ui.imprimirAlerta("Debes ingresar solo numeros en el monto", "error");
        return;
    }else if(cant <= 0){
        ui.imprimirAlerta("El monto tiene que se mayor a $0", "error");
        return;
    }else{
        const gasto={
            nombre, 
            cant,
            id:Date.now()
        }; 

        presupuesto.nuevoGasto(gasto);
        
        ui.imprimirAlerta("Agregado correctamente");
 
        const {gastos}= presupuesto;
        
        ui.imprimirListadoGastos(gastos);
        ui.comprobarPresupuesto();
        ui.actualizarRestante();

        formulario.reset();

        actualizarLocalstorage(); 
    }
}

function eliminarGasto(id, cant){
    //elimina el gasto del objeto
    presupuesto.eliminarGasto(id, cant);

    //elimina del html
    const {gastos}=presupuesto;
    ui.imprimirListadoGastos(gastos);
    ui.actualizarRestante();
    ui.comprobarPresupuesto(); 
    
    actualizarLocalstorage(); 
}

function reiniciarMes(){
    localStorage.removeItem('gastoMes');
    window.location.reload();
};

function guardarLocalStorage(presupuesto){
    const presupuestoObj= JSON.stringify(presupuesto);
    localStorage.setItem("gastoMes", presupuestoObj);
}

function cargarLocalStorage(){
    const algo= JSON.parse(localStorage.getItem("gastoMes"));
    return algo;
}

function actualizarLocalstorage(){
    localStorage.removeItem('gastoMes');
    guardarLocalStorage(presupuesto);
}  