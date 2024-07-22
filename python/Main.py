import subprocess
def ejecutarScrapeoNominaciones():
    try:
        # Comando para ejecutar un script de Node.js desde la línea de comandos
        # Añadimos los años como argumentos al script de Node.js
        proceso = subprocess.Popen(['node', 'src//scrapeoNominaciones.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Capturar la salida estándar y de error
        stdout, stderr = proceso.communicate()
        
        # Verificar si hubo errores
        if stderr:
            print(f'Error en la ejecución del script de Node.js: {stderr}')
        else:
            print(f'Salida del script de Node.js: {stdout}')
    
    except Exception as e:
        print(f'Error al ejecutar el script de Node.js: {str(e)}')

def ejecutarScrapeoExtra():
    try:
        # Comando para ejecutar un script de Node.js desde la línea de comandos
        # Añadimos los años como argumentos al script de Node.js
        proceso = subprocess.Popen(['node', 'src//scrapeoAdicional.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Capturar la salida estándar y de error
        stdout, stderr = proceso.communicate()
        
        # Verificar si hubo errores
        if stderr:
            print(f'Error en la ejecución del script de Node.js: {stderr}')
        else:
            print(f'Salida del script de Node.js: {stdout}')
    
    except Exception as e:
        print(f'Error al ejecutar el script de Node.js: {str(e)}')

def ejecutarScrapeo(desde_anio, hasta_anio):
    try:
        # Comando para ejecutar un script de Node.js desde la línea de comandos
        # Añadimos los años como argumentos al script de Node.js
        proceso = subprocess.Popen(['node', 'src//scrapeoGeneral.js', str(desde_anio), str(hasta_anio)], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Capturar la salida estándar y de error
        stdout, stderr = proceso.communicate()
        
        # Verificar si hubo errores
        if stderr:
            print(f'Error en la ejecución del script de Node.js: {stderr}')
        else:
            print(f'Salida del script de Node.js: {stdout}')
    
    except Exception as e:
        print(f'Error al ejecutar el script de Node.js: {str(e)}')

def lee_entero(mensaje):
    while True:
        try:
            entrada = int(input(mensaje))
            return entrada
        except ValueError:
            print("La entrada es incorrecta. Por favor, escribe un número entero válido.")

# Solicitar los años de inicio y fin al usuario
TRY_AGAIN = True
while TRY_AGAIN:
    try:
        desde_anio = lee_entero('Ingrese el año de inicio: ')
        hasta_anio = lee_entero('Ingrese el año de fin: ')
        TRY_AGAIN = False
    except ValueError:
        print("La entrada es incorrecta. Por favor, escribe un número entero válido.")


# Llamar a la función ejecutar con los años proporcionados
ejecutarScrapeo(desde_anio, hasta_anio)
print("Scrapeo de años completado")
ejecutarScrapeoExtra()
print("Scrapeo de datos adicionales completado")
ejecutarScrapeoNominaciones()
print("Scrapeo de nominaciones completado")

#Cuando se termine de ejecutar el script de Node.js, se comenzará a ejecutar otro script de Node.js que se encargará de procesar los datos obtenidos.



