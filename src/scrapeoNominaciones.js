const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const movieCategories = new Set([
    "Outstanding Performance by a Cast in a Motion Picture",
    "Outstanding Action Performance by a Stunt Ensemble in a Motion Picture",
    "Best Motion Picture of the Year",
    "Best Original Screenplay",
    "Best Adapted Screenplay",
    "Best Achievement in Cinematography",
    "Best Achievement in Film Editing",
    "Best Achievement in Production Design",
    "Best Achievement in Costume Design",
    "Best Sound",
    "Best Achievement in Makeup and Hairstyling",
    "Best Achievement in Music Written for Motion Pictures (Original Score)",
    "Best Achievement in Music Written for Motion Pictures (Original Song)",
    "Best Achievement in Visual Effects",
    "Best Animated Feature Film",
    "Best International Feature Film",
    "Best Picture",
    "Best Original Screenplay",
    "Best Adapted Screenplay",
    "Best Cinematography",
    "Best Costume Design",
    "Best Editing",
    "Best Visual Effects",
    "Best Hair & Makeup",
    "Best Song",
    "Best Score",
    "Best Foreign Language Film",
    "Best Acting Ensemble",
    "Best Comedy Movie",
    "Best Production Design",
    "Best Animated Feature",
    "Best Film",
    "Outstanding British Film of the Year",
    "Best Screenplay (Original)",
    "Best Screenplay (Adapted)",
    "Best Film Not in the English Language",
    "Best Animated Feature Film",
    "Original Score",
    "Best Casting",
    "Best Cinematography",
    "Best Editing",
    "Best Production Design",
    "Best Costume Design",
    "Best Make Up & Hair",
    "Best Sound",
    "Best Achievement in Special Visual Effects",
    "Best Motion Picture, Drama",
    "Best Motion Picture, Musical or Comedy",
    "Best Motion Picture, Animated",
    "Cinematic and Box Office Achievement",
    "Best Motion Picture, Non-English Language",
    "Best Screenplay, Motion Picture",
    "Best Original Score, Motion Picture",
    "Best Original Song, Motion Picture"
]);

async function logError(error, year, title) {
    let erroresExistentes = {};
    try {
        const data = await fs.readFile('Errores//errores.json');
        erroresExistentes = JSON.parse(data.toString());
    } catch (err) {
        // El archivo podría no existir todavía
    }

    if (!erroresExistentes[year]) {
        erroresExistentes[year] = [];
    }

    erroresExistentes[year].push({
        title,
        error: error.message,
        clave: "Error en Nominaciones.js"
    });

    await fs.writeFile('Errores//errores.json', JSON.stringify(erroresExistentes, null, 2));
}

async function extractTitlesByYear(data) {
    const titlesByYear = {};

    for (const year in data) {
        const awards = data[year];
        titlesByYear[year] = new Set();

        for (const awardName in awards) {
            const nominees = awards[awardName];
            nominees.forEach(category => {
                if (movieCategories.has(category.CATEGORIA)) {
                    category.nominados.forEach(nominee => {
                        if (nominee.ID && nominee.ID.startsWith('tt') && nominee.TITULO) {
                            titlesByYear[year].add(nominee.TITULO);
                        }
                    });
                }
            });
        }

        titlesByYear[year] = Array.from(titlesByYear[year]);
        console.log(`Año ${year}: ${titlesByYear[year].length} películas extraídas`);
    }
    console.log("Datos de películas extraídos con éxito.");
    console.log(titlesByYear);

    return titlesByYear;
}

async function waitForSelectorWithRetry(page, selector, retries = 3, timeout = 60000) {
    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { timeout });
            return;
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            console.warn(`Retry ${i + 1}/${retries} for selector: ${selector}`);
        }
    }
}

async function scrapeMovieData(titlesByYear, year) {
    const browser = await puppeteer.launch({ headless: false, protocolTimeout: 120000 });
    try {
        const page = await browser.newPage();
        const baseUrl = 'https://www.imdb.com/';
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });

        for (const title of titlesByYear[year]) {
            try {
                console.log(`Buscando datos para: ${title}`);
                await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 120000 });

                await waitForSelectorWithRetry(page, '.imdb-header-search__input', 3, 120000);
                await page.type('.imdb-header-search__input', title);
                await page.keyboard.press('Enter');
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 });

                const links = await page.$$('.ipc-metadata-list-summary-item');
                if (links.length > 0) {
                    await links[0].click();
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 });

                    const titulo = await page.evaluate(() => {
                        const tituloElement = document.querySelector('span.ipc-metadata-list-item__list-content-item');
                        return tituloElement ? tituloElement.textContent.trim() : 'Elemento no encontrado';
                    });

                    const datosPelicula = { Titulo: title, Nominaciones: titulo };

                    let contenidoExistente = {};
                    try {
                        const data = await fs.readFile(`JSON//Nominaciones_${year}.json`);
                        contenidoExistente = JSON.parse(data.toString());
                    } catch (error) {
                        // El archivo podría no existir todavía
                    }

                    if (!contenidoExistente[year]) {
                        contenidoExistente[year] = [];
                    }
                    contenidoExistente[year].push(datosPelicula);

                    await fs.writeFile(`JSON//Nominaciones_${year}.json`, JSON.stringify(contenidoExistente, null, 2));

                    console.log(`Datos agregados correctamente a Nominaciones_${year}.json.`);
                } else {
                    throw new Error('No se encontraron suficientes enlaces.');
                }
            } catch (error) {
                console.error(`Error al procesar "${title}":`, error);
                await logError(error, year, title);
            }
        }
    } catch (error) {
        console.error('Error durante la ejecución del script:', error);
    } finally {
        await browser.close();
    }
}

(async () => {
    try {
        const files = await fs.readdir('JSON');
        for (const file of files) {
            if (file.startsWith('DataEv') && file.endsWith('.json')) {
                const year = file.match(/\d+/)[0];
                const data = JSON.parse(await fs.readFile(path.join('JSON', file)));
                const titlesByYear = await extractTitlesByYear(data);
                await scrapeMovieData(titlesByYear, year);
            }
        }
    } catch (error) {
        console.error('Error al leer o procesar los archivos JSON:', error);
        await logError(error, 'General', 'Procesamiento de archivos JSON');
    }
})();