import os
import json

def insertarPremios(datos_combinados, Nominaciones, año_inicio, año_fin):
    json_dir = 'JSON'
    
    # Crear un diccionario para almacenar todos los datos de nominaciones de cada año
    nominaciones_totales = {}
    
    # Cargar datos de nominaciones desde año_inicio hasta año_fin
    for año in range(año_inicio, año_fin + 1):
        Nominaciones_path = os.path.join(json_dir, f'{Nominaciones}_{año}.json')
        with open(Nominaciones_path, 'r') as file:
            data = json.load(file)
            nominaciones_totales.update(data)
    
    # Construir la ruta completa del archivo de datos combinados
    datos_combinados_path = os.path.join(json_dir, f'{datos_combinados}.json')
    
    # Cargar datos combinados
    with open(datos_combinados_path, 'r') as file:
        data2 = json.load(file)

    # Recorrer los premios a insertar
    for year, awards in data2.items():
        # Recorrer las categorías de los premios
        for award_name, nominees in awards.items():
            # Recorrer los nominados de cada categoría
            for nominee in nominees:
                # Recorrer las películas nominadas
                for film in nominee['nominados']:
                    titulo = film['ID']
                    if titulo in nominaciones_totales:
                        premios_info = nominaciones_totales[titulo]
                        # Agregar la información de premios después del ID
                        film.update({'ID': titulo, 'Premios': premios_info})
                    
    # Guardar los datos actualizados en un nuevo archivo JSON dentro de la carpeta JSON
    resultado_final_path = os.path.join(json_dir, 'resultado_final.json')
    with open(resultado_final_path, 'w') as file:
        json.dump(data2, file, indent=4, ensure_ascii=False)

# Ejemplo de uso
insertarPremios('datos_combinados_total', 'Nominaciones', 2015, 2024)
