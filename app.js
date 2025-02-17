const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const app = express()

const port = 3011
const NOME_TABELA = "songs"

app.use(express.json());

app.set('view engine', 'ejs');
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})

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


let pricePerLike = 0.4

const bands = [
                {
                  "artist": "Ed Sheeran",
                  "band_members": ["Ed Sheeran"]
                }, 
                {
                  "artist": "Queen",
                  "band_members": ["Freddie Mercury", "Brian May", "Roger Taylor", "John Deacon"]
                },
                {
                  "artist": "Adele",
                  "band_members": ["Adele"]
                },
                {
                  "artist": "Systems of a Down",
                  "band_members": ["Serj Tankian", "Daron Malakian", "Shavo Odadjian", "John Dolmayan"]
                }, 
              ]


app.get('/api/songs', (req, res) => {


  const urlQuery = req.query;

 
  let myQuery = `SELECT * FROM ${NOME_TABELA}`

  
  if(urlQuery.genre){
    myQuery = `SELECT * FROM ${NOME_TABELA} WHERE genre = "${urlQuery.genre}"`;
  } 
  
  if(urlQuery.artist){
    myQuery = `SELECT * FROM ${NOME_TABELA} WHERE artist = "${urlQuery.artist}"`;
  }
    
  if(urlQuery.genre && urlQuery.artist) {
    myQuery = `SELECT * FROM ${NOME_TABELA} WHERE genre = "${urlQuery.genre}" AND artist = "${urlQuery.artist}"`;
  }

  if (urlQuery.likes && urlQuery.op === 'above') {
    myQuery = `SELECT * FROM ${NOME_TABELA} WHERE likes > ${urlQuery.likes}`;
  } else if (urlQuery.likes && urlQuery.op === 'below') {
    myQuery = `SELECT * FROM ${NOME_TABELA} WHERE likes < ${urlQuery.likes}`;
  } else if (urlQuery.likes && urlQuery.op === 'equal') {
    myQuery = `SELECT * FROM ${NOME_TABELA} WHERE likes = ${urlQuery.likes}`;
  }
  
  connection.query(myQuery, (err, results) => {

      if (err) {
        return res.status(500).send('Erro ao buscar músicas: ' + err.message);
      }

      res.json(results);
  });
  
});


app.post('/api/songs', (req, res) => {

  const {title, artist, album, genre, duration_seconds, released_date, likes} = req.body;

  if (!title || !artist) {
    return res.status(400).send('Campos obrigatórios: title, artist');
  }

  const query = `INSERT INTO ${NOME_TABELA} (title, artist, album, genre, duration_seconds, released_date, likes) VALUES ("${title}", "${artist}", "${album}", "${genre}", "${duration_seconds}", "${released_date}", "${likes}")`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao adicionar música: ' + err.message);
    }
    res.sendStatus(200);
  });
});


app.put('/api/songs/:id', (req, res) => {
  const id = req.params.id;


  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  }

  const {title, artist, album, genre, duration_seconds, released_date, likes} = req.body;

  if (!title || !artist) {
    return res.status(400).send('Campos obrigatórios: title, artist');
  }

  const query = `UPDATE ${NOME_TABELA} SET title = "${title}", artist = "${artist}", album = "${album}", genre = "${genre}", duration_seconds = "${duration_seconds}", released_date = "${released_date}", likes = "${likes}" WHERE id = "${id}"`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao atualizar música: ' + err.message);
    }
    res.sendStatus(200);
  });
});

app.delete('/api/songs/:id', (req, res) => {
  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  }

  const query = `DELETE FROM ${NOME_TABELA} WHERE id = ${id}`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao remover música: ' + err.message);
    }
    res.send('Música removida com sucesso!');
  });
});


app.get('/api/songs/:id', (req, res) => {

  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  }

  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id=${id};`

  connection.query(myQuery, (err, results) => {
      if (err) {
        return res.status(500).send('Erro ao buscar música: ' + err.message);
      }

      if (results.length == 0) {
        return res.status(404).send('Música não encontrada');
      }

      res.json(results);
  });
  
});


app.get('/api/price', (req, res) => {
  res.json({price: pricePerLike});  
});

app.put('/api/price', (req, res) => {

  if (!req.body.price) {
    return res.status(400).send('Preço por like não foi fornecido');
  } else if (isNaN(req.body.price)) {
    return res.status(400).send('Preço por like deve ser um número');
  } else if (req.body.price < 0) {
    return res.status(400).send('Preço por like deve ser um número positivo');
  }

  pricePerLike = req.body.price

  res.sendStatus(200);  
});

app.get('/api/songs/:id/revenue', (req, res) => {

  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  }

  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id=${id};`

  connection.query(myQuery, (err, results) => {
      if (err) {
        return res.status(500).send('Erro ao buscar música: ' + err.message);
      }

      if (results.length == 0) {
        return res.status(404).send('Música não encontrada');
      }

      res.json({revenue: results[0].likes*pricePerLike});
  });
  
});

