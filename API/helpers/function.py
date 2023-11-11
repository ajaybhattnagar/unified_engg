import pandas as pd
import numpy as np
from datetime import datetime



with open ('config.json') as f:
    configData = json.load(f)



def get_datepart(type, date):
  dt = datetime.strptime(date, '%Y-%m-%d')
  if (type.lower() == 'day'):
    return dt.day
  if (type.lower() == 'month'):
    return dt.month
  if (type.lower() == 'year'):
    return dt.year

