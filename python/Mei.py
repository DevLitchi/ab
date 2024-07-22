import subprocess
import tkinter as tk
from tkinter import messagebox

def ejecutarScrapeoNominaciones():
    try:
        proceso = subprocess.Popen(['node', 'src//scrapeoNominaciones.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = proceso.communicate()
        if stderr:
            messagebox.showerror("Error", f'Error en la ejecución del script de Node.js: {stderr}')
        else:
            messagebox.showinfo("Éxito", f'Salida del script de Node.js: {stdout}')
    except Exception as e:
        messagebox.showerror("Error", f'Error al ejecutar el script de Node.js: {str(e)}')

def ejecutarScrapeoExtra():
    try:
        proceso = subprocess.Popen(['node', 'src//scrapeoAdicional.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = proceso.communicate()
        if stderr:
            messagebox.showerror("Error", f'Error en la ejecución del script de Node.js: {stderr}')
        else:
            messagebox.showinfo("Éxito", f'Salida del script de Node.js: {stdout}')
    except Exception as e:
        messagebox.showerror("Error", f'Error al ejecutar el script de Node.js: {str(e)}')

def ejecutarScrapeo():
    try:
        desde_anio = int(entry_desde_anio.get())
        hasta_anio = int(entry_hasta_anio.get())
        proceso = subprocess.Popen(['node', 'src//scrapeoGeneral.js', str(desde_anio), str(hasta_anio)], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = proceso.communicate()
        if stderr:
            messagebox.showerror("Error", f'Error en la ejecución del script de Node.js: {stderr}')
        else:
            messagebox.showinfo("Éxito", f'Salida del script de Node.js: {stdout}')
        
        ejecutarScrapeoExtra()
        ejecutarScrapeoNominaciones()
    except ValueError:
        messagebox.showerror("Error", "Por favor, escribe un número entero válido para los años.")
    except Exception as e:
        messagebox.showerror("Error", f'Error al ejecutar el script de Node.js: {str(e)}')

root = tk.Tk()
root.title("Interfaz de Scraping")

tk.Label(root, text="Año de inicio:").grid(row=0, column=0)
entry_desde_anio = tk.Entry(root)
entry_desde_anio.grid(row=0, column=1)

tk.Label(root, text="Año de fin:").grid(row=1, column=0)
entry_hasta_anio = tk.Entry(root)
entry_hasta_anio.grid(row=1, column=1)

tk.Button(root, text="Ejecutar Scraping", command=ejecutarScrapeo).grid(row=2, columnspan=2)

root.mainloop()
