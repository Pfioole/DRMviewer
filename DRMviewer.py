from flask import Flask, render_template, request, escape, Markup, session, jsonify
# from flask_bootstrap import Bootstrap
import pandas as pd
import pandasql as psql

from pathlib import Path
import os
import json
import datetime



from flask import escape
import numpy as np

app = Flask(__name__)
app.secret_key = os.urandom(24)

# bootstrap = Bootstrap(app)
# working directory cd c:\users\pfioole\onedrive - JNJ\_2019\programming\DRMviewer_0_1
# py -3 drmviewer.py

# Convertor for datetime to string for JSON dump
def strconverter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


#not used at this point
class Col:
    def __init__(self, data):
        self.data = data
    def __repr__(self):
        return str(self)
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__)

def createExceptionMarkup(df_exceptions, exceptionRecords):
    
    # Import exceptions and prepare dict to implement in HTML
    # =======================================================
    # define which line items in the original dataset have exceptions (needs to be adapted for multiple datasets!!!!)

    markupDict = {}  # this dictionary will contain a record for each erroneous variable with a list of failed checks

    for i in exceptionRecords:
        df_ex = df_exceptions.loc[df_exceptions['KEY1'] == i]
        markupDict[i] = {}
        listVARS = df_ex['VAR1CD'].unique().tolist() + df_ex['VAR2CD'].unique().tolist() + df_ex['VAR3CD'].unique().tolist() +df_ex['VAR4CD'].unique().tolist() +df_ex['VAR5CD'].unique().tolist()
        listVARS = [x for x in listVARS if str(x) != 'nan']  # remove nan's from the list
        # print (listVARS)
        # set up the empty dictionary per DS line item and per variable
        for k in listVARS:
            markupDict[i][k] = []

        # fill up the dictionaries with the check numbers from the exceptions
        for j in range(len(df_ex)):
            # print (str(df_ex.iloc[j]['VAR2']))
            if str(df_ex.iloc[j]['VAR1CD']) != 'nan':
                markupDict[i][df_ex.iloc[j]['VAR1CD']].append(df_ex.iloc[j]['CHECKID'])
            if str(df_ex.iloc[j]['VAR2CD']) != 'nan':
                markupDict[i][df_ex.iloc[j]['VAR2CD']].append(df_ex.iloc[j]['CHECKID'])
            if str(df_ex.iloc[j]['VAR3CD']) != 'nan':
                markupDict[i][df_ex.iloc[j]['VAR3CD']].append(df_ex.iloc[j]['CHECKID'])
            if str(df_ex.iloc[j]['VAR4CD']) != 'nan':
                markupDict[i][df_ex.iloc[j]['VAR4CD']].append(df_ex.iloc[j]['CHECKID'])
            if str(df_ex.iloc[j]['VAR5CD']) != 'nan':
                markupDict[i][df_ex.iloc[j]['VAR5CD']].append(df_ex.iloc[j]['CHECKID'])
    return markupDict


def create_ds_exc_html(df_ds, markupDict, exceptionRecords):

    # Create the HTML page with exceptions highlighted
    # =================================================
    # uses the dataframe of the dataset and turns it into a html table, with markup for the
    # exceptions as defined in the markup Dictionary

    cols = df_ds.columns.values.tolist()

    # Table creation
    ds_html = '<table id="example" class="display table table-striped table-bordered table-hover table-sm table-fixed"><thead><tr><th class="Rec">Rec</th>'
    
    for columnnr in range(len(cols)):
        ds_html += '<th class="' + cols[columnnr] + '">' + cols[columnnr] + '</th>'
    ds_html += '</thead><tbody id="ds_body">'
    for index, row in df_ds.iterrows():
        ds_html += '<tr><td class="Rec">'+str(index)+'</td>'
        exception_vars = list()
        currentURECID = int(row['URECID'])
        if currentURECID in exceptionRecords:
            # exceptionVars = list()
            for i in markupDict[currentURECID].keys():
                exception_vars.append(i)
        else:
            exception_vars = []
        for item in row.iteritems():
            if item[0] in exception_vars:
                bgstyle = '" style="background-color: yellow;"'
                cellclass = '" class="table-warning ' + item[0] 
                ds_html += '<td id= "' + item[0] + str(index) + cellclass  + '">'+ str(item[1])+ '</td>'
            else:
                bgstyle = '""'
                ds_html += '<td id= "' + item[0] + str(index) + '" class="' + item[0] + '">'+ str(item[1])+ '</td>'
        ds_html += '</tr>'
    ds_html += '</tbody></table>'
    return(ds_html)

