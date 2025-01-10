const express = require('express')
const mysql = require('mysql2');
const app = express()
const port = 3000


app.use(express.json());


const connection = mysql.createConnection({
  host: '127.0.0.1',       
  user: 'root',            
  password: '',            
  database: 'songs',         
  port: 3306
});


connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar à base de dados:', err.message);
  } else {
    console.log('Conectado à base de dados MySQL!');
  }
});

const NOME_TABELA = "songs"

app.get('/api/songs', (req, res) => {
  const myQuery = `SELECT * FROM ${NOME_TABELA}`
  connection.query(myQuery, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao buscar música: ' + err.message);
    }
    res.json(results);
  });
  
});


app.post('/api/songs', (req, res) => {
  const title = req.body.title;
  const artist = req.body.artist;
  const album = req.body.album;
  const genre = req.body.genre;
  const duration_seconds = req.body.duration_seconds;
  const released_date = req.body.released_date;
  const likes = req.body.likes;

  if (!title || !artist || !genre || !duration_seconds || !released_date || !likes) {
    return res.status(400).send('Campos obrigatórios: title, artist, genre, duration_seconds, released_date, likes');
  }

  const query = `INSERT INTO ${NOME_TABELA} (title, artist, album, genre, duration_seconds, released_date, likes) VALUES ("${title}", "${artist}", "${album}", "${genre}", "${duration_seconds}","${released_date}", "${likes}" )`;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao adicionar música: ' + err.message);
    }
    res.status(200).send('Música adicionada com sucesso!');
  });
});


app.put('/api/songs/:id', (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const artist = req.body.artist;
  const album = req.body.album;
  const genre = req.body.genre;
  const duration_seconds = req.body.duration_seconds;
  const released_date = req.body.released_date;
  const likes = req.body.likes;

  const query = `UPDATE ${NOME_TABELA} SET title = "${title}", artist = "${artist}", album = "${album}", genre ="${genre}", duration_seconds ="${duration_seconds}", released_date ="${released_date}", likes ="${likes}" WHERE id = "${id}"`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao atualizar música: ' + err.message);
    }
    res.status(200).send('Música atualizada com sucesso!');
  });
});


app.delete('/api/songs/:id', (req, res) => {
  const id = req.params.id;

  const query = `DELETE FROM ${NOME_TABELA} WHERE id = ${id}`;

  connection.query(query, (err, results) => {
    
    if (err) {
      return res.status(500).send('Erro ao deletar música: ' + err.message);
    }
    res.status(200).send('Música removida com sucesso!');
  });
});

app.get('/api/songs/:id', (req, res) => {

  const id = req.params.id;
  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id = ${id}`;
  connection.query(myQuery, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao buscar música: ' + err.message);
    }
    res.json(results);
  });
  
});

let pricePerlike = 0.5;

app.get('/api/price', (req, res) => {

    res.json(
      {
      "price" : pricePerlike
      }
    );
  });



app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})