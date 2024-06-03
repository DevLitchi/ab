import puppeteer from 'puppeteer';
import fs from 'fs';
//Contar el tiempo de ejecución
console.time("Tiempo de ejecución");


async function readJSONFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo JSON:', error);
        return null;
    }
}

async function replaceSpacesInTitle(title) {
    return title.replace(/\s+/g, '_').toLowerCase();
}

async function scrapeMovieData(title, year) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'es' });

    const titleFormatted = await replaceSpacesInTitle(title);

    const url2 = `https://www.rottentomatoes.com/m/${titleFormatted}_${year - 1}`;
    const url = `https://www.rottentomatoes.com/m/${titleFormatted}`;

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.media-info', { timeout: 10000 });

        // Extraer el título
        const titulo = await page.evaluate(() => {
            const tituloElement = document.querySelector('.header-wrap h2 rt-text');
            return tituloElement ? tituloElement.textContent.trim() : '';
        });

        // Extraer la sinopsis
        const sinopsis = await page.evaluate(() => {
            const sinopsisElement = document.querySelector('.synopsis-wrap rt-text:last-of-type');
            return sinopsisElement ? sinopsisElement.innerText.trim() : '';
        });

        // Estructurar la sinopsis
        const sinopsisObjeto = {
            "Sinopsis": sinopsis.replace(/\n/g, ' ')
        };

        // Extraer cada category-wrap con su contenido
        const categoryWraps = await page.evaluate(() => {
            const categoryWrapElements = document.querySelectorAll('.category-wrap');
            const categoryWrapsArray = [];
            categoryWrapElements.forEach(categoryWrapElement => {
                const titulo = categoryWrapElement.querySelector('.key').textContent.trim();
                let contenido = categoryWrapElement.querySelector('dd').textContent.trim().replace(/\n/g, ' ');
                // Reemplazar los saltos de línea con un espacio en todos los casos
                contenido = contenido.replace(/\n/g, ' ').replace(/\s+/g, ' ');

                categoryWrapsArray.push({ [titulo]: contenido });
            });
            return categoryWrapsArray;
        });

        // Consolidar toda la información en un solo objeto
        const datosPeliculas = {
            ...sinopsisObjeto,
            ...categoryWraps.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        };

        return datosPeliculas;
    } catch (error) {


        try {
            await page.goto(url2, { waitUntil: 'networkidle2' });

            // Extraer el título
            const titulo = await page.evaluate(() => {
                const tituloElement = document.querySelector('.header-wrap h2 rt-text');
                return tituloElement ? tituloElement.textContent.trim() : '';
            });

            // Extraer la sinopsis
            const sinopsis = await page.evaluate(() => {
                const sinopsisElement = document.querySelector('.synopsis-wrap rt-text:last-of-type');
                return sinopsisElement ? sinopsisElement.innerText.trim() : '';
            });

            // Estructurar la sinopsis
            const sinopsisObjeto = {
                "Sinopsis": sinopsis.replace(/\n/g, ' ')
            };

            // Extraer cada category-wrap con su contenido
            const categoryWraps = await page.evaluate(() => {
                const categoryWrapElements = document.querySelectorAll('.category-wrap');
                const categoryWrapsArray = [];
                categoryWrapElements.forEach(categoryWrapElement => {
                    const titulo = categoryWrapElement.querySelector('.key').textContent.trim();
                    let contenido = categoryWrapElement.querySelector('dd').textContent.trim().replace(/\n/g, ' ');
                    // Reemplazar los saltos de línea con un espacio en todos los casos
                    contenido = contenido.replace(/\n/g, ' ').replace(/\s+/g, ' ');

                    categoryWrapsArray.push({ [titulo]: contenido });
                });
                return categoryWrapsArray;
            });

            // Consolidar toda la información en un solo objeto
            const datosPeliculas = {
                ...sinopsisObjeto,
                ...categoryWraps.reduce((acc, curr) => ({ ...acc, ...curr }), {})
            };

            return datosPeliculas;
        } catch (error) {
            return null;
        }
    } finally {
        await browser.close();
    }

    // Tiempo de ejecución


}

async function extractMovieDataFromJSON(jsonFilePath) {
    const jsonData = await readJSONFromFile(jsonFilePath);
    if (!jsonData) return;

    const allMoviesData = {};

    for (const year in jsonData) {
        allMoviesData[year] = {};
        const titles = jsonData[year];

        for (const title of titles) {
            const movieData = await scrapeMovieData(title, parseInt(year));
            if (movieData) {
                allMoviesData[year][title] = movieData;
            }
        }
    }

    fs.writeFileSync('movies_data.json', JSON.stringify(allMoviesData, null, 2));
    console.timeEnd("Tiempo de ejecución");

}

// Ruta del archivo JSON
const jsonFilePath = 'titles_by_year.json';

// Extraer datos de películas del archivo JSON
extractMovieDataFromJSON(jsonFilePath);

