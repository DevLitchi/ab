const puppeteer = require('puppeteer'); // Importa el módulo puppeteer
const fs = require('fs').promises; // Importa el módulo fs para manejar archivos
const path = require('path'); // Para manejar las rutas de los archivos
function extractYear(dateStr) {
    // Supongamos que la fecha está en formato 'Month Day, Year' (por ejemplo, 'June 21, 2024')
    const yearMatch = dateStr.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1], 10) : null;
}
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
        Error: error.message,
        File: "Error en Adicional.js"
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

async function scrapeMovieData(titlesByYear, year) {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        const baseUrl = 'https://www.rottentomatoes.com/';

        for (const title of titlesByYear[year]) {
            try {
                //INICIO DE LA BÚSQUEDA DE DATOS DE LA PELÍCULA
                console.log(`Buscando datos para: ${title}`);
                await page.goto(baseUrl);

                // Esperar a que se cargue la página y la barra de búsqueda esté disponible
                await page.waitForSelector('input');

                // Escribir en la barra de búsqueda
                await page.type('input', title);

                // Enviar la búsqueda presionando Enter
                await page.keyboard.press('Enter');

                // Esperar un momento para que se procese la búsqueda
                await delay(3000);

                const yearExtracted = await page.evaluate(() => {
                    // Evalúa el código en el contexto de la página web
                
                    // Obtén todos los elementos search-page-media-row dentro de un ul
                    const mediaRows = document.querySelectorAll('ul > search-page-media-row');
                
                    // Array para almacenar los años de lanzamiento
                    const releaseYears = [];
                
                    // Itera sobre cada elemento mediaRow encontrado
                    mediaRows.forEach(mediaRow => { 
                        // Obtén el valor del atributo releaseyear de cada elemento mediaRow
                        const releaseYear = mediaRow.getAttribute('releaseyear');
                        
                //2015
                        if (releaseYear) { //Pasar a int = enteros
                            releaseYears.push(parseInt(releaseYear)); // Agrega el año como número entero al array
                        }
                    });
                
                    // Retorna el array con todos los años de lanzamiento
                    return releaseYears; 
                });
                
                // Suponiendo que yearExtracted es el array que contiene los años extraídos

                //Encuentra el año en el array, puede ser uno menos o uno más
                const año = yearExtracted.find(i => i == year || i == year - 1 || i == year + 1);
                const indexaño = yearExtracted.indexOf(año); //Encuentra el índice del año en el array



                let vu ;
                if (indexaño == 0) {
                    vu = 8;
                }else if (indexaño == 1) {
                    vu = 10;
                } else if (indexaño == 2) {
                    vu = 12;
                } else if (indexaño == 3) {
                    vu = 14;
                } else if (indexaño == 4) {
                    vu = 16;
                } else if (indexaño == 5) {
                    vu = 18;
                } else if (indexaño == 6) {
                    vu = 20;
                } else if (indexaño == 7){
                    vu = 22;
                } else if (indexaño == 8){
                    vu = 24;
                } else if (indexaño == 9){
                    vu = 26;
                } else if (indexaño == 10){
                    vu = 28;
                } else if (indexaño == 11){
                    vu = 30;
                } else if (indexaño == 12){
                    vu = 32;
                } else if (indexaño == 13){
                    vu = 34;
                }
                

                //vu = valor url



                // Obtener todos los enlaces con la clase .unset
                const links = await page.$$('.unset');
                // Hacer clic en el noveno enlace con clase .unset después de esperar a que aparezca
                if (links.length > vu) {
                    await links[vu].click();
                    console.log('Clic en el enlace realizado correctamente.');

                    // Esperar a que se complete la navegación a la nueva página
                    await page.waitForNavigation();

                    // Aquí agregamos el bloque de código para obtener los detalles de la película
                    await page.waitForSelector('.media-info', { timeout: 4000 });

                    // Obtener el texto de búsqueda como el título de la película
                    const titulo = title;

                    const sinopsis = await page.evaluate(() => {
                        const sinopsisElement = document.querySelector('.synopsis-wrap rt-text:last-of-type');
                        return sinopsisElement ? sinopsisElement.innerText.trim() : '';
                    });

                    const categoryWraps = await page.evaluate(() => {
                        const categoryWrapElements = document.querySelectorAll('.category-wrap');
                        const categories = {};
                        categoryWrapElements.forEach(categoryWrapElement => {
                            const key = categoryWrapElement.querySelector('.key').textContent.trim();
                            let value = categoryWrapElement.querySelector('dd').textContent.trim().replace(/\n/g, ' ');
                            value = value.replace(/\n/g, ' ').replace(/\s+/g, ' ');
                            categories[key] = value;
                        });
                        return categories;
                    });

                    // Crear objeto con los datos obtenidos
                    const datosPelicula = {
                        Titulo: titulo,
                        Sinopsis: sinopsis,
                        Categorias: categoryWraps
                    };

                    // Leer el archivo existente si existe
                    let contenidoExistente = {};
                    try {
                        const data = await fs.readFile(`JSON//DataEx_${year}.json`);
                        contenidoExistente = JSON.parse(data.toString());
                    } catch (error) {
                        // El archivo podría no existir todavía
                    }

                    // Agregar los nuevos datos al objeto existente (contenidoExistente)
                    if (!contenidoExistente[year]) {
                        contenidoExistente[year] = [];
                    }
                    contenidoExistente[year].push(datosPelicula);

                    // Escribir el nuevo contenido en el archivo JSON
                    await fs.writeFile(`JSON//DataEx_${year}.json`, JSON.stringify(contenidoExistente, null, 2));

                    console.log(`Datos agregados correctamente a DataEx_${year}.json.`);

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

// Función de espera personalizada usando setTimeout
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Main execution
(async () => {
    try {
        const files = await fs.readdir('JSON');   // Lee los archivos en el directorio JSON de forma asíncrona
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
    }
})();


