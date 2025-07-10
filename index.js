const novax = require('novaxjs2');
const app = new novax();
app.serveStatic();
app.get('/', (req, res) => app.sendFile('./public/index.html', res));
app.at(3000, () => console.log('Server is running on port 3000'))