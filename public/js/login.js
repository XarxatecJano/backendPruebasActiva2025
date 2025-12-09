const params = new URLSearchParams(window.location.search);
const errorMsg = document.getElementById('error-message');

if (params.get('error') === 'sesion') {
    errorMsg.textContent = 'No estás identificado correctamente';
    errorMsg.style.display = 'block';
} else if (params.has('error')) {
    errorMsg.textContent = 'El usuario o contraseña son incorrectos';
    errorMsg.style.display = 'block';
}
