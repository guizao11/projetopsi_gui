const express = require('express')

const mysql = require('mysql2');
const app = express()
const port = 3000


app.use(express.json());

app.set('view engine', 'ejs');

const connection = mysql.createConnection({
  host: '127.0.0.1',       
  user: 'root',            
  password: '',            
  database: 'songsa',         
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
      return res.status(404).send('Erro ao apagar música: ' + err.message);
    }
    res.status(200).send('Música removida com sucesso!');
  });
});

app.get('/api/songs/:id', (req, res) => {

  const id = req.params.id;
  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id = ${id}`;
  connection.query(myQuery, (err, results) => {
    if (err) {
      return res.status(404).send('Erro ao buscar música: ' + err.message);
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

  app.put('/api/price', (req, res) => {
    if (pricePerlike !=null ){
     pricePerlike=req.body.price;
     res.sendStatus(200)
    }else{
     res.sendStats(400)
    }
   });


   app.get('/api/songs/:id/revenue', (req, res) => {
    const id = req.params.id;
    const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id = ${id}`;
    connection.query(myQuery, (err, results) => {
      if (err) {
        return res.status(404).send('Erro ao buscar a receita: ' + err.message);
      }
      res.json({"Receita dos likes": pricePerlike*results[0].likes});
    });
  });

const bands = [
  {
    "artist": "Poze do Rodo",
    "band_members": ["Poze do Rodo"]
  },
  {
    "artist": "Queen",
    "band_members":[ "Freddie Mercury",
                      "Brian May",
                      "Roger Taylor",
                      "Jonh Deacon"]
  },
  {
    "artist": "Adele",
    "band_members": ["Adele"]
  }
]

app.get('/api/songs/:id/band', (req, res) => {    
  const id = req.params.id;  
  const myQuery = `SELECT artist FROM ${NOME_TABELA} WHERE id = ${id}`;
connection.query(myQuery, (err, results) => {

  if (err) {
      return res.status(404).send('Erro a aceder à base de dados: ' + err.message);
  }
  for (let i = 0 ; i < bands.length; i++){
    const artist=results[0].artist;
      if (results[0].artist==bands[i].artist){
     return res.json(bands[i])
      }
  }
  return res.status(404).send('Erro ao encontrar os membros da banda: ');
});

});

app.post('/api/songs/:id/band', (req, res) => {
  const band_members = req.band_members;
  const myQuery = `SELECT artist FROM ${NOME_TABELA} WHERE id = ${req.params.id}`;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(404).send('Erro ao adicionar artista e membros da banda: ' + err.message);
    }
  }); 
  const artist= results[0].artist;
  const newBand= {
    "artist": "", 
    "band_members": band_members
  }
  band_members.push (newBand);
});

app.put('/api/songs/:id/band', (req, res) => {
const myQuery = `SELECT artist FROM ${NOME_TABELA} WHERE id = ${req.params.id}`;
connection.query(myQuery, (err, results) => {

  if (err) {
      return res.status(500).send('Erro a aceder à base de dados: ' + err.message);
  }
  for (let i= 0; i < bands.length; i++){
    if (bands[i].artist == results[0].artist) {
      bands[i].band_members = req.body.band_members
      return res.status(200).send("Membros da banda atualizados")    
    }
  }
  res.status(404).send("Membros da banda não atualizados")

});
});

app.delete('/api/songs/:id/band' , (req,res) => {


});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
});