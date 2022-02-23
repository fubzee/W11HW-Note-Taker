const express = require('express');
const path = require('path');
const fs = require('fs');
let notes = require (`./db/db.json`);
const uuid = require('./helpers/uuid');
const { Console } = require('console');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/index.html'))
);

//GET request for notes
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/notes.html'))
);

app.get('/api/notes', (req, res) => 
{
    const content = fs.statSync(`./db/db.json`)
    console.log('file size=', content.size);
    if (content.size !== 0)
    {
        fs.readFile(`./db/db.json`,`utf8`, (err,note) =>
        {
            if (err) 
            {
                console.error(err);
                return;
            }
            try 
            {
                console.log(`notes`,notes);
                res.status(201).json(notes);
            }
            catch (err) 
            {
                console.log("Error parsing JSON string:", err);
            }
        })
    }
});

app.post('/api/notes', (req, res) => 
{
    const { id, title, text } = req.body;

    if (title && text) 
    {
        const newNote = 
        {
            id: uuid(),
            title,
            text,
        };

        notes.push(newNote);

        const NoteString = JSON.stringify(notes); 

        fs.writeFile(`./db/db.json`,NoteString, err => 
        {
            if (err) 
            {
                console.log('Error writing file', err)
            }
            else
            {
                console.log(`Successfully created JSON file`)
            }
        });

        const response = 
        {
            status: 'success',
            body: newNote,
        };
       
    res.status(201).json(response);
    }    
}
);

app.delete('/api/notes/:id', (req, res) => 
{
    const id =  req.params.id; 

    if (id)
    {
        for (i=0; i <notes.length; i++)
        {
            if (notes[i].id == '')   
            {
                 console.log(`Notes[i]`, notes[i], `id`, id);
            } 
            else 
            {
                if (notes[i].id === id )
                {
                    notes.splice(i,1);
                    const NoteString = JSON.stringify(notes);
                    fs.writeFile(`./db/db.json`,NoteString, err =>
                    {
                        if (err) 
                        {
                            console.log('Error writing file', err)
                        }
                        else
                        {
                            console.log(`Successfully created JSON file`)
                        }
                    })
                
                    const response = 
                        {
                            status: 'success',
                        };
                    res.status(201).json(response);
                }
            };  
        }
    }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
