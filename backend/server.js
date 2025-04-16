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
const { log } = require('console');

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
  port: 3306,
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

// GET todos los recorridos (ya lo tienes)
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

// POST para agregar nuevos recorridos
app.post('/recorridos', (req, res) => {
  const { cliente, garrafon, barrio, precio, dia_semana } = req.body;
  
  // Validación básica
  if (!cliente || !garrafon || !barrio || !precio || !dia_semana) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const query = `
    INSERT INTO recorridos 
    (cliente, garrafon, barrio, precio, dia_semana)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(query, [cliente, garrafon, barrio, precio, dia_semana], (err, result) => {
    if (err) {
      console.error('Error al crear recorrido:', err);
      return res.status(500).json({ error: 'Error al crear recorrido' });
    }
    res.status(201).json({ 
      id: result.insertId,
      cliente,
      garrafon,
      barrio,
      precio,
      dia_semana
    });
  });
});

// PUT actualizar recorrido
app.put('/recorridos/:id', (req, res) => {
  const id = req.params.id;
  const { cliente, garrafon, barrio, precio, dia_semana } = req.body;

  const query = `
    UPDATE recorridos 
    SET cliente = ?, garrafon = ?, barrio = ?, precio = ?, dia_semana = ?
    WHERE id = ?
  `;
  
  db.query(query, [cliente, garrafon, barrio, precio, dia_semana, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar recorrido:', err);
      return res.status(500).json({ error: 'Error al actualizar recorrido' });
    }
    res.json({ id, ...req.body });
  });
});

// DELETE recorrido (ya lo tienes)
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


// INVENTARIO
app.get('/inventario', (req, res) => {
  const query = `
    SELECT i.*, p.nombre AS nombre_proveedor 
    FROM inventario i
    LEFT JOIN proveedores p ON i.proveedor_id = p.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// server.js (Ruta POST /inventario)
app.post('/inventario', (req, res) => {
  const producto = req.body;
  console.log('Datos recibidos:', producto); // Debug clave
  
  // Asegurar que proveedor_id sea string (varchar(100) como en tu BD)
  producto.proveedor_id = producto.proveedor_id.toString(); // ✅ Conversión crítica
  
  const query = 'INSERT INTO inventario SET ?';
  
  db.query(query, producto, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    
    // Validación corregida
    if (producto.cantidad_stock < producto.stock_minimo) { 
      const mensaje = `Stock bajo: ${producto.nombre_producto} (${producto.cantidad_stock} restantes)`;
      crearNotificacion(mensaje);
    }
    
    res.status(201).json({ id: result.insertId });
  });
});

app.put('/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productoData = req.body;
    
    // Eliminar campos que no deben actualizarse directamente
    delete productoData.nombre_proveedor;
    delete productoData.id;
    
    const campos = Object.keys(productoData);
    const valores = Object.values(productoData);
    
    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE productos SET ${setClause} WHERE id = ?`;
    
    const [result] = await pool.execute(query, [...valores, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Obtener el producto actualizado con JOIN para el nombre del proveedor
    const [producto] = await pool.execute(`
      SELECT p.*, pr.nombre as nombre_proveedor 
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.id = ?
    `, [id]);
    
    res.json(producto[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/inventario/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM inventario WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    
    res.json({ 
      message: 'Producto eliminado', 
      changes: result.affectedRows 
    });
  });
});

// NOTIFICACIONES
app.get('/inventario/notificaciones', (req, res) => {
  const query = `
    SELECT * FROM notificaciones 
    WHERE tipo = 'inventario'
    ORDER BY fecha DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Función auxiliar para notificaciones
function crearNotificacion(mensaje) {
  const query = `
    INSERT INTO notificaciones(tipo, mensaje) 
    VALUES('inventario', ?)
  `;
  
  db.query(query, [mensaje], (err) => {
    if (!err) {
      // Emitir evento de notificación si es necesario
      notificaciones.emit("notificacion", { 
        tipo: "inventario", 
        mensaje 
      });
    }
  });
}
// Rutas para proveedores (se mantiene igual)
app.get('/proveedores', (req, res) => {
  db.query('SELECT * FROM proveedores', (err, results) => {
    if (err) {
      console.error('Error al obtener proveedores:', err);
      res.status(500).send('Error al obtener proveedores');
      return;
    }
    res.json(results);
  });
});

// Obtener productos para las compras (nueva ruta necesaria)
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM inventario', (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      res.status(500).send('Error al obtener productos');
      return;
    }
    res.json(results);
  });
});