def create_ds_html(df_ds):

    #Create the HTML page without exceptions
    #========================================
    #uses the dataframe of the dataset and turns it into a html table


    cols=df_ds.columns.values.tolist()

    #Table creation
    ds_html = '<table id="example" class="display table table-striped table-bordered table-hover table-sm table-fixed"><thead><tr><th class="Rec">Rec</th>'
    
    for columnnr in range(len(cols)):
        ds_html += '<th class="' + cols[columnnr] + '">' + cols[columnnr] + '</th>'
    ds_html += '</thead><tbody id="ds_body">'
    for index, row in df_ds.iterrows():
        ds_html += '<tr><td class="Rec">'+str(index)+'</td>'
        for item in row.iteritems():
            ds_html += '<td id= "' + item[0] + str(index) + '" class="' + item[0] + '">'+ str(item[1])+ '</td>'
        ds_html += '</tr>'
    ds_html += '</tbody></table>'
    return(ds_html)


@app.route('/')
@app.route('/entry')
def entry_page() -> 'html':
    path = "C:/CDR/3945/56021927PCR1024/DRMdata/"
    return render_template('entry.html',
                           the_title='DRM viewer', the_path=path)

####################################################################################################

@app.route('/singlepage')
def singlepage() -> 'html':
    path = "C:/CDR/3945/56021927PCR1024/DRMdata/"
    return render_template('singlepage.html',
                           the_title='DRM viewer', the_path=path)

@app.route('/fetchdatasets', methods=['GET'])
def fetchdatasets():
    studyPath = request.args.get('studyPath')
    datafolder = studyPath
    session['datafolder'] = studyPath
    datapath = Path(datafolder)

    exceptionfile = ""
    if datafolder == "C:/CDR/IDP0000/STUDY001/DRMdata/":
        exceptionfile = "C:\CDR\IDP0000\STUDY001\Reports\exceptions.csv"

    filelist = os.listdir(datapath)
    saslist = []
    for filename in filelist:
        if '.sas7bdat' in filename:
            domain = os.path.splitext(filename)[0].upper()
            saslist.append(domain)
    # log_request(request, results)
    saslistDict = {}
    saslistDict["datasetsList"] = saslist
    return jsonify(saslistDict)


@app.route('/fetchfields', methods=['GET'])
def fetchfields():
    studyPath = request.args.get('studyPath')
    selectedFile = request.args.get('selectedDomain') + ".sas7Bdat"
    if (studyPath[-1:] not in ["/", "\\"]):
        studyPath = studyPath + "/"
    filefolder = studyPath + selectedFile
    filePath = Path(filefolder)
    df_ds = pd.read_sas(filePath, format='sas7bdat', encoding = 'iso-8859-1')
    npcols = df_ds.columns.values
    cols = npcols.tolist()
    fieldlistDict = {}
    fieldlistDict["fieldList"] = cols
    return jsonify(fieldlistDict)

@app.route('/fetchQueryData', methods=['GET'])
def fetchfQueryData():

    studyPath = request.args.get('studyPath')
    sqstring = request.args.get('sqstring')
    # print(sqstring)
    sqDict = json.loads(sqstring);
    leftDomain = sqDict["leftFile"]
    if (studyPath[-1:] not in ["/", "\\"]):
        studyPath = studyPath + "/"
    filefolder = studyPath + leftDomain + ".sas7Bdat"
    filePath = Path(filefolder)
    df_ds = pd.read_sas(filePath, format='sas7bdat', encoding = 'iso-8859-1')
    subset = sqDict["selectedFields"]
    df_ds = df_ds[subset].head(5)
    #Datacleaning steps

    #Convert Timestamps to date format that can be serialized in JSON
    for (y) in df_ds:
        if (df_ds[y].dtype == "datetime64[ns]"):
            df_ds[y] = df_ds[y].map(lambda y: pd.Timestamp(y, unit='ms'))
            df_ds[y] = df_ds[y].map(lambda y: y if (pd.isnull(y)) else y.strftime("%Y/%m/%d"))
            df_ds[y] = df_ds[y].astype('str')

    #Fill empty fields
    df_ds = df_ds.fillna("None")

    dict_sq = {}
    dict_ds = df_ds.to_dict(orient='records')
    dict_sq["data"] = dict_ds

    cols = []
    for columnnr in range(len(subset)):
        cols.append({})
        cols[columnnr]["data"] = subset[columnnr]

    dict_sq["cols"] = cols

    #print(json.dumps(dict_sq))
    jsonTable = json.dumps(dict_sq, default=strconverter)
    print(jsonTable)
    #dict_sq["cols"] = cols

    return jsonTable

