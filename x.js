import express from 'express';
import { scrapeo } from './NewF.js';
import { procesarDatosPeliculas } from './a.js';
import fs from 'fs';

const app = express();
const PORT = 3000;

async function waitForFiles() {
  const archivosEsperados = ['test.json', 'titles_by_year.json'];
  let archivosExistentes = 0;
  
  while (archivosExistentes < archivosEsperados.length) {
    archivosExistentes = archivosEsperados.reduce((total, archivo) => {
      return fs.existsSync(archivo) ? total + 1 : total;
    }, 0);

    if (archivosExistentes < archivosEsperados.length) {
      console.log('Esperando a que los archivos necesarios estén disponibles...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

app.get('/', async (req, res) => {
  try {
    await scrapeo(2015, 2024);
    console.log('Scrapeo completado exitosamente.');
    await waitForFiles();
    await procesarDatosPeliculas();
    console.log('Procesamiento de datos de películas completado.');
    res.send('Procesamiento de datos de películas completado.');
  } catch (error) {
    console.error('Ocurrió un error:', error);
    res.status(500).send('Error en el servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// import { scrapeo } from './NewF.js';
// import { procesarDatosPeliculas } from './a.js';
// //Esperar hasta que se complete el scrapeo de los datos
// await scrapeo(2015,2015);



// await procesarDatosPeliculas();




// //Procesar los datos de las películas
// //Fin del archivo