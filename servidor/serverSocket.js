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
      });

      socket.on("newCharacter", (obj) => {
        obj.users = this.users
        socket.broadcast.emit("newCharacter", obj);
      });

      socket.on("moveCharacter", (obj) => {
        console.log(
          "Se ha movido el personaje ",
          obj.id,
          " a la posición: ",
          obj.position
        );
        socket.broadcast.emit("moveCharacter", obj);
      });
    });
  };
}

module.exports.WebSocketServer = WebSocketServer;
