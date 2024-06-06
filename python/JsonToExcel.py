import json
import pandas as pd

def combinar_datos_en_uno():
    # Cargar los datos del archivo JSON
    with open('resultado_final.json', 'r', encoding='utf-8') as file:
        datos_combinados_total = json.load(file)

    # Crear listas para almacenar los datos en el formato deseado
    data_tt = []
    data_nm = []
    data_er = []
    data_winners = []

    # Iterar sobre los datos combinados y agregarlos a las listas correspondientes
    for año, datos_año in datos_combinados_total.items():
        for premio, categorias in datos_año.items():
            for categoria in categorias:
                ganador = categoria.get('GANADOR', None)
                for nominado in categoria['nominados']:
                    # Verificar si se proporciona información adicional
                    if 'ID' in nominado:
                        if nominado['ID'].startswith('tt'):
                            # Extraer el año de la fecha de estreno en cines y en streaming
                            release_theaters = nominado.get('Release Date (Theaters)', '')
                            release_streaming = nominado.get('Release Date (Streaming)', '')

                            release_year_theaters = release_theaters.split(',', 1)[-1].split(',')[0].strip() if ',' in release_theaters else ''
                            release_year_streaming = release_streaming.split(',', 1)[-1].split(',')[0].strip() if ',' in release_streaming else ''

                            sinopsis = nominado.get('Sinopsis', '')
                            if not sinopsis:
                                data_er.append({
                                    'Año': año,
                                    'Premio': premio,
                                    'Categoría': categoria['CATEGORIA'],
                                    'TITULO': nominado['TITULO'],
                                    'ID': nominado['ID'],
                                    'Mensaje': 'La sinopsis no está disponible'
                                })
                                continue

                            if not release_year_theaters and not release_year_streaming:
                                data_er.append({
                                    'Año': año,
                                    'Premio': premio,
                                    'Categoría': categoria['CATEGORIA'],
                                    'TITULO': nominado['TITULO'],
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
                                continue

                            data_tt.append({
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
                            if nominado['TITULO'] == ganador:
                                data_winners.append({
                                    'Año': año,
                                    'Premio': premio,
                                    'Categoría': categoria['CATEGORIA'],
                                    'TITULO': nominado['TITULO'],
                                    'ID': nominado['ID'],
                                    'PREMIOS': nominado.get('Premios', '')
                                })
                        elif nominado['ID'].startswith('nm'):
                            # Considerar también los actores como posibles ganadores
                            data_nm.append({
                                'ID': nominado['ID'],
                                'Año': año,
                                'Premio': premio,
                                'Categoría': categoria['CATEGORIA'],
                                'TITULO': nominado['TITULO'],
                                'Ganador': nominado['TITULO'] == ganador,
                                'PREMIOS': nominado.get('Premios', '')
                            })
                            if nominado['TITULO'] == ganador:
                                data_winners.append({
                                    'Año': año,
                                    'Premio': premio,
                                    'Categoría': categoria['CATEGORIA'],
                                    'TITULO': nominado['TITULO'],
                                    'ID': nominado['ID'],
                                    'PREMIOS': nominado.get('Premios', '')
                                })
                    else:
                        data_er.append({
                            'Año': año,
                            'Premio': premio,
                            'Categoría': categoria['CATEGORIA'],
                            'TITULO': nominado['TITULO'],
                            'ID': nominado['ID'],
                            'Release Date (Theaters)' : nominado.get('Release Date (Theaters)', ''),
                            'Release Date (Streaming)': nominado.get('Release Date (Streaming)', ''),
                            'Mensaje': 'No se pudo conseguir la información'
                        })

    # Crear DataFrames con los datos
    df_tt = pd.DataFrame(data_tt)
    df_nm = pd.DataFrame(data_nm)
    df_er = pd.DataFrame(data_er)
    df_winners = pd.DataFrame(data_winners)

    # Escribir los datos en un archivo Excel con varias hojas
    with pd.ExcelWriter('DB.xlsx') as writer:
        df_tt.to_excel(writer, sheet_name='Peliculas', index=False)
        df_nm.to_excel(writer, sheet_name='Actores', index=False)
        df_er.to_excel(writer, sheet_name='Errores', index=False)
        df_winners.to_excel(writer, sheet_name='Ganadores', index=False)

# Ejecutar la función para combinar los datos y escribirlos en un archivo Excel
combinar_datos_en_uno()
