const http = require('http');
const express = require('express');
const path = require('path');
const modeloWSS = require("./servidor/serverSocket.js")

const app = express();
const httpServer = http.createServer(app);
const ws = new modeloWSS.WebSocketServer();
const { Server } = require("socket.io");

// Configurar la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use("/scripts", express.static(path.join(__dirname,"node_modules")))


// Ruta "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/three', (req, res) => {
    //Quiero que me devuelva el archivo three.html
    res.sendFile(path.join(__dirname, 'public', 'three.html'));
});

app.get("/babylon", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "babylon.html"));
});

// Iniciar el servidor
httpServer.listen(3001, () => {
    console.log('Server is running on port 3001');
});

const io = new Server()
io.listen(httpServer)

ws.start(io);