var mysql = require('mysql')

var pool = mysql.createPool({
  connectionLimit: 10,
  acquireTimeout: 28000,
  host: '45.84.205.51',
  port: 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})
pool.on('connection', function (connection) {
  console.log('DB CONNECTION ESTABLISHED')
  connection.on('error', function (err) {
    console.error('mySQL error', err.code)
    return
  })
})

function runSQL(query, callback) {
  return pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      throw err
    }
    connection.query(query, function (err, results) {
      connection.release()
      if (!err) {
        return callback(results)
      }
    })
    
  })
}

// connection.end();
module.exports = {
  runSQL,
}