app.get('/api/songs/:id/band', (req, res) => {

  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  } 

  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id=${id};`

  connection.query(myQuery, (err, results) => {

      if (err) {
        return res.status(500).send('Erro ao buscar músicas: ' + err.message);
      }

      if (results.length > 0) {

        const artist = results[0].artist;

        for (let band of bands) {

          if (band.artist == artist) {
            return res.json({"artist": band.artist, "band_members": band.band_members});
          }

        }
        return res.status(404).send('Não encontrado membros de bandas para o artista: ' + results[0].artist);
      } else {
        res.status(404).send('Música não foi encontrada: ' + id);
      }
  });
});

app.post('/api/songs/:id/band', (req, res) => {

    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).send('ID da música não é válido');
    } 

    const band_members = req.body.band_members;

    if (!Array.isArray(band_members) || band_members.length === 0) {
      return res.status(400).json({ error: 'Band members should be an array and cannot be empty' });
    }

    const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id=${id};`
  
    connection.query(myQuery, (err, results) => {
  
        if (err) {
          return res.status(500).send('Erro ao buscar músicas: ' + err.message);
        }
  
        if (results.length > 0) {
  
          const artist = results[0].artist;
  
          for (let band of bands) {

            if (band.artist == artist) {
              return res.status(400).send('Banda já existe para o artista: ' + results[0].artist);
            }
          }

          bands.push({"artist": artist, "band_members": band_members});
          return res.status(200).send('Banda adicionada com sucesso para o artista: ' + artist);
        } else {
          res.status(404).send('Música não foi encontrada: ' + id);
        }
    });
});


app.put('/api/songs/:id/band', (req, res) => {

  const id = req.params.id;
  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  } 

  const band_members = req.body.band_members;
  if (!Array.isArray(band_members) || band_members.length === 0) {
    return res.status(400).json({ error: 'Band members should be an array and cannot be empty' });
  }

  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id=${id};`

  connection.query(myQuery, (err, results) => {

      if (err) {
        return res.status(500).send('Erro ao buscar músicas: ' + err.message);
      }
      if (results.length > 0) {
        const artist = results[0].artist;
        for (let band of bands) {
          if (band.artist == artist) {
            band.band_members = band_members;

            return res.status(200).send('Banda atualizada com sucesso para o artista: ' + artist);
          }
        }

        return res.status(404).send('Não encontrado membros de bandas para o artista: ' + results[0].artist);
      } else {
        res.status(404).send('Música com o seguinte id não foi encontrada: ' + id);
      }
  });

});

app.delete('/api/songs/:id/band', (req, res) => {

  const id = req.params.id;

  if (!id || isNaN(id)) {
    return res.status(400).send('ID da música não é válido');
  } 

  const myQuery = `SELECT * FROM ${NOME_TABELA} WHERE id=${id};`

  connection.query(myQuery, (err, results) => {

      if (err) {
        return res.status(500).send('Erro ao buscar músicas: ' + err.message);
      }

      if (results.length > 0) {

        const artist = results[0].artist;

        for (let i = 0; i < bands.length; i++) {

          if (bands[i].artist == artist) {

            bands.splice(i, 1);

            return res.status(200).send('Banda removida com sucesso para o artista: ' + artist);
          }
        }
        return res.status(404).send('Não foi encontrado membros de bandas para o artista: ' + results[0].artist);
      } else {
        res.status(404).send('Música com o este id não foi encontrada: ' + id);
      }
  });

});

app.post('/api/songs/bulk', (req, res) => {
  const newSongs = req.body;

  if (!Array.isArray(newSongs) || newSongs.length === 0) {
    return res.status(400).json({ error: 'Songs should be an array and cannot be empty' });
  }

  for(let i = 0; i < newSongs.length; i++) {
    
    const {title, artist, album, genre, duration_seconds, released_date, likes} = newSongs[i];

    if (!title || !artist) {
      return res.status(400).send('Campos obrigatórios: title, artist');
    }

    const query = `INSERT INTO ${NOME_TABELA} (title, artist, album, genre, duration_seconds, released_date, likes) VALUES ("${title}", "${artist}", "${album}", "${genre}", "${duration_seconds}", "${released_date}", "${likes}")`;

    connection.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Erro ao adicionar música: ' + err.message);
      }
    });
  }

  res.status(201).send('Músicas adicionadas com sucesso!');
});

app.get('/', (req,res) => {
    res.render("index")
});

app.get('/songs', (req,res) => {
  res.render("songs")
});

app.get('/new-song', (req,res) => {
  res.render("new-song")
});

app.get('/price', (req,res) => {
  res.render("price", {price:pricePerLike})
});

app.get('/index', (req,res) => {
  res.render("index")
});

app.post('/new-song', (req,res) => {


});