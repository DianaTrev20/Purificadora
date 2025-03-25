const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Modulo para crear un servidor http
const http = require('http'); 
// Modulo para notificaciones en tiempo real
const { Server } = require('socket.io'); 

// Creamos un servidor HTTP y le pasamos el servidor express
const servidor = http.createServer(app); 


const notificaciones = new Server(servidor,
{
  cors: {
    // Permite conexiones desde cualquier origen
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});


// Evento cuando un cliente se conecta a Socket.IO
notificaciones.on("connection", (socket) => 
{
  console.log(`Usuario conectado: ${socket.id}`);

  socket.emit("notificacion", { notificacion: "Notificación de prueba", id: socket.id });

  
});


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3307,
  database: 'Proyecto'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});



const stockMinimo = 5;

app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor de la Purificadora San Lorenzo!');
});

app.get('/notificaciones', (req, res) =>
{
  db.query('SELECT * FROM notificaciones', (err, results) =>
  {
    if (err)
    {
      console.error('Error al obtener las notificaciones:', err);

      res.status(500).send('Error al obtener las notificaciones');

      return;
    }

    console.log(results);
    

    res.json(results);

  });

});

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).send('Error al obtener usuarios');
      return;
    }
    res.json(results);
  });
});
app.get('/recorridos', (req, res) => {
  db.query('SELECT * FROM recorridos', (err, results) => {
    if (err) {
      console.error('Error al obtener recorridos:', err);
      res.status(500).send('Error al obtener recorridos');
      return;
    }
    res.json(results);
  });
});
app.delete('/recorridos/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM recorridos WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar recorrido:', err);
      res.status(500).send('Error al eliminar recorrido');
      return;
    }
    res.json({ message: 'Recorrido eliminado correctamente' });
  });
});


app.get('/inventario', (req, res) => {
  db.query('SELECT * FROM inventario', (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
  });
});

// Agregar un nuevo producto
app.post('/inventario', (req, res) => {
  const { nombre_producto, categoria, cantidad, unidad_medida, precio_compra, precio_venta, proveedor, fecha_entrada, fecha_caducidad, ubicacion, estado, notas } = req.body;
  const query = 'INSERT INTO inventario (nombre_producto, categoria, cantidad, unidad_medida, precio_compra, precio_venta, proveedor, fecha_entrada, fecha_caducidad, ubicacion, estado, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [nombre_producto, categoria, cantidad, unidad_medida, precio_compra, precio_venta, proveedor, fecha_entrada, fecha_caducidad, ubicacion, estado, notas], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, message: 'Producto agregado' });
  });
});

// Actualizar un producto 
app.put('/inventario/:id', (req, res) => {


  const { id } = req.params;

  console.log("BODY", req.body);

  
  const { cantidad, estado } = req.body;

  db.query('UPDATE inventario SET cantidad_stock = cantidad_stock - ?, estado = ? WHERE id = ?', [cantidad, estado, id], (err, result) => {

    if (err) return res.status(500).json(err);

    db.query('SELECT * from inventario  WHERE id = ?', [id], (err, result) =>
    {
      if (err) return res.status(500).json(err);

      console.log(result[0]);
      

      console.log("STOCK despues de vender", result[0].cantidad_stock);

      nombre_producto = result[0].nombre_producto;
      cantidad_stock = result[0].cantidad_stock;

      if(result[0].cantidad_stock < stockMinimo )
      {
        db.query('INSERT INTO notificaciones(tipo, mensaje) VALUES("inventario bajo", ?)', [`Quedan ${result[0].cantidad_stock} unidades de: ${result[0].nombre_producto}`], (err, result) =>
        {
          if (err) return res.status(500).json(err);
          
          notificaciones.emit("notificacion", { tipo: "Inventario bajo", mensaje: `Quedan  ${cantidad_stock} unidades de: ${nombre_producto}` });

          console.log("Producto actualizado y notificación enviada");
          

          res.json({ message: 'Producto actualizado' });

          return;

        });

        
      }
      else
      {
        console.log("Producto actualizado");
        res.json({ message: 'Producto actualizado' });

        return;
      }

      
      

      

      
      

    });
      
  });


});

// Eliminar un producto
app.delete('/inventario/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM inventario WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Producto eliminado' });
  });
});

// app.get('/inventario', (req, res) => {
//   res.json(inventario);
// });

app.get('/inventario/notificaciones', (req, res) => {
  
  const notificaciones = inventario
    .filter(item => item.cantidad < stockMinimo)
    .map(item => ({ id: item.id, mensaje: `⚠️ Producto bajo en stock: ${item.nombre}` }));

  res.json(notificaciones);
});

const PORT = 3000;
servidor.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

});