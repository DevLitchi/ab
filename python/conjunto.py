import os
import json

def combinar_datos(InfoEx, DataEv, año_inicio, año_fin):
    # Definir la ruta base para los archivos JSON
    json_dir = 'JSON'

    archivos_a_eliminar = []

    for año in range(año_inicio, año_fin + 1):
        # Nombre de los archivos para el año actual
        Info = os.path.join(json_dir, f'{InfoEx}_{año}.json')
        General = os.path.join(json_dir, f'{DataEv}_{año}.json')

        archivos_a_eliminar.extend([Info, General])

        # Verificar que los archivos existen
        if not os.path.exists(Info):
            print(f"Archivo no encontrado: {Info}")
            continue

        if not os.path.exists(General):
            print(f"Archivo no encontrado: {General}")
            continue

        try:
            # Cargar los datos de las películas
            with open(Info, 'r', encoding='utf-8') as file:
                peliculas_data = json.load(file)

            # Cargar los datos de los premios 
            with open(General, 'r', encoding='utf-8') as file:
                premios = json.load(file)

            # Combinar los datos
            for year, awards in premios.items():
                for award_name, nominees in awards.items():
                    for nominee in nominees:
                        for film in nominee['nominados']:
                            titulo = film['TITULO']
                            if titulo in peliculas_data:
                                film.update(peliculas_data[titulo])

            # Escribir los datos combinados en un nuevo archivo dentro de la carpeta "JSON"
            output_path = os.path.join(json_dir, f'datos_combinados_{año}.json')
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(premios, file, indent=4, ensure_ascii=False)

        except json.JSONDecodeError as e:
            print(f"Error al decodificar JSON en {año}: {e}")
        except Exception as e:
            print(f"Se produjo un error en el año {año}: {e}")

    # Eliminar los archivos InfoEx y DataEv
    for archivo in archivos_a_eliminar:
        if os.path.exists(archivo):
            try:
                os.remove(archivo)
            except Exception as e:
                print(f"Error al eliminar el archivo {archivo}: {e}")
# Inyectar los datos desde 2015 hasta 2024
combinar_datos('InfoEx', 'DataEv', 2015, 2024)
