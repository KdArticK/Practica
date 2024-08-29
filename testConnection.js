const { Connection, Request } = require('tedious');
const config = require('./config');

const connection = new Connection(config);

connection.on('connect', err => {
  if (err) {
    console.error('Error de conexión:', err);
  } else {
    console.log('Conectado a SQL Server');
    
    // Ejecutar una consulta de prueba
    const request = new Request('SELECT 1 AS result', (err, rowCount) => {
      if (err) {
        console.error('Error en la consulta:', err);
      } else {
        console.log('Consulta ejecutada con éxito');
      }
    });

    request.on('row', columns => {
      columns.forEach(column => {
        console.log(column.value);
      });
    });

    connection.execSql(request);
  }
});

connection.on('error', err => {
  console.error('Error en la conexión:', err);
});

connection.on('end', () => {
  console.log('Conexión cerrada');
});