// Rutas para compras (actualizadas)
app.get('/compras', (req, res) => {
  const query = `
    SELECT c.*, 
           p.nombre as nombre_proveedor,
           prod.nombre_producto as nombre_producto
    FROM compras c
    LEFT JOIN proveedores p ON c.proveedor_id = p.id
    LEFT JOIN inventario prod ON c.producto_id = prod.id
    ORDER BY c.fecha_compra DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener compras:', err);
      res.status(500).send('Error al obtener compras');
      return;
    }

    console.log(results);
    
    res.json(results);
  });
});

app.post('/compras', (req, res) => {

  console.log(req.body);
  
  const { proveedor_id, producto_id, cantidad, costo_total, fecha_compra, estado, notas } = req.body;
  
  const query = `
    INSERT INTO compras 
    (proveedor_id, producto_id, cantidad, costo_total, fecha_compra, estado, notas) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, 
    [proveedor_id, producto_id, cantidad, costo_total, fecha_compra, estado, notas], 
    (err, result) => {
      if (err) {
        console.error('Error al crear compra:', err);
        res.status(500).send('Error al crear compra');
        return;
      }
      
      // Enviar notificación
      db.query('SELECT nombre FROM proveedores WHERE id = ?', [proveedor_id], (err, provResult) => {

        console.log("provResult", provResult);
        

        const nombreProveedor = provResult[0]?.nombre || 'Proveedor desconocido';

        console.log(`'SELECT nombre FROM productos WHERE id = ${producto_id}`);
        

        db.query('SELECT nombre_producto FROM inventario WHERE id = ?', [producto_id], (err, prodResult) => {

          console.log("prodResult", prodResult);
          

          const nombreProducto = prodResult[0]?.nombre_producto || 'Producto desconocido';
          const mensaje = `⚠️ Compra pendiente: ${cantidad} ${nombreProducto} de ${nombreProveedor}`;
          
          db.query('INSERT INTO notificaciones(mensaje) VALUES(?)', [mensaje], (err) => {
            if (err) console.error('Error al crear notificación:', err);
            
            notificaciones.emit("notificacion", { 
              tipo: "Nueva compra", 
              mensaje: mensaje 
            });
          });
        });
      });
      
      res.json({ id: result.insertId, message: 'Compra creada exitosamente' });
  });
});

app.put('/compras/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  db.query('UPDATE compras SET estado = ? WHERE id = ?', [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar compra:', err);
      res.status(500).send('Error al actualizar compra');
      return;
    }
    res.json({ message: 'Compra actualizada exitosamente' });
  });
});

app.delete('/compras/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM compras WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar compra:', err);
      res.status(500).send('Error al eliminar compra');
      return;
    }
    res.json({ message: 'Compra eliminada exitosamente' });
  });
});

// Obtener todas las deudas
app.get('/deudas', (req, res) => {
  const { estado } = req.query;
  let query = `
    SELECT d.*, r.cliente, r.barrio 
    FROM deudas_clientes d 
    LEFT JOIN recorridos r ON d.recorrido_id = r.id
  `;
  
  if (estado) {
    query += ` WHERE d.estado_pago = '${estado}'`;
  }
  
  query += ' ORDER BY d.fecha_vencimiento ASC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener deudas:', err);
      res.status(500).send('Error al obtener deudas');
      return;
    }
    res.json(results);
  });
});

