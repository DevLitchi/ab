const puppeteer = require('puppeteer');
const fs = require('fs');

async function obtenerIdsUnicos() {
    console.log("Obteniendo IDs únicos...");
    const jsonData = fs.readFileSync('C:/Codigos/ProyectoFinal/PROYECTO ROBERTO/JSON_AIO/a.json');
    const data = JSON.parse(jsonData);
    const uniqueIds = new Set();

    for (const year in data) {
        const awards = data[year];
        for (const awardName in awards) {
            const nominees = awards[awardName];
            for (const nominee of nominees) {
                const id = nominee.nominados[0].ID;
                if (id.startsWith('nm')) {
                    uniqueIds.add(id);
                }
            }
        }
    }
    
    // Display total number of IDs and unique IDs
    console.log("Total de IDs:", Array.from(uniqueIds).length);
    console.log("Total de IDs únicos:", uniqueIds.size);

    return Array.from(uniqueIds);
}

async function scrapeMovieData(title, year) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });

    const page = await browser.newPage();
    
    // Establece el agente de usuario para emular un navegador real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');

    // Aumenta el tiempo de espera de navegación
    await page.setDefaultNavigationTimeout(30000); // Aumenta el tiempo de espera a 30 segundos

    const url = `https://www.imdb.com/name/${title}/awards/`;

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' }); // Espera el evento DOMContentLoaded

        // Espera a que un elemento específico esté presente antes de evaluar
        await page.waitForSelector('.ipc-signpost--accent1', { timeout: 10000 });

        const titulo = await page.evaluate(() => {
            const tituloElement = document.querySelector('.ipc-signpost--accent1');
            return tituloElement ? tituloElement.textContent.trim() : 'Elemento no encontrado';
        });
        console.log(titulo);
        return titulo;
    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await browser.close();
    }
}

async function procesarDatosPeliculas() {
    console.log("Procesando datos de películas...");
    console.time("Tiempo de ejecución");

    const uniqueIds = await obtenerIdsUnicos();
    const movieData = {};

    for (const movieTitle of uniqueIds) {
        movieData[movieTitle] = await scrapeMovieData(movieTitle, ''); // De momento no usamos el año
    }

    console.timeEnd("Tiempo de ejecución");

    // Escribe los datos de las películas en un archivo JSON
    const outputPath = 'C:/Codigos/ProyectoFinal/PROYECTO ROBERTO/resultadoActores.json';
    fs.writeFileSync(outputPath, JSON.stringify(movieData, null, 2));

    console.log("Datos de películas almacenados en:", outputPath);
}

procesarDatosPeliculas();
