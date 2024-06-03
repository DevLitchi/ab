import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeo(inicio, fin) {
    return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null
    });
    const eventoanormal = { id: 'ev0000710', name: 'Writers Guild of America, USA' };
    const directorioEventos = [
        { id: 'ev0000123', name: 'BAFTA Awards' },
        { id: 'ev0000133', name: 'Critics Choice Awards' },
        { id: 'ev0000003', name: 'Oscar' },
        { id: 'ev0000212', name: 'Directors Guild of America, USA' },
        { id: 'ev0000292', name: 'Golden Globes, USA' },
        { id: 'ev0000598', name: 'Screen Actors Guild Awards' }
    ];

    let allNominations = {};

    for (let YearAct = inicio; YearAct <= fin; YearAct++) {
        for (let event of directorioEventos) {
            const page = await browser.newPage();
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en'
            });
            const eventURL = `https://www.imdb.com/event/${event.id}/${YearAct}/1/`;
            try {
                await page.goto(eventURL, { waitUntil: 'networkidle2' });
                await page.waitForSelector('[class="event-widgets__nomination-details"]', { timeout: 5000 });

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
                    if (!(YearAct in allNominations)) {
                        allNominations[YearAct] = {};
                    }
                    allNominations[YearAct][event.name] = nominados;
                }

                await page.close();
            } catch (error) {
                console.error(`Error en el evento ${event.name} del año ${YearAct}: ES PROBABLE QUE LA PAGINA NO ESTE EN FUNCIONAMIENTO`);
                console.error(error);
                await page.close();
            }
        }
    }

    fs.writeFileSync(`test.json`, JSON.stringify(allNominations, null, 2));
    await browser.close();
    resolve();
}
)};

const movieCategories = new Set([
    "Best Film",
    "Best Cinematography",
    "Best Editing",
    "Best Production Design",
    "Best Costume Design",
    "Best Original Music",
    "Best Make Up & Hair",
    "Best Sound",
    "Best Film Not in the English Language",
    "Best Animated Feature Film",
    "Best Documentary",
    "Outstanding Debut by a British Writer, Director or Producer",
    "Best British Short Animation",
    "Best British Short Film",
    "Best Adapted Screenplay",
    "Best Original Screenplay",
    "Best Special Visual Effects",
    "Outstanding British Contribution to Cinema",
    "Best Picture",
    "Best Art Direction",
    "Best Visual Effects",
    "Best Hair & Makeup",
    "Best Song",
    "Best Score",
    "Best Documentary Feature",
    "Best Foreign Language Film",
    "Best Animated Feature",
    "Best Action Movie",
    "Best Comedy Movie",
    "Best Sci-Fi/Horror Movie",
    "Best Motion Picture of the Year",
    "Best Achievement in Directing",
    "Best Writing, Original Screenplay",
    "Best Writing, Adapted Screenplay",
    "Best Achievement in Cinematography",
    "Best Achievement in Film Editing",
    "Best Achievement in Production Design",
    "Best Achievement in Costume Design",
    "Best Achievement in Makeup and Hairstyling",
    "Best Achievement in Music Written for Motion Pictures, Original Song",
    "Best Achievement in Music Written for Motion Pictures, Original Score",
    "Best Achievement in Sound Mixing",
    "Best Achievement in Sound Editing",
    "Best Achievement in Visual Effects",
    "Best Short Film, Animated",
    "Best Short Film, Live Action",
    "Best Documentary, Short Subject",
    "Best Documentary, Feature",
    "Best Foreign Language Film of the Year",
    "Best Animated Feature Film of the Year",
    "Outstanding Directorial Achievement in Feature Film",
    "Outstanding Performance by a Cast in a Motion Picture",
    "Outstanding Action Performance by a Stunt Ensemble in a Motion Picture"
]);