// Crear nueva deuda
app.post('/deudas', (req, res) => {
  const { recorrido_id, cantidad_garrafones, tipo_garrafon, monto_total, fecha_vencimiento, notas } = req.body;
  
  const query = `
    INSERT INTO deudas_clientes 
    (recorrido_id, cantidad_garrafones, tipo_garrafon, monto_total, fecha_vencimiento, notas)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, 
    [recorrido_id, cantidad_garrafones, tipo_garrafon, monto_total, fecha_vencimiento, notas], 
    (err, result) => {
      if (err) {
        console.error('Error al crear deuda:', err);
        res.status(500).send('Error al crear deuda');
        return;
      }
      
      // Enviar notificación
      db.query('SELECT cliente FROM recorridos WHERE id = ?', [recorrido_id], (err, recorridoResult) => {
        const cliente = recorridoResult[0]?.cliente || 'Cliente desconocido';
        const mensaje = `⚠️ Nueva deuda: ${cantidad_garrafones} garrafones para ${cliente}`;
        
        db.query('INSERT INTO notificaciones(mensaje) VALUES(?)', [mensaje], (err) => {
          if (err) console.error('Error al crear notificación:', err);
          
          notificaciones.emit("notificacion", { 
            tipo: "Nueva deuda", 
            mensaje: mensaje 
          });
        });
      });
      
      res.json({ id: result.insertId, message: 'Deuda creada exitosamente' });
  });
});

// Registrar pago
app.post('/deudas/:id/pagos', (req, res) => {
  const { id } = req.params;
  const { monto, metodo_pago, notas } = req.body;
  
  // 1. Registrar el pago
  const queryPago = `
    INSERT INTO pagos_clientes 
    (deuda_id, monto, metodo_pago, notas)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(queryPago, [id, monto, metodo_pago, notas], (err, result) => {
    if (err) {
      console.error('Error al registrar pago:', err);
      res.status(500).send('Error al registrar pago');
      return;
    }
    
    // 2. Actualizar la deuda
    const queryActualizar = 'UPDATE deudas_clientes SET monto_pagado = monto_pagado + ? WHERE id = ?';
    db.query(queryActualizar, [monto, id], (err, result) => {
      if (err) {
        console.error('Error al actualizar deuda:', err);
        res.status(500).send('Error al actualizar deuda');
        return;
      }
      
      // Enviar notificación
      db.query('SELECT cliente FROM recorridos r JOIN deudas_clientes d ON r.id = d.recorrido_id WHERE d.id = ?', [id], (err, deudaResult) => {
        const cliente = deudaResult[0]?.cliente || 'Cliente desconocido';
        const mensaje = `✅ Pago registrado: $${monto} de ${cliente}`;
        
        db.query('INSERT INTO notificaciones(mensaje) VALUES(?)', [mensaje], (err) => {
          if (err) console.error('Error al crear notificación:', err);
          
          notificaciones.emit("notificacion", { 
            tipo: "Pago registrado", 
            mensaje: mensaje 
          });
        });
      });
      
      res.json({ message: 'Pago registrado exitosamente' });
    });
  });
});
// Ruta GET para obtener todos los daños
app.get('/danos-garrafones', (req, res) => {
  const query = `
    SELECT d.*, r.cliente, r.barrio 
    FROM danos_garrafones d 
    LEFT JOIN recorridos r ON d.recorrido_id = r.id
    ORDER BY d.fecha_reporte DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener daños:', err);
      return res.status(500).json({ error: 'Error al obtener daños' });
    }
    res.json(results);
  });
});

// Ruta POST para crear nuevos reportes
app.post('/danos-garrafones', (req, res) => {
  const { recorrido_id, cantidad_danados, tipo_garrafon, tipo_dano, responsable, notas } = req.body;
  

  console.log("Reporte daños",req.body);
  
  // Validación básica
  if (!recorrido_id || !cantidad_danados) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const query = `
    INSERT INTO danos_garrafones 
    (recorrido_id, cantidad_danados, tipo_garrafon, tipo_dano, responsable, notas)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [recorrido_id, cantidad_danados, tipo_garrafon, tipo_dano, responsable, notas], 
    (err, result) => {
      if (err) {
        console.error('Error al crear reporte:', err);
        return res.status(500).json({ error: 'Error al crear reporte' });
      }
      res.json({ id: result.insertId });
  });
});

