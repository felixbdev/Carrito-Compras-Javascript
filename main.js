
//Constantes a utilizar a lo largo del desarrollo

const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

//Evento que ocurre al cargar toda la pagina 
document.addEventListener('DOMContentLoaded', () => {
    fetchData()
    //Condicion que se aplica EN CASO de que el carrito tenga informacion
    if (localStorage.getItem('carrito')){
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }    
})


//Llamado a la funcion Click para anadir en el carrito
cards.addEventListener(`click`, e => addCarrito(e))

items.addEventListener('click', e => btnAccion(e))

//Aqui se realiza la peticion al archivo JSON
const fetchData = async () => {

    try{
        const res = await fetch('api.json');
        const data = await res.json();
        //Luego de recibir la informacion de JSON usaremos la data como parametro de la funcion
        pintarCards(data);
    
    } catch (error) {console.log(error)}
}

//Funcion que mostrara en pantalla de forma dinamica la data recibida de JSON
const pintarCards = data => {
    //Bucle que se hara para llenar con la data los diferentes productos
    data.forEach(producto => {
        templateCard.querySelector(`h5`).textContent = producto.title;
        templateCard.querySelector(`p`).textContent = producto.precio;
        templateCard.querySelector(`img`).setAttribute('src',producto.thumbnailUrl);
        templateCard.querySelector(`.btn-dark`).dataset.id = producto.id;
        //Clonamos el node para luego crear el fragment
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    })
    //Se crea un nuevo Child
    cards.appendChild(fragment); 
}

//Tareas que hara la funcion para anadir al carrito 
const addCarrito = e =>{
    //Se aplica condiciones para que se anada cuando el evento CLICK se realice al boton con class 'btn-dark' y llamamos a otra funcion
    if (e.target.classList.contains(`btn-dark`)) setCarrito (e.target.parentElement);
    //Detenemos la propagacion de los eventos que se heredan
    e.stopPropagation();
}

//Funcion donde se anade informacion del producto escogido
const setCarrito = objeto => {
    //Se crea objeto donde tendremos la informacion del producto
    const producto = {
        // Se crea un dataset id dinamico para cada uno de los productos
        id: objeto.querySelector(`.btn-dark`).dataset.id,
        title: objeto.querySelector(`h5`).textContent,
        precio: objeto.querySelector(`p`).textContent,
        cantidad: 1
    };
    //Se aplica condiciones en caso de que se vuelva a seleccionar un producto anteriormente hecho para aumentar cantidad
    if(carrito.hasOwnProperty(producto.id)) producto.cantidad = carrito[producto.id].cantidad + 1;
    //Carrito es un objeto vacio con un id unico el cual recibira toda la informacion de producto
    carrito[producto.id] = {...producto};
    //Llamamos a la funcion con el parametro carrito
    pintarCarrito(carrito);
}

// Con esta funcion mostraremos en pantalla el carrito de lo que se lleva en la compra
const pintarCarrito = () => {
    //Vaciamos el HTML para que no se repita el producto al seleccionar nuevamente
    items.innerHTML = ``;
    /*Object.values devuelve un array para poder aplicar un bucle*/
    Object.values(carrito).forEach(producto => {
        //Valores que seran cambiados a lo largo del bucle
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;
        //Se clona el nodo para mostrar evitando reflow
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    //Nuevo hijo de items HTML
    items.appendChild(fragment)
    //Llamado a funcion para mostrar el footer
    pintarFooter()
    //Guardando informacion en caso de recarga
    localStorage.setItem('carrito', JSON.stringify(carrito))
}
//funcion footer
const pintarFooter = () => {
    footer.innerHTML = ''
    //Condicion que se aplica si el carrito esta vacio
    if(Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`
        //Con el return se sale deja funcion y deja de realizar la operaciones siguientes
        return
    }
    /*Aplicacion de reduce para crear el acumulador de los valores cantidad y precio
    El método reduce() ejecuta una función reductora sobre cada elemento de un array, devolviendo como resultado un único valor.
    Se aplica Object.values para que devuelva un array y poder usar el reduce*/
    //Se coloca 0 para que devuelva un numero 
    const nCantidad = Object.values(carrito).reduce((acc,{cantidad}) => acc + cantidad,0 );
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad,precio}) => acc + cantidad * precio,0);
    //Indicamos los valores que se van a cambiar de forma dinamica
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent= nPrecio;
    //Clonamos para mostrar en pantalla
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);
    //Aplicamos la constante para el boton del footer
    const btnVaciar = document.getElementById('vaciar-carrito');
    
    btnVaciar.addEventListener('click',() => {
        //Si se hace el evento se pinta objeto vacio
        carrito = {}
        //Carrito es el paremetro vacio que recibe la funcion
        pintarCarrito();
    })
}

const btnAccion = e =>{
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {...producto};
        pintarCarrito();
    }

    if (e.target.classList.contains('btn-danger')){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0){
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito();
    }

    e.stopPropagation();
}