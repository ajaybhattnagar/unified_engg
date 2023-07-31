import mysql.connector
import pandas as pd
import numpy as np
import simplejson
import datetime
from datetime import date
import warnings
warnings.filterwarnings('ignore')
import bcrypt
import logging
import json
from routes.Reports import calc_total_payoff_and_other_interest
from schedule.Parcels import update_payoff_interest_accured

update_payoff_interest_accured()