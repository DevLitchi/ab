import readline from "readline";
import { scrapeo } from "./NewF.js";
import { procesarDatosPeliculas } from "./a.js";

// Pedir rango de años
async function rangoAños() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Ingrese el año de inicio: ', async (inicio) => {
    rl.question('Ingrese el año de fin: ', async (fin) => {
      rl.close();
      await scrapeo(inicio, fin); // Esperar que scrapeo termine antes de cerrar la interfaz
      await procesarDatosPeliculas(); // Llamar a procesarDatosPeliculas después de que scrapeo haya terminado
    });
  });

}

// Llamar a la función rangoAños
rangoAños();
