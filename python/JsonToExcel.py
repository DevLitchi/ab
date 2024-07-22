import json
import pandas as pd

def combinar_datos_en_uno():
    # Conjunto de categorías permitidas
    movie_categories = {
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
        "Best Adapted Screenplay",
        "Best Original Screenplay",
        "Best Special Visual Effects",
        "Outstanding Debut by a British Writer, Director or Producer",
        "Best British Short Animation",
        "Best British Short Film",
        "Best Visual Effects",
        "Best Art Direction",
        "Best Hair & Makeup",
        "Best Song",
        "Best Score",
        "Best Documentary Feature",
        "Best Foreign Language Film",
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
        "Best Short Film, Animated",
        "Best Short Film, Live Action",
        "Best Documentary, Short Subject",
        "Best Motion Picture - Drama",
        "Best Motion Picture - Comedy or Musical",
        "Best Performance by an Actress in a Motion Picture - Drama",
        "Best Performance by an Actor in a Motion Picture - Drama",
        "Best Performance by an Actress in a Supporting Role in a Motion Picture",
        "Best Performance by an Actor in a Motion Picture - Comedy or Musical",
        "Best Performance by an Actor in a Supporting Role in a Motion Picture",
        "Best Director - Motion Picture",
        "Best Performance by an Actress in a Motion Picture - Comedy or Musical",
        "Best Screenplay - Motion Picture",
        "Best Original Score - Motion Picture",
        "Best Original Song - Motion Picture"
    }

    # Cargar los datos del archivo JSON
    with open('JSON/resultado_final.json', 'r', encoding='utf-8') as file:
        datos_combinados_total = json.load(file)

    # Crear listas para almacenar los datos en el formato deseado
    data_total = []
    ids_vistos = set()

    # Iterar sobre los datos combinados y agregarlos a las listas correspondientes
    for año, datos_año in datos_combinados_total.items():
        for premio, categorias in datos_año.items():
            for categoria in categorias:
                if categoria['CATEGORIA'] in movie_categories:
                    ganador = categoria.get('GANADOR', None)
                    for nominado in categoria['nominados']:
                        # Verificar si se proporciona información adicional
                        if 'ID' in nominado and nominado['ID'].startswith('tt'):
                            if nominado['ID'] not in ids_vistos:
                                ids_vistos.add(nominado['ID'])

                                # Extraer el año de la fecha de estreno en cines y en streaming
                                release_theaters = nominado.get('Release Date (Theaters)', '')
                                release_streaming = nominado.get('Release Date (Streaming)', '')

                                release_year_theaters = release_theaters.split(',', 1)[-1].split(',')[0].strip() if ',' in release_theaters else ''
                                release_year_streaming = release_streaming.split(',', 1)[-1].split(',')[0].strip() if ',' in release_streaming else ''

                                sinopsis = nominado.get('Sinopsis', '')

                                # Agregar a la lista solo si falta sinopsis o año de lanzamiento en cines
                                if not sinopsis or not release_year_theaters:
                                    data_total.append({
                                        'Año': año,
                                        'Release Year (Theaters)': release_year_theaters,
                                        'Release Year (Streaming)': release_year_streaming,
                                        'Premio': premio,
                                        'ID': nominado['ID'],
                                        'Categoría': categoria['CATEGORIA'],
                                        'TITULO': nominado['TITULO'],
                                        'Sinopsis': sinopsis,
                                        'Director': nominado.get('Director', ''),
                                        'Producer': nominado.get('Producer', ''),
                                        'Screenwriter': nominado.get('Screenwriter', ''),
                                        'Genre': nominado.get('Genre', ''),
                                        'Box Office (Gross USA)': nominado.get('Box Office (Gross USA)', ''),
                                        'Runtime': nominado.get('Runtime', ''),
                                        'Ganador': nominado['TITULO'] == ganador,
                                        'PREMIOS': nominado.get('Premios', '')
                                    })
    # Crear DataFrames con los datos
    df_total = pd.DataFrame(data_total)

    # Escribir los datos en un archivo Excel con varias hojas
    with pd.ExcelWriter('db/DBS.xlsx') as writer:
        df_total.to_excel(writer, sheet_name='Peliculas', index=False)

# Ejecutar la función para combinar los datos y escribirlos en un archivo Excel
combinar_datos_en_uno()
