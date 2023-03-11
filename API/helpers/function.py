import pandas as pd
import numpy as np
from datetime import datetime


def get_penalty_amount(bg):
  if ((bg > 200) & (bg < 5001)):
    return( bg*0.02 )

  if ((bg > 5000) & (bg < 10001)):
    return(bg*0.04)

  if (bg > 10000):
    return(bg*0.06)
  else:
    return(0)

def get_yep(bg, sub, yep_check):
  yep_princ_amount = 0
  if (bg > 10000):
    yep_princ_amount = bg*0.06
  else:
    yep_princ_amount = 0

  yep_sub_amount = 0
  if (sub > 10000):
    yep_sub_amount = sub*0.06
  else:
    yep_sub_amount = 0

  if (str(yep_check).lower() == 'true'):
    return (yep_princ_amount + yep_sub_amount)
  else:
    return 0
  

def get_datepart(type, date):
  dt = datetime.strptime(date, '%Y-%m-%d')
  if (type.lower() == 'day'):
    return dt.day
  if (type.lower() == 'month'):
    return dt.month
  if (type.lower() == 'year'):
    return dt.year

def get_total_days_of_interest(start_date, end_date):
  per_diem_year = 360
  per_diem_month = 30
  start_date = str(start_date)
  end_date = str(end_date)

  days_interest_year = per_diem_year * (get_datepart('year', start_date) - get_datepart('year', end_date))
  days_interest_month = per_diem_month * (get_datepart('month', start_date) - get_datepart('month', end_date))
  days_interest_day = (get_datepart('day', start_date) - get_datepart('day', end_date))
  total_days = days_interest_day + days_interest_month + days_interest_year

  return abs(total_days)

# Main total penalty function
def get_total_penalty(bg, subs, yep):
    bg = float(bg)
    subs = float(subs)
    penalty_amount = get_penalty_amount(bg)
    year_end_pen = get_yep(bg, subs, yep)
    total_penalty = penalty_amount + year_end_pen
    return (total_penalty)

# Main total interest function
def get_total_interest(subs, interest, start_date, end_date):
    subs = float(subs)
    interest = float(interest)
    start_date = str(start_date)
    end_date = str(end_date)
    per_diem_year = 360
    per_diem_month = 30

    days_interest_year = per_diem_year * (get_datepart('year', start_date) - get_datepart('year', end_date))
    days_interest_month = per_diem_month * (get_datepart('month', start_date) - get_datepart('month', end_date))
    days_interest_day = (get_datepart('day', start_date) - get_datepart('day', end_date))
    total_days = days_interest_day + days_interest_month + days_interest_year

    sub_per_diem = total_days / per_diem_year

    if (subs > 0):
      total_interest = abs(sub_per_diem * subs * interest)
    else:
      total_interest = sub_per_diem * subs * interest * -1
    return (round(total_interest, 2))


