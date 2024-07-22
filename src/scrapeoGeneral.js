const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Función para registrar errores en un archivo JSON
async function logError(error, event, year) {
    let erroresExistentes = {};

    try {
        const data = await fs.readFile('Errores//errores.json');
        erroresExistentes = JSON.parse(data.toString());
    } catch (err) {
        // El archivo podría no existir todavía
    }

    if (!erroresExistentes[year]) {
        erroresExistentes[year] = {};
    }

    erroresExistentes[year][event.name] = {
        Error: error.message,
        File: `Error en scrapeo.js`
    };

    await fs.writeFile('Errores//errores.json', JSON.stringify(erroresExistentes, null, 2));
}

// Función para realizar el scraping de eventos por año
async function scrapeo(year) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });

    const eventos = [
        { id: 'ev0000123', name: 'BAFTA Awards' },
        { id: 'ev0000133', name: 'Critics Choice Awards' },
        { id: 'ev0000003', name: 'Oscar' },
        { id: 'ev0000212', name: 'Directors Guild of America, USA' },
        { id: 'ev0000292', name: 'Golden Globes, USA' },
        { id: 'ev0000598', name: 'Screen Actors Guild Awards' }
    ];

    let allNominations = {};

    for (let event of eventos) {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en'
        });

        const eventURL = `https://www.imdb.com/event/${event.id}/${year}/1/`;

        try {
            await page.goto(eventURL, { waitUntil: 'networkidle2' });
            await page.waitForSelector('[class="event-widgets__nomination-details"]', { timeout: 10000 });

            const nominados = await page.evaluate(() => {
                const a = document.querySelectorAll('.event-widgets__award-categories');
                const b = Array.from(a[0].children);
                const arra = [];

                for (let item of b) {
                    const categoria = {};
                    categoria.CATEGORIA = item.querySelector('.event-widgets__award-category-name').innerText.trim();
                    categoria.nominados = [];
                    categoria.GANADOR = "";

                    const nominaciones = item.querySelectorAll('.event-widgets__award-nomination');
                    for (let nominacion of nominaciones) {
                        const nominado = {};
                        nominado.ID = nominacion.querySelector('.event-widgets__nominee-name a').href.split('/')[4].split('?')[0];
                        nominado.URL = nominacion.querySelector('.event-widgets__nominee-name a').href.split('?')[0];
                        nominado.PREMIOS = nominado.URL + "awards";
                        nominado.TITULO = nominacion.querySelector('.event-widgets__nominee-name a').innerText.trim();
                        categoria.nominados.push(nominado);

                        const winnerBadge = nominacion.querySelector('.event-widgets__winner-badge');
                        if (winnerBadge) {
                            categoria.GANADOR = nominado.TITULO;
                        }

                        const posterImage = nominacion.querySelector('.event-widgets__nominee-image-poster');
                        if (posterImage) {
                            nominado.poster = posterImage.src;
                        }
                    }

                    arra.push(categoria);
                }

                return arra;
            });

            if (nominados.length > 0) {
                if (!(year in allNominations)) {
                    allNominations[year] = {};
                }
                allNominations[year][event.name] = nominados;
            }

            await page.close();
        } catch (error) {
            console.error(`Error en el evento ${event.name} del año ${year}: ${error}`);
            await logError(error, event, year);
            await page.close();
        }
    }

    try {
        const jsonData = JSON.stringify(allNominations, null, 2);
        const filePath = path.join('JSON', `DataEv_${year}.json`);
        await fs.writeFile(filePath, jsonData);
    } catch (error) {
        console.error(`Error al escribir en el archivo JSON para el año ${year}:`, error);
    } finally {
        await browser.close();
    }
}

// Proceso principal
(async () => {
    try {
        // Recibir argumentos desde la línea de comandos
        const args = process.argv.slice(2); // Los dos primeros son 'node' y 'scrapeoGeneral.js'

        if (args.length !== 2) {
            throw new Error('Debe proporcionar exactamente dos años como argumentos (inicio y fin del rango).');
        }

        const startYear = parseInt(args[0]);
        const endYear = parseInt(args[1]);

        if (isNaN(startYear) || isNaN(endYear)) {
            throw new Error('Los valores proporcionados deben ser años enteros válidos.');
        }

        if (startYear > endYear) {
            throw new Error('El año de inicio no puede ser mayor que el año final.');
        }

        for (let year = startYear; year <= endYear; year++) {
            await scrapeo(year);
        }
    } catch (error) {
        console.error('Error general durante la ejecución del scraping:', error);
        process.exit(1); // Salir con código de error
    }
})();