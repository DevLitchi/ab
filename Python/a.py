import os
import json

def combinar_datos(datos_peliculas, datos_bafta, año_inicio, año_fin):
    # Crear la carpeta "test" si no existe
    if not os.path.exists('test'):
        os.makedirs('test')

    for año in range(año_inicio, año_fin + 1):
        # Nombre de los archivos para el año actual
        peliculas_file = f'{datos_peliculas}_{año}.json'
        bafta_file = f'{datos_bafta}_{año}.json'

        # Cargar los datos de las películas y los premios BAFTA
        with open(peliculas_file, 'r', encoding='utf-8') as file:
            peliculas_data = json.load(file)
        
        with open(bafta_file, 'r', encoding='utf-8') as file:
            bafta_data = json.load(file)

        # Combinar los datos
        for year, awards in bafta_data.items():
            for award_name, nominees in awards.items():
                for nominee in nominees:
                    for film in nominee['nominados']:
                        titulo = film['TITULO']
                        if titulo in peliculas_data:
                            film.update(peliculas_data[titulo])

        # Escribir los datos combinados en un nuevo archivo dentro de la carpeta "test"
        with open(os.path.join('test', f'datos_combinados_{año}.json'), 'w', encoding='utf-8') as file:
            json.dump(bafta_data, file, indent=4, ensure_ascii=False)

# Inyectar los datos desde 2015 hasta 2024
combinar_datos('datosPeliculas', 'test', 2015, 2024)
#hace de los 2 uno solo