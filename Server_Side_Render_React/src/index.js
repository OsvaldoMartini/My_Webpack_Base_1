const express = requeire('express');
const app = express();

app.get('/', (req, res) => {

});

app.listen(3000, () => {
    console.log('listening on port 3000');
});