@app.route('/fetchSQLdata', methods=['GET'])
def fetchSQLdata():

    studyPath = request.args.get('studyPath')
    sqstring = request.args.get('sqstring')
    # print(sqstring)
    sqDict = json.loads(sqstring);
    leftDomain = sqDict["leftFile"]
#    rightDomain = sqDict["rightFile"]
    if (studyPath[-1:] not in ["/", "\\"]):
        studyPath = studyPath + "/"
    leftfilefolder = studyPath + leftDomain + ".sas7Bdat"
 #   rightfilefolder = studyPath + rightDomain + ".sas7Bdat"
    leftFilePath = Path(leftfilefolder)
 #   rightFilePath = Path(rightfilefolder)
    df_left = pd.read_sas(leftFilePath, format='sas7bdat', encoding = 'iso-8859-1')
    #print(df_left["STUDYID"].head(5))
 #   df_right = pd.read_sas(rightFilePath, format='sas7bdat', encoding = 'iso-8859-1')
    q = sqDict["SQLquery"]
    #pysqldf = lambda q: psql.sqldf(q, globals())
    #q = sqDict["SQLquery"]
    searchString = "FROM " + leftDomain
    replaceString = "FROM df_left AS " + leftDomain
    q = q.replace(searchString, replaceString)
    print(q)
    df_ds = psql.sqldf(q, locals())
    #df_ds = pysqldf("""SELECT SUBJID FROM df_left LIMIT 5;""")

    #Datacleaning steps

    #Convert Timestamps to date format that can be serialized in JSON
    for (y) in df_ds:
        if (df_ds[y].dtype == "datetime64[ns]"):
            df_ds[y] = df_ds[y].map(lambda y: pd.Timestamp(y, unit='ms'))
            df_ds[y] = df_ds[y].map(lambda y: y if (pd.isnull(y)) else y.strftime("%Y/%m/%d"))
            df_ds[y] = df_ds[y].astype('str')

    #Fill empty fields
    df_ds = df_ds.fillna("None")

    dict_sq = {}
    dict_ds = df_ds.to_dict(orient='records')
    dict_sq["data"] = dict_ds

    subset = sqDict["selectedFields"]
    cols = []
    for columnnr in range(len(subset)):
        cols.append({})
        cols[columnnr]["data"] = subset[columnnr]

    dict_sq["cols"] = cols

    #print(json.dumps(dict_sq))
    jsonTable = json.dumps(dict_sq, default=strconverter)
    print(jsonTable)
    #dict_sq["cols"] = cols

    return jsonTable



#######################################################################################

@app.route('/selectfile', methods=['POST'])
def fileselect_page() -> 'html':
    datafolder = request.form['path']
    session['datafolder'] = request.form['path']
    datapath = Path(datafolder)

    exceptionfile = ""
    if datafolder == "C:/CDR/IDP0000/STUDY001/DRMdata/":
        exceptionfile = "C:\CDR\IDP0000\STUDY001\Reports\exceptions.csv"
    title = 'Select SAS dataset from folder:'
    filelist = os.listdir(datapath)
    saslist = []
    for filename in filelist:
        if '.sas7bdat' in filename:
            saslist.append(filename)
    #log_request(request, results) 
    return render_template('selectfile.html',
                           the_title=title,
                           the_filelist=saslist,
                           the_folder=session['datafolder'],
                           the_exceptionfile=exceptionfile)


