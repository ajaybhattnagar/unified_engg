import tkinter as tk
from tkinter import filedialog, messagebox, ttk, messagebox 
# import mysql.connector
import json
from sqlalchemy import create_engine
import math
import pandas as pd
import numpy as np
from functions import upload_parcels, update_parcels, upload_subs

with open ('config.json') as f:
    configData = json.load(f)


engine = create_engine(configData['engine_url'])

# initalise the tkinter GUI
root = tk.Tk()
root.title("SDA Application")
root.iconbitmap(r'favicon.ico')


root.geometry("800x400") # set the root dimensions
root.pack_propagate(False) # tells the root to not let the widgets inside it determine its size.
root.resizable(0, 0) # makes the root window fixed in size.

# Frame for TreeView
frame1 = tk.LabelFrame(root, text="Excel Data")
frame1.place(height=250, width=790)

# Frame for open file dialog
file_frame = tk.LabelFrame(root, text="Open File")
file_frame.place(height=100, width=790, rely=0.65, relx=0)

# Checkboxes
upload_check = tk.IntVar()
check1 = tk.Checkbutton(file_frame, text="Upload", variable=upload_check,)
check1.place(rely=0.20, relx=0.10)

edit_check = tk.IntVar()
check2 = tk.Checkbutton(file_frame, text="Edit", variable=edit_check)
check2.place(rely=0.20, relx=0.30)

subs_upload_check = tk.IntVar()
check3 = tk.Checkbutton(file_frame, text="Upload Subs", variable=subs_upload_check)
check3.place(rely=0.20, relx=0.50)


# Buttons
button2 = tk.Button(file_frame, text="Browse", command=lambda: File_dialog())
button2.place(rely=0.60, relx=0.0)

button1 = tk.Button(file_frame, text="Load", command=lambda: load_excel_data())
button1.place(rely=0.60, relx=0.10)

button3 = tk.Button(file_frame, text="Run", command=lambda: run())
button3.place(rely=0.60, relx=0.20)

button4 = tk.Button(file_frame, text="Clear", command=lambda: clear_app())
button4.place(rely=0.60, relx=0.30)


# The file/file path text
label_file = ttk.Label(file_frame, text="No File Selected")
label_file.place(rely=0, relx=0)


## Treeview Widget
tv1 = ttk.Treeview(frame1)
tv1.place(relheight=1, relwidth=1) # set the height and width of the widget to 100% of its container (frame1).


treescrolly = tk.Scrollbar(frame1, orient="vertical", command=tv1.yview) # command means update the yaxis view of the widget
treescrollx = tk.Scrollbar(frame1, orient="horizontal", command=tv1.xview) # command means update the xaxis view of the widget
tv1.configure(xscrollcommand=treescrollx.set, yscrollcommand=treescrolly.set) # assign the scrollbars to the Treeview Widget
treescrollx.pack(side="bottom", fill="x") # make the scrollbar fill the x axis of the Treeview widget
treescrolly.pack(side="right", fill="y") # make the scrollbar fill the y axis of the Treeview widget


def File_dialog():
    """This Function will open the file explorer and assign the chosen file path to label_file"""
    filename = filedialog.askopenfilename(initialdir="/",
                                          title="Select A File",
                                          filetype=(("xlsx files", "*.xlsx"),("All Files", "*.*")))
    label_file["text"] = filename
    return None

def ifnull(var, val):
    if not var:
        return val
    return var

def ifinf(var, val):
    if math.isinf(var):
        return val
    return var

def load_excel_data():
    clear_data()
    """If the file selected is valid this will load the file into the Treeview"""
    file_path = label_file["text"]
    try:
        excel_filename = r"{}".format(file_path)
        if excel_filename[-4:] == ".csv":
            df = pd.read_csv(excel_filename)
        else:
            df = pd.read_excel(excel_filename)

    except ValueError:
        tk.messagebox.showerror("Information", "The file you have chosen is invalid")
        return None
    except FileNotFoundError:
        tk.messagebox.showerror("Information", f"No such file as {file_path}")
        return None

    try:
        clear_data()
    
    except KeyError:
        tk.messagebox.showerror("Information", "TSRID column not found")
        return None

    tv1["column"] = list(df.columns)
    tv1["show"] = "headings"
    for column in tv1["columns"]:
        tv1.heading(column, text=column) # let the column heading = column name

    df_rows = df.to_numpy().tolist() # turns the dataframe into a list of lists
    for row in df_rows:
        tv1.insert("", "end", values=row) # inserts each list into the treeview. For parameters see https://docs.python.org/3/library/tkinter.ttk.html#tkinter.ttk.Treeview.insert
    return None

def clear_data():
    tv1.delete(*tv1.get_children())
    return None

def clear_app():
    tv1.delete(*tv1.get_children())
    label_file["text"] = "No File Selected"
    return None

def run():
    filepath = label_file["text"]
    
    if (upload_check.get() == 1) and (edit_check.get() == 0) and (subs_upload_check.get() == 0):
        result = upload_parcels(filepath, engine)
        messagebox.showinfo("Information", result)
    
    if (upload_check.get() == 0) and (edit_check.get() == 1) and (subs_upload_check.get() == 0):
        result = update_parcels(filepath, configData)
        messagebox.showinfo("Information", result)
    
    if (upload_check.get() == 0) and (edit_check.get() == 0) and (subs_upload_check.get() == 1):
        result = upload_subs(filepath, engine)
        messagebox.showinfo("Information", result)
    

root.mainloop()