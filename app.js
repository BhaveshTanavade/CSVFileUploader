import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import csv from "csv-parser";


const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Route to handle CSV file upload
app.post('/upload', upload.single('csvFile'), (req, res) => {
  if (req.file && path.extname(req.file.originalname) === '.csv') {
    res.send({ filename: req.file.filename });
  } else {
    res.status(400).send('Please upload a valid CSV file.');
  }
});

// Route to get the list of uploaded files
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files');
    }
    res.send(files)
    // .filter(file => path.extname(file) === '.csv'));
  });
});

// Route to get the data of a specific CSV file
app.get('/file/:filename', (req, res) => {
  const results = [];
  fs.createReadStream(path.join('uploads', req.params.filename))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.send(results);
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});