async function extractTitlesByYear(data) {
    const titlesByYear = {};

    for (const year in data) {
        const awards = data[year];
        titlesByYear[year] = new Set();

        for (const awardName in awards) {
            const nominees = awards[awardName];
            nominees.forEach(category => {
                if (movieCategories.has(category.CATEGORIA)) { // Filtrar solo las categorías de películas
                    category.nominados.forEach(nominee => {
                        if (nominee.ID && nominee.ID.startsWith('tt') && nominee.TITULO) {
                            titlesByYear[year].add(nominee.TITULO);
                        }
                    });
                }
            });
        }

        // Convertir Set a Array
        titlesByYear[year] = Array.from(titlesByYear[year]);
    }
    console.log(titlesByYear);
    return titlesByYear; // Devolver un objeto con los títulos por año (cada año es una propiedad) y los títulos son un array de strings únicos     
}

async function procesarDatosPeliculas() {
    console.time("Tiempo de ejecución");

    async function replaceSpacesInTitle(title) {
        return title.replace(/\s+/g, '_').toLowerCase();
    }

    async function scrapeMovieData(title, year) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await
        browser.newPage();
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'es' });

        const titleFormatted = await replaceSpacesInTitle(title);
        const urls = [
            `https://www.rottentomatoes.com/m/${titleFormatted}`,
            `https://www.rottentomatoes.com/m/${titleFormatted}_${year - 1}`
        ];

        let datosPeliculas = null;

        for (const url of urls) {
            try {
                await page.goto(url, { waitUntil: 'networkidle2' });
                await page.waitForSelector('.media-info', { timeout: 4000 });

                const titulo = await page.evaluate(() => {
                    const tituloElement = document.querySelector('.header-wrap h2 rt-text');
                    return tituloElement ? tituloElement.textContent.trim() : '';
                });

                const sinopsis = await page.evaluate(() => {
                    const sinopsisElement = document.querySelector('.synopsis-wrap rt-text:last-of-type');
                    return sinopsisElement ? sinopsisElement.innerText.trim() : '';
                });

                const categoryWraps = await page.evaluate(() => {
                    const categoryWrapElements = document.querySelectorAll('.category-wrap');
                    const categoryWrapsArray = [];
                    categoryWrapElements.forEach(categoryWrapElement => {
                        const titulo = categoryWrapElement.querySelector('.key').textContent.trim();
                        let contenido = categoryWrapElement.querySelector('dd').textContent.trim().replace(/\n/g, ' ');
                        contenido = contenido.replace(/\n/g, ' ').replace(/\s+/g, ' ');

                        categoryWrapsArray.push({ [titulo]: contenido });
                    });
                    return categoryWrapsArray;
                });

                const sinopsisObjeto = { "Sinopsis": sinopsis.replace(/\n/g, ' ') };
                datosPeliculas = { ...sinopsisObjeto, ...categoryWraps.reduce((acc, curr) => ({ ...acc, ...curr }), {}) };

                break; // Si llega aquí, la información se ha extraído con éxito, así que rompemos el bucle
            } catch (error) {
                continue; // Si hay un error, continuamos con la siguiente URL
            }
        }

        await browser.close();
        return datosPeliculas;
    }

    async function extraerdatosdeArray(titlesByYear) {
        const allMoviesData = {};

        for (const year in titlesByYear) {
            allMoviesData[year] = {};
            const titles = titlesByYear[year];

            for (const title of titles) {
                const movieData = await scrapeMovieData(title, parseInt(year));
                if (movieData) {
                    allMoviesData[year][title] = movieData;
                }
            }
        }
        //Crear un archivo JSON con los datos de las películas extraídas 
        fs.writeFileSync('datosPeliculas.json', JSON.stringify(allMoviesData, null, 2));        
        console.timeEnd("Tiempo de ejecución");
    }

    // Llamar a la función para extraer datos de películas del archivo JSON
    const ruta = 'test.json';
    fs.readFile(ruta, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            const titlesByYear = await extractTitlesByYear(jsonData);
            await extraerdatosdeArray(titlesByYear);
        } catch (parseError) {
            console.error('Error al parsear el archivo JSON:', parseError);
        }
    });
}

// Llamar a la función para procesar los datos de películas

async function main() {
    await scrapeo(2015, 2024);
    await procesarDatosPeliculas();
}

main();