import os
import json

def combinar_datos_en_uno():
    # Diccionario para almacenar los datos combinados con el año como clave
    datos_combinados_total = {}

    # Obtener la lista de archivos en la carpeta "JSON_RT&IMDB"
    archivos = os.listdir('JSON_RT&IMDB')

    # Iterar sobre los archivos y combinar los datos
    for archivo in archivos:
        if archivo.startswith('datos_combinados_') and archivo.endswith('.json'):
            año = archivo.split('_')[-1].split('.')[0]  # Extraer el año del nombre del archivo
            with open(os.path.join('JSON_RT&IMDB', archivo), 'r', encoding='utf-8') as file:
                datos_año = json.load(file)
                datos_combinados_total.update(datos_año)  # Combina los datos del año actual con los datos totales

    # Escribir los datos combinados en un archivo único
    with open('datos_combinados_total.json', 'w', encoding='utf-8') as file:
        json.dump(datos_combinados_total, file, indent=4, ensure_ascii=False)

# Ejecutar la función para combinar los datos en un solo archivo
combinar_datos_en_uno()


#Junta todos los datos en uno solo