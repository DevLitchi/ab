import json
import os

# Ruta a la carpeta que contiene los archivos JSON
folder_path = 'JSON'

# Nombres de los archivos JSON
file_ex = 'DataEx.json'
file_ev = 'DataEv.json'

# Rutas completas a los archivos JSON
path_ex = os.path.join(folder_path, file_ex)
path_ev = os.path.join(folder_path, file_ev)

# Cargar el contenido de los archivos JSON
with open(path_ex, 'r') as file:
    data_ex = json.load(file)

with open(path_ev, 'r') as file:
    data_ev = json.load(file)

# Aquí puedes combinar los datos según tus necesidades.
# A continuación, se muestra un ejemplo básico que asume que ambos archivos contienen listas de diccionarios.

# Combinar los datos (esto depende de la estructura específica de tus archivos JSON)
combined_data = {
    'DataEx': data_ex,
    'DataEv': data_ev
}

# Guardar el JSON combinado en un nuevo archivo
combined_file_path = os.path.join(folder_path, 'CombinedData.json')

with open(combined_file_path, 'w') as file:
    json.dump(combined_data, file, indent=4)

print(f'Datos combinados guardados en {combined_file_path}')
