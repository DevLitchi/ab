import puppeteer from 'puppeteer';
import readline from 'readline';
import fs from 'fs';
//FUNCIONES GENERALES PARA QUE PRIMERAMENTE EL SCRAPEADOR EXTRAIGA INFOMACION DE LOS NOMINADOS Y GANADORES DE LOS EVENTOS DE CINE
//QUEDA RESOLVER LOS PROBLEMAS DEL EVENTO ANORMAL QUE ES EL DE LOS ESCRITORES DE AMERICA CON ID: ev0000710
//LA SEGUNDA FUNCION ES PARA EXTRAER DEL JSON LOS TITULOS Y URLS DE LAS PELICULAS NOMINADAS Y GANADORAS DE LOS EVENTOS DE CINE
//ESTO CON EL FIN DE CON OTRA FUNCION EXTRAER LA INFORMACION DE CADA PELICULA DESDE ROTTEN TOMATOES SE EXTRAERA
//LA INFORMACION DE LA PELICULA COMO LO ES EL GENERO, DURACION, DIRECTOR, GANANCIAS, ETC.
//DESPUES DE ESO, SE VOLVERA A INGRESAR LA INFORMACION DE LA PELICULA EN EL JSON PARA QUE EN UN SOLO JSON SE ENCUENTRE TODA LA INFORMACION CON EL FORMATO
//AÑO: {EVENTO: {CATEGORIA: {NOMINADOS: {TITULO: {INFORMACION DE LA PELICULA}}}}}

export async function scrapeo(inicio, fin) {
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
        await page.waitForSelector('[class="event-widgets__nomination-details"]', { timeout: 100000 });

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
  all();
}


export function rangoAños() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Ingrese el año de inicio: ', (inicio) => {
    rl.question('Ingrese el año de fin: ', async (fin) => {
      rl.close();
      await scrapeo(inicio, fin);
    });
  });
}
export async function extraerInfoPeliculas() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null
  });
  

}
export function all() {
  function extractTitlesByYear(data) {
    const titlesByYear = {};

    for (const year in data) {
      const awards = data[year];
      titlesByYear[year] = new Set();

      for (const awardName in awards) {
        const nominees = awards[awardName];
        nominees.forEach(category => {
          category.nominados.forEach(nominee => {
            if (nominee.ID && nominee.ID.startsWith('tt') && nominee.TITULO) {
              titlesByYear[year].add(nominee.TITULO);
            }
          });
        });
      }

      // Convert Set to Array
      titlesByYear[year] = Array.from(titlesByYear[year]);
    }

    return titlesByYear;
  }
  const ruta = 'test.json';

  // Leer el archivo JSON
  fs.readFile(ruta, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return;
    }

    try {
      // Parsear el JSON
      const jsonData = JSON.parse(data);

      // Extraer los títulos agrupados por año
      const titlesByYear = extractTitlesByYear(jsonData);

      // Crear un nuevo archivo JSON con los títulos agrupados por año
      const outputData = JSON.stringify(titlesByYear, null, 2);
      fs.writeFile('titles_by_year.json', outputData, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error al escribir el archivo:', writeErr);
          return;
        }
        console.log('Títulos agrupados por años guardados en titles_by_year.json');
      });

    } catch (parseError) {
      console.error('Error al parsear el JSON:', parseError);
    }
  });
}