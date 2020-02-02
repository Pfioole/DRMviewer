import datetime

import pandas as pd
from pathlib import Path
import os
import json
from flask import Flask, render_template, request, escape, Markup, session, jsonify


filePath = Path("C:/CDR/3945/56021927PCR1024/DRMdata/AE.sas7Bdat")
df_ds = pd.read_sas(filePath, format='sas7bdat', encoding = 'iso-8859-1')
subset2 = ["AESTDAT", "AEENDAT", "AESBDAT", "CREATDAT", "MAXUPDAT"]

for (y) in df_ds:
    if (df_ds[y].dtype == "datetime64[ns]"):
        df_ds[y] = df_ds[y].map(lambda y: pd.Timestamp(y, unit='ms'))
        df_ds[y] = df_ds[y].map(lambda y: y  if (pd.isnull(y)) else y.strftime("%Y/%m/%d"))
        df_ds[y] = df_ds[y].astype('str')

#df_ds = df_ds.fillna("None")

#df_ds3 = df_ds[subset2].head(5)
df_ds3 = df_ds.head(5)
dict_sq = {}
dict_sq["data"] = df_ds3.to_dict(orient='records')
dict_sq

def strconverter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()

print(json.dumps(dict_sq, default = strconverter, indent=4))

############################################

df_ds3 = df_ds[subset].head(5)
df_ds = df_ds.replace(r'^\s*$', "np.nan", regex=True)
print(df_ds3)
print(df_ds3.fillna(0))
print(df_ds3.to_json(orient='records'))
dict_ds = df_ds3.to_dict(orient='records', into= '')
print(dict_ds)
#print(json.dumps(dict_ds))
df_ds3.dtypes