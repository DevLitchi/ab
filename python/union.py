import os
import json

def combinar_datos_en_uno():
    # Diccionario para almacenar los datos combinados con el año como clave
    datos_combinados_total = {}
    json_dir = 'JSON'
    # Obtener la lista de archivos en la carpeta "JSON"
    archivos = os.listdir(json_dir)

    # Iterar sobre los archivos y combinar los datos
    for archivo in archivos:
        if archivo.startswith('datos_combinados_') and archivo.endswith('.json'):
            with open(os.path.join(json_dir, archivo), 'r', encoding='utf-8') as file:
                datos_año = json.load(file)
                datos_combinados_total.update(datos_año)  # Combina los datos del año actual con los datos totales

    # Escribir los datos combinados en un archivo único
    output_path = os.path.join(json_dir, 'datos_combinados_total.json')
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(datos_combinados_total, file, indent=4, ensure_ascii=False)

    # Eliminar los archivos datos_combinados_*
    for archivo in archivos:
        if archivo.startswith('datos_combinados_') and archivo.endswith('.json'):
            try:
                os.remove(os.path.join(json_dir, archivo))
                print(f"Archivo eliminado: {archivo}")
            except Exception as e:
                print(f"No se pudo eliminar el archivo {archivo}: {e}")

# Ejecutar la función para combinar los datos en un solo archivo
combinar_datos_en_uno()
