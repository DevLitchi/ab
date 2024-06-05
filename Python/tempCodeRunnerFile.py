import json
import pandas as pd

def combinar_datos_en_uno():
    # Cargar los datos del archivo JSON
    with open('datos_combinados_total.json', 'r', encoding='utf-8') as file:
        datos_combinados_total = json.load(file)

    # Crear una lista para almacenar los datos en el formato deseado
    data = []

    # Iterar sobre los datos combinados y agregarlos a la lista
    for año, datos_año in datos_combinados_total.items():
        for premio, categorias in datos_año.items():
            for categoria in categorias:
                for nominado in categoria['nominados']:
                    print(nominado)
                    data.append({
                        'Año': año,
                        'Premio': premio,
                        'Categoría': categoria['CATEGORIA'],
                        'ID': nominado['ID'],
                        'Sinopsis': nominado['Sinopsis'],
                        'Director': nominado['Director'],
                        'Producer': nominado['Producer'],
                        'Screenwriter': nominado['Screenwriter'],
                        'Genre': nominado['Genre'],
                        'Box Office (Gross USA)': nominado['Box Office (Gross USA)'],
                        'Runtime': nominado['Runtime']
                    })

    # Crear un DataFrame con los datos
    df = pd.DataFrame(data)

    # Escribir los datos en un archivo Excel
    df.to_excel('datos_combinados_total.xlsx', index=False)

# Ejecutar la función para combinar los datos y escribirlos en un archivo Excel
combinar_datos_en_uno()
