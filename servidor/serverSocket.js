function WebSocketServer() {
  this.users = {};
  this.start = function (io) {
    io.on("connection", (socket) => {
      console.log("Se ha conectado el usuario: " + socket.id);
        this.users[socket.id] = socket.id;
        console.log("USERS",this.users);
      socket.broadcast.emit("recuperarPersonajes", socket.id);

      socket.on("disconnect", () => {
        console.log("Se ha desconectado el usuario", socket.id);
        delete this.users[socket.id];
        console.log("USERS",this.users);
        socket.broadcast.emit("disconnected", socket.id);
      });

      socket.on("newCharacter", (obj) => {
        obj.users = this.users
        obj.id = socket.id;
        socket.broadcast.emit("newCharacter", obj);
      });

      socket.on("moveCharacter", (obj) => {
        socket.broadcast.emit("moveCharacter", obj);
      });

      socket.on("recuperarPersonajes", (id) => {
        console.log("Recuperando personajes...");
        socket.broadcast.emit("recuperarPersonajes", id);
      });
      
    });
  };
}

module.exports.WebSocketServer = WebSocketServer;
