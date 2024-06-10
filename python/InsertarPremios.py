import os
import json

def insertarPremios():
    json_dir = 'JSON'
    
    # Construir las rutas completas de los archivos
    premios_peliculas_path = os.path.join(json_dir, 'premiosPeliculas.json')
    premios_actores_path = os.path.join(json_dir, 'premiosActores.json')
    datos_combinados_path = os.path.join(json_dir, 'datos_combinados_total.json')
    
    # Cargar datos de los premios de películas
    with open(premios_peliculas_path, 'r') as file:
        data = json.load(file)
    
    # Cargar datos de los premios de actores
    with open(premios_actores_path, 'r') as file:
        data3 = json.load(file)
    
    # Cargar datos de los premios a insertar
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
                    if titulo in data:
                        premios_info = data[titulo]
                        # Agregar la información de premios después del ID
                        film.update({'ID': titulo, 'Premios': premios_info})
                    elif titulo in data3:
                        premios_info = data3[titulo]
                        # Agregar la información de premios después del ID
                        film.update({'ID': titulo, 'Premios': premios_info})

    # Guardar los datos actualizados en un nuevo archivo JSON dentro de la carpeta JSON
    resultado_final_path = os.path.join(json_dir, 'resultado_final.json')
    with open(resultado_final_path, 'w') as file:
        json.dump(data2, file, indent=4, ensure_ascii=False)

# Ejemplo de uso
insertarPremios()
