const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Proyecto'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor de la Purificadora San Lorenzo!');
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
  const { cantidad, estado } = req.body;
  db.query('UPDATE inventario SET cantidad = ?, estado = ? WHERE id = ?', [cantidad, estado, id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Producto actualizado' });
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

app.get('/inventario', (req, res) => {
  res.json(inventario);
});

app.get('/inventario/notificaciones', (req, res) => {
  const stockMinimo = 5;
  const notificaciones = inventario
    .filter(item => item.cantidad < stockMinimo)
    .map(item => ({ id: item.id, mensaje: `⚠️ Producto bajo en stock: ${item.nombre}` }));

  res.json(notificaciones);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});