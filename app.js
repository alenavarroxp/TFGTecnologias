const express = require('express');
const path = require('path');

const app = express();

// Configurar la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use("/scripts", express.static(path.join(__dirname,"node_modules")))

// Ruta "/"
app.get('/', (req, res) => {
    res.send('Hello from / route!');
});

// Ruta "/three"
app.get('/three', (req, res) => {
    //Quiero que me devuelva el archivo three.html
    res.sendFile(path.join(__dirname, 'public', 'three.html'));
});

// Iniciar el servidor
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
