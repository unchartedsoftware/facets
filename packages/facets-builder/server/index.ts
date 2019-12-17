import express from 'express';
const app = express();
const port = 8090;

app.get('/', (req, res): any => res.send('Hello World!'));

app.listen(port, (): void => console.log(`Example app listening on port ${port}!`));
