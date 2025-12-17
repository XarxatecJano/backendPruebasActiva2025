// Utilidades DOM reutilizables
const DOMUtils = {
    // Wrapper seguro para getElementById
    getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    },

    // Toggle de clases CSS
    toggleClass(element, className, force = null) {
        if (!element) return;
        if (force !== null) {
            element.classList.toggle(className, force);
        } else {
            element.classList.toggle(className);
        }
    },

    // Añadir clase
    addClass(element, className) {
        if (element) element.classList.add(className);
    },

    // Remover clase
    removeClass(element, className) {
        if (element) element.classList.remove(className);
    },



    // Limpiar contenido de un elemento
    clearContent(element) {
        if (element) element.innerHTML = '';
    }
};