// Actualizar estado de daño
app.put('/danos-garrafones/:id', (req, res) => {
  const { id } = req.params;
  const { estado, monto_cobro, notas } = req.body;
  
  let query = 'UPDATE danos_garrafones SET estado = ?, notas = ?';
  const params = [estado, notas];
  
  if (estado === 'resuelto' || estado === 'cobrado') {
    query += ', fecha_resolucion = NOW()';
  }
  
  if (monto_cobro) {
    query += ', monto_cobro = ?';
    params.push(monto_cobro);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error al actualizar daño:', err);
      res.status(500).send('Error al actualizar daño');
      return;
    }
    
    // Enviar notificación si se resolvió o cobró
    if (estado === 'resuelto' || estado === 'cobrado') {
      db.query('SELECT cliente, tipo_dano FROM danos_garrafones WHERE id = ?', [id], (err, results) => {
        const cliente = results[0]?.cliente || 'Cliente desconocido';
        const tipoDano = results[0]?.tipo_dano || 'daño';
        const mensaje = `✅ Daño ${estado}: ${tipoDano} de ${cliente}`;
        
        db.query('INSERT INTO notificaciones(mensaje) VALUES(?)', [mensaje], (err) => {
          if (err) console.error('Error al crear notificación:', err);
          
          notificaciones.emit("notificacion", { 
            tipo: `Daño ${estado}`, 
            mensaje: mensaje 
          });
        });
      });
    }
    
    res.json({ message: 'Daño actualizado exitosamente' });
  });
});

app.post('/notificaciones/stock', async (req, res) => {
  try {
    const { producto_id, mensaje, tipo, stock_actual, stock_minimo } = req.body;
    
    const query = `
      INSERT INTO notificaciones 
      (mensaje, tipo, producto_id, stock_actual, stock_minimo, visto) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      mensaje, 
      tipo, 
      producto_id, 
      stock_actual, 
      stock_minimo, 
      false
    ]);
    
    const nuevaNotificacion = {
      id: result.insertId,
      mensaje,
      tipo,
      producto_id,
      stock_actual,
      stock_minimo,
      visto: false,
      fecha: new Date().toISOString()
    };

    io.emit('notificacion', nuevaNotificacion);
    res.status(201).json(nuevaNotificacion);
  } catch (error) {
    console.error('Error al guardar notificación de stock:', error);
    res.status(500).json({ error: 'Error al guardar notificación' });
  }
});
app.get('/notificaciones', async (req, res) => {
  try {
    const [notificaciones] = await pool.execute(
      'SELECT * FROM notificaciones ORDER BY fecha DESC'
    );
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});
// Endpoint para marcar una notificación como leída
app.patch('/notificaciones/:id/leer', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Actualizar en la base de datos
    const query = 'UPDATE notificaciones SET visto = TRUE WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al actualizar notificación' });
  }
});

// Endpoint para marcar todas las notificaciones como leídas
app.post('/notificaciones/marcar-todas-leidas', async (req, res) => {
  try {
    // Actualizar todas las notificaciones no leídas
    const query = 'UPDATE notificaciones SET visto = TRUE WHERE visto = FALSE';
    const [result] = await pool.execute(query);
    
    res.json({
      success: true,
      actualizadas: result.affectedRows
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ error: 'Error al actualizar notificaciones' });
  }
});

const PORT = 3000;
servidor.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

});