@app.route('/dsviewer', methods=("POST", "GET"))
def ds_viewer():
    #DS file
    folder = request.form['folder']
    filename = request.form['fileselected']
    if (folder[-1:] not in ["/", "\\"]):
        folder = folder + "/"
    filefolder = folder + filename
    filepath = Path(filefolder)
    df_ds = pd.read_sas(filepath, format='sas7bdat', encoding = 'iso-8859-1')

    domain = os.path.splitext(filename)[0].upper()
    cols=df_ds.columns.values

    #Exceptionfile
    exceptionfile = request.form['exceptionfile']   
    if exceptionfile :
        exceptionfilepath = Path(exceptionfile)
        df_exceptions = pd.read_csv(exceptionfilepath)
        df_exceptions = df_exceptions.loc[df_exceptions['DOMAIN'] == domain]
        exceptionRecords = df_exceptions['KEY1'].unique().tolist()
        markupDict= createExceptionMarkup(df_exceptions, exceptionRecords)
        ds_html = create_ds_exc_html(df_ds, markupDict,exceptionRecords)
        #ae_html3 = Markup(ae_html3)
        
    else :
        ds_html = create_ds_html(df_ds)
        
    return render_template('dsviewer.html', the_ds_html=ds_html, 
                            the_domain=domain, the_filefolder=filefolder, the_columnlist = cols)
 
@app.route('/combined', methods=("POST", "GET"))
def combined():
    datapath = Path(session['datafolder'])
    title = 'Combine datasets:'
    filelist = os.listdir(datapath)
    saslist = []
    for filename in filelist:
        if '.sas7bdat' in filename:
            saslist.append(filename)

    return render_template('combined.html',
                           the_title=title,
                           the_filelist=saslist,
                           the_folder=session['datafolder'])

@app.route('/combinedview', methods=("POST", "GET"))
def combinedview():
    datapath = Path(session['datafolder'])
    title = 'Select common fields:'
    file1 = request.form['file1selected']
    file2 = request.form['file2selected']
    filefolder1 = session['datafolder'] + file1
    filefolder2 = session['datafolder'] + file2
    datapath1 = Path(session['datafolder'] + file1)
    datapath2 = Path(session['datafolder'] + file2)
    df_ds1 = pd.read_sas(datapath1, format='sas7bdat', encoding = 'iso-8859-1')
    df_ds2 = pd.read_sas(datapath2, format='sas7bdat', encoding = 'iso-8859-1')
    cols1=df_ds1.columns.values
    cols2=df_ds2.columns.values
    cols_pure1 = [x for x in cols1 if x not in cols2]
    cols_pure2 = [x for x in cols2 if x not in cols1]
    commoncols = list(set(cols1).intersection(cols2))
    return render_template('combinedview.html',
                           the_title=title,
                           the_file1=file1,
                           the_file2=file2,
                           the_folder=session['datafolder'],
                           the_cols1=cols_pure1,
                           the_colsX=cols_pure1,
                           the_colsY=cols_pure2,
                           the_commoncols=commoncols)


@app.route('/dscombinedviewer', methods=["POST", "GET"])
def dscombinedviewer():
    file1 = request.form['file1']
    file2 = request.form['file2']
    shownfieldsX = request.form.getlist('colselectX')
    shownfields2 = request.form.getlist('colselectY')
    shownfieldsY = request.form.getlist('colselectY')
    title = 'View combined datasets:'
    colselect = request.form.getlist('colselect')
    shownfields = colselect + shownfieldsX + shownfieldsY    
    filefolder1 = session['datafolder'] + file1
    filefolder2 = session['datafolder'] + file2
    datapath1 = Path(session['datafolder'] + file1)
    datapath2 = Path(session['datafolder'] + file2)
    df_ds1 = pd.read_sas(datapath1, format='sas7bdat', encoding = 'iso-8859-1')
    df_ds2 = pd.read_sas(datapath2, format='sas7bdat', encoding = 'iso-8859-1')
    df_dscombined = df_ds1.merge(df_ds2, on = colselect)[shownfields]
    cols=df_dscombined.columns.values
    ds_html = create_ds_html(df_dscombined)
    
    return render_template('dscombinedviewer.html',
                           the_title=title,
                           the_domain="Combined Domains",
                           the_colselect=colselect,
                           the_colselect2=shownfieldsY,
                           the_shownfields1=shownfieldsX,
                           the_shownfields2=shownfields2,
                           the_shownfields= shownfields,
                           the_columnlist=cols,
                           the_file1=file1,
                           the_file2=file2,
                           the_ds_html=ds_html,
                           the_folder=session['datafolder'])

if __name__ == '__main__':
    app.run(debug=True)
