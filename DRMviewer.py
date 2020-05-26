from flask import Flask, render_template, request, escape, Markup, session, jsonify, abort, Response
from flask import make_response, url_for
# from flask_bootstrap import Bootstrap
import pandas as pd
import pandasql as psql

from pymongo import MongoClient

from bson import json_util
from bson.json_util import dumps
from bson.json_util import loads

from bson.objectid import ObjectId

from pathlib import Path
import os
import json
import datetime

import pyreadstat



# from flask import escape
# import numpy as np

app = Flask(__name__)
app.secret_key = os.urandom(24)

# connection to MongoDB Database
connection = MongoClient("mongodb://localhost:27017/")

def load_dataframe(domain, studyPath):
    if (studyPath[-1:] not in ["/", "\\"]):
        studyPath = studyPath + "/"
    datapath = Path(studyPath)
    filelist = os.listdir(datapath)
    _file_to_load = ""
    for filename in filelist:
        if '.sas7bdat' in filename:
            _listed_domain = os.path.splitext(filename)[0].upper()
            if domain == _listed_domain:
                _file_to_load = filename
    filefolder = studyPath + _file_to_load
    FilePath = Path(filefolder)
    df_domain = pd.read_sas(FilePath, format='sas7bdat', encoding='iso-8859-1')
    return df_domain



def subsetfields(domain, subset, df):
    domain_subset_fields = []
    domain_all = domain + ".*"
    domain_any = domain + "."
    for field in subset:
        prefix_length = len(domain_any)
        if field.startswith(domain_any):
            if field == domain_all:
                print("domain all")
                print(field)
                npcols = df.columns.values
                df_fields = npcols.tolist()
                for df_field in df_fields:
                    domain_subset_fields.append(df_field)
            else:
                field = field[prefix_length:]
                domain_subset_fields.append(field)
    print("domain subset fields: ")
    print(domain_subset_fields)
    return domain_subset_fields


# Adapt the query from the querybuilder to be able to read native dataframes AS domains
def pandaSQLcleanquery(query, domain, dfname):
    searchString = "FROM " + domain
    replaceString = "FROM " + dfname + " AS " + domain
    print("replacestring: " +  replaceString)
    q = query.replace(searchString, replaceString)
    searchString = "JOIN " + domain
    replaceString = "JOIN " + dfname + " AS " + domain
    q = q.replace(searchString, replaceString)
    print("querystring=" + q)
    return q


def get_df_name(df):
    name =[x for x in globals() if globals()[x] is df][0]
    return name


# Convertor for datetime to string for JSON dump
def strconverter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


# Initialize Database
def create_mongodatabase():
    print("ok, in the function")
    try:
        dbnames = connection.list_database_names()
        print(dbnames)
        if 'cloudds' not in dbnames:
            db_queries = connection.cloudds.queries

            db_queries.insert({
            "name": "AE - all fields",
            "description": "Dataset contains all Adverse Events",
            "scope": "Global",
            })

            print ("Database Initialize completed!")
        else:
            print ("Database already Initialized!")
    except:
        print ("Database creation failed!!")
    print(dbnames)


def add_query(new_query):
    api_list = []
    print(new_query)
    db = connection.cloudds.queries
    same_queries = db.find({"name": new_query['name']})
    for i in same_queries:
        print(str(i))
        api_list.append(str(i))
    # print (api_list)
    if api_list == []:
        #    print(new_user)
        del new_query["_id"] # make sure mongodb assigns it's own unique _id
        db.insert(new_query)
        return "Success"
    else:
        abort(409)

def delete_query(_deleteDict):
    db = connection.cloudds.queries
    _id = _deleteDict['$oid']
    print(_id)
    # db.remove({"_id": _objectID})
    # db.remove({"_id" : _deleteDict})
    result = db.delete_one({'_id' : ObjectId(_id)})
    # print(result.deleted_count)
    # print(result.raw_result)
    # print(result.acknowledged)
    return (result.raw_result)


def fetchMetadata(_study_path):
    # _study_path = request.args.get('studyPath')
    if (_study_path[-1:] not in ["/", "\\"]):
        _study_path = _study_path + "/"
    session['datafolder'] = _study_path
    _file_list = os.listdir(Path(_study_path))
    metadata = {}
    domains = []
    for _filename in _file_list:
        if '.sas7bdat' in _filename:
            domain = os.path.splitext(_filename)[0].upper()
            domains.append(domain)
            _file_folder = _study_path + _filename
            df, meta = pyreadstat.read_sas7bdat(_file_folder, metadataonly=True)
            _domain_metadata = {}
            _domain_metadata["column_names"] = meta.column_names
            _domain_metadata["column_labels"] = meta.column_labels
            _domain_metadata["column_names_to_labels"] = meta.column_names_to_labels
            _domain_metadata["number_rows"] = meta.number_rows
            _domain_metadata["number_columns"] = meta.number_columns
            _domain_metadata["file_label"] = meta.file_label
            _domain_metadata["file_encoding"] = meta.file_encoding
            _domain_metadata["variable_storage_width"] = meta.variable_storage_width
            metadata[domain] = _domain_metadata
    metadata["domains"] = domains
    return(metadata)

def getColumnFrequency(_study_path, domain, field):
    if (_study_path[-1:] not in ["/", "\\"]):
        _study_path = _study_path + "/"
    _file_folder = _study_path + domain + ".sas7bdat"
    df, meta = pyreadstat.read_sas7bdat(_file_folder)
    _freq_dict = {"a":"b"}
    print(df.dtypes[field])
    if isinstance(field, str):
        _freq_dict = df[field].value_counts().to_dict()
    print(_freq_dict)
    return (_freq_dict)
####################################################################################################

@app.route('/')
@app.route('/singlepage')
def singlepage() -> 'html':
    # path = "C:/CDR/3945/56021927PCR1024/DRMdata/"
    return render_template('singlepage.html',
                           the_title='DRM viewer')


@app.route('/fetchCDRpath', methods=['GET'])
def fetchCDRpath():
    file = request.args.get('queryFile')
    filepath = "./serverparams.json"
    #session['datafolder'] = studyPath
    with open(filepath) as json_file:
        queryJSON = json.load(json_file)
    return jsonify(queryJSON)

@app.route('/getMetadata', methods=['GET'])
def getMetadata():
    studyPath = request.args.get('studyPath')
    return jsonify(fetchMetadata(studyPath))

@app.route('/columnFrequency', methods=['GET'])
def columnFrequency():
    studyPath = request.args.get('studyPath')
    domain = request.args.get('domain')
    field = request.args.get('field')
    _freqJSON = jsonify(getColumnFrequency(studyPath, domain, field))
    return _freqJSON


@app.route('/fetchdatasets', methods=['GET'])
def fetchdatasets():
    studyPath = request.args.get('studyPath')
    datafolder = studyPath
    session['datafolder'] = studyPath
    datapath = Path(datafolder)
    filelist = os.listdir(datapath)
    saslist = []
    for filename in filelist:
        if '.sas7bdat' in filename:
            domain = os.path.splitext(filename)[0].upper()
            saslist.append(domain)
    saslistDict = {}
    saslistDict["datasetsList"] = saslist
    return jsonify(saslistDict)


@app.route('/fetchfields', methods=['GET'])
def fetchfields():
    studyPath = request.args.get('studyPath')
    origin = request.args.get('origin')
    domain = request.args.get('selectedDomain')
    df_ds = load_dataframe(domain, studyPath)
    npcols = df_ds.columns.values
    cols = npcols.tolist()
    # if origin != "sort" :
    cols.insert(0, "*")
    fieldlistDict = {}
    fieldlistDict["fieldList"] = cols
    return jsonify(fieldlistDict)

# Native Python query, only takes into account selected fieldds from simple leftfile selection
@app.route('/fetchQueryData', methods=['GET'])
def fetchQueryData():
    studyPath = request.args.get('studyPath')
    sqstring = request.args.get('sqstring')
    sqDict = json.loads(sqstring);
    leftDomain = sqDict["leftFile"]
    df_ds = load_dataframe(leftDomain, studyPath)
    subset = [] #sqDict["selectedFields"]
    shortSubset = [x.split('.')[1] if x==x else None for x in subset]
    subset = shortSubset
    df_ds = df_ds[subset].head(5)
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


@app.route('/fetchSQLdata3', methods=['GET'])
def fetchSQLdata3():
    studyPath = request.args.get('studyPath')
    sqstring = request.args.get('sqstring')
    sqDict = json.loads(sqstring)
    datasets = sqDict["datasets"]
    leftDomain = datasets[0]
    if len(datasets) > 1 :
        rightDomain = datasets[1]
    # subset = sqDict["selectedFields"]
    subset = []
    subset_as = {} #dictionary with as values, to apply at the end of the query
    for bf in sqDict["bm"]:
        if bf["showField"]:
            subset.append(bf["usedField"])
            if "as" in bf.keys():
                if bf["as"] != "":
                    subset_as[bf["usedField"]] = bf["as"]
    q = sqDict["SQLquery"]
#    subset = sqDict["selectedFields"]
#    q = sqDict["SQLquery"]
    dataframes = []

    print("Datasets 295:")
    print(datasets)
    print("Subset")
    print(subset)
    print("Subset as")
    print(subset_as)
    #Load the full data from the different dataset files
    for i in range(len(datasets)):
        if i == 0:
            df_0 = load_dataframe(datasets[i], studyPath)
            print("Loaded df:" + datasets[i])
            print(df_0.head())
        if i == 1:
            df_1 = load_dataframe(datasets[i], studyPath)
            print("Loaded df:" + datasets[i])
            print(df_1.head())
        if i == 2:
            df_2 = load_dataframe(datasets[i], studyPath)
            print("Loaded df:" + datasets[i])
            print(df_2.head())
        if i == 3:
            df_3 = load_dataframe(datasets[i], studyPath)
            print("Loaded df:" + datasets[i])
            print(df_3.head())
    for i in range(len(datasets)):
        dfname = "df_" + str(i)
        print(dfname)
        q = pandaSQLcleanquery(q, datasets[i], dfname)
    print(q)
    try:
        df_ds = psql.sqldf(q, locals())
    except Exception as err:
        print('Something went wrong: ', str(err))
        _error_message = {"ERROR" : str(err)}
        return jsonify(_error_message)
    print("Joined dataframe df_ds:")
    print(df_ds.head())

    cols_in = []
    for item in subset:
        cols_in.append(item)
    cols_out = []
    for domain in datasets:
        selectall = domain + ".*"
        cols_out = []
        # print("cols_out at start of dataset:")
        # print(cols_out)
        domain_any = domain + "."
        for item in cols_in:
            if item == selectall:
                max = len(datasets)
                if max > 0:
                    if domain == datasets[0]:
                        npcols = df_0.columns.values
                if max > 1:
                    if domain == datasets[1]:
                        npcols = df_1.columns.values
                if max > 2:
                    if domain == datasets[2]:
                        npcols = df_2.columns.values
                if max > 3:
                    if domain == datasets[3]:
                        npcols = df_3.columns.values
                allfields = npcols.tolist()
                # print("all fields from source domain:")
                # print(allfields) # = list(df_left.columns.values)
                for element in allfields:
                    cols_out.append(domain_any + element)
            else:
                cols_out.append(item)
        cols_in = []
        for item in cols_out:
            cols_in.append(item)
    print("cols_out")
    print(cols_out)

    print(df_ds.columns)

    # Replacing the AS values
    cols_as = []
    for _colheader in cols_out:
        if _colheader in subset_as.keys():
            cols_as.append(subset_as[_colheader])
        else:
            cols_as.append(_colheader)

    print("col as 376")
    print(cols_as)

    df_ds.columns = cols_as   #iso col_out
    print('ds_df after cols_out')
    df_ds.head()

    # Datacleaning steps

    # Convert Timestamps to date format that can be serialized in JSON
    for (y) in df_ds:
        if (df_ds[y].dtype == "datetime64[ns]"):
            df_ds[y] = df_ds[y].map(lambda y: pd.Timestamp(y, unit='ms'))
            df_ds[y] = df_ds[y].map(lambda y: y if (pd.isnull(y)) else y.strftime("%Y/%m/%d"))
            df_ds[y] = df_ds[y].astype('str')

    # Fill empty fields
    df_ds = df_ds.fillna("None")
    df_ds = df_ds  # .head(4)
    print(df_ds.head())

    dict_sq = {}
    dict_ds = df_ds.to_dict(orient='records')
    dict_sq["data"] = dict_ds

    #    subset = sqDict["selectedFields"]
    cols = []
    coldefs = []
    print("subset as")
    print(subset_as)
    print("cols out")
    print(cols_out)
    print("cols as")
    print(cols_as)
    for columnnr in range(len(cols_out)):
        cols.append({})
        #cols[columnnr]["data"] = cols_out[columnnr]
        cols[columnnr]["data"] = cols_as[columnnr]
        coldefs.append({})
        #coldefs[columnnr]["title"] = cols_out[columnnr]
        coldefs[columnnr]["title"] = cols_as[columnnr]
        coldefs[columnnr]["targets"] = columnnr
    dict_sq["cols"] = cols
    dict_sq["coldefs"] = coldefs

    # print(json.dumps(dict_sq))
    jsonTable = json.dumps(dict_sq, default=strconverter)
    print(jsonTable)
    findLeft = leftDomain + "."
    replaceLeft = leftDomain + "_"
    findRight = rightDomain + "."
    replaceRight = rightDomain + "_"
    jsonTable = jsonTable.replace(findLeft, replaceLeft)
    jsonTable = jsonTable.replace(findRight, replaceRight)
    # dict_sq["cols"] = cols

    print(jsonTable)

    return jsonTable


@app.route('/saveQuery', methods=['GET'])
def saveQuery():
    sqstring = request.args.get('sqstring')
    print(sqstring)
    sqDict = json.loads(sqstring)
    filepath = "./queries/" + sqDict["name"] + ".json"
    prettySQstring = json.dumps(sqDict, indent=4)
    print(prettySQstring)
    queryFile = open(filepath, "w")
    queryFile.write(prettySQstring)
    queryFile.close()
    return jsonify({'status': 'query saved as file'}), 201

@app.route('/add_Mongo_query', methods=['POST'])
def add_Mongo_query():
    if not request.json:
        abort(400)
    print(type(request.json))
    sqDict = request.json
    #sqDict = json.loads(sqstring)
    #print(sqDict["name"])
#    query = {
#        "name" : request.json["name"],
#        'description': request.json['description'],
#        'scope': request.json['scope']
#    }
    return jsonify({'status' : add_query(sqDict)}), 201

@app.route('/Mongo_query', methods=['DELETE'])
def delete_Mongo_query():
    if not request.json:
        abort(400)
    print(type(request.json))
    _deleteDict = request.json
    print("_deleteDict string: ")
    print (_deleteDict)
    return jsonify(delete_query(_deleteDict)), 202


@app.route('/fetchQueries', methods=['GET'])
def fetchQueries():
    datafolder = "./queries/"
    filelist = os.listdir(datafolder)
    # print(filelist)
    filelistDict = {}
    filelistDict["queryList"] = filelist
    return jsonify(filelistDict)

@app.route('/Mongo_query', methods=['GET'])
def getMongoQuery():
    api_list = []
    test_list = []
    oldapi_list = []
    db = connection.cloudds.queries

    #searchString = request.args.get('searchString')
    _name = request.args.get('name')
    print("_name")
    print(_name)
    search_Dict = {}
    if _name != "":
        search_Dict["name"] = _name
        print("search_Dict:")
        print(search_Dict)
        result = db.find_one(search_Dict)
    else:
        return Response(dumps({}, default=json_util.default), mimetype='application/json')
    return Response(dumps(result, default=json_util.default), mimetype='application/json')



@app.route('/searchMongo', methods=['GET'])
def searchMongo():
    api_list = []
    test_list = []
    oldapi_list = []
    db = connection.cloudds.queries

    searchString = request.args.get('searchString')
    print(searchString)
    sqDict = json.loads(searchString)
    print("sqDict: ")
    print(sqDict)
    search_Dict = {}
    if "name" in sqDict:
        if sqDict["name"] != "":
            _name_substring = (sqDict["name"]) + ".*/"
            #_searchTerm = '$regex: "\\/.*' + sqDict["name"] + '.*/i"'
            name_substring = "/^" + sqDict["name"] + "$/i" # /^bar$/i
            # query = {"$regex": '/.*' +_name_substring}
            name_substring = sqDict["name"]
            query = {"$regex":  name_substring}
            search_Dict["name"] = query
    if sqDict["dataModel"]:
        if sqDict["dataModel"] != "":
            search_Dict["dataModel"] = sqDict["dataModel"]
    if "description" in sqDict:
        if sqDict["description"] != "":
            name_substring = sqDict["description"]
            query = {"$regex":  name_substring}
            search_Dict["description"] = query
    if sqDict["scope"]:
        if sqDict["scope"] != "":
            search_Dict["scope"] = sqDict["scope"]
    if sqDict["status"]:
        if sqDict["status"] != "":
            search_Dict["status"] = sqDict["status"]
    if "author" in sqDict:
        if sqDict["author"] != "":
            search_Dict["author"] = sqDict["author"]
    #print(search_Dict)
#
#    search_Dict = {}
#
    for row in db.find(search_Dict):
        strrow = (dumps(row))     #conversions to get clean JSON from Mongo BSON
        #print("strrow")
        #print(strrow)
        dictrow = (loads(strrow)) #conversions to get clean JSON from Mongo BSON
        #print(type(dictrow))       #type is dict
        #print(dictrow)
#       test_list.append(strrow)
        api_list.append(dictrow)
#        oldapi_list.append(str(row))
#    print(test_list)
#    print("********************RETURN FROM MONGO QUERY****************************")
#    print(api_list)
#    print(oldapi_list)
    #print(jsonify({'query_list': api_list}))
    #return jsonify({'query_list' : api_list})
    #s = jsonify({'query_list' : api_list})
    #s = {'query_list': api_list}
    #s = ast.literal_eval(s)
    #print (s)
    #return s
    # return jsonify({'query_list' : oldapi_list})
    return Response(dumps({'query_list' : api_list}, default=json_util.default), mimetype='application/json') #this one worked!


@app.route('/fetchQueryContent', methods=['GET'])
def fetchQueryContent():
    file = request.args.get('queryFile')
    filepath = "./queries/" + file
    #session['datafolder'] = studyPath
    with open(filepath) as json_file:
        queryJSON = json.load(json_file)
    # print(queryJSON)
    return jsonify(queryJSON)


# Error handling
@app.errorhandler(404)
def resource_not_found(error):
    return make_response(jsonify({'error': 'Resource not found!'}), 404)


@app.errorhandler(409)
def user_found(error):
    return make_response(jsonify({'error': 'Conflict! Record exist'}), 409)


@app.errorhandler(400)
def invalid_request(error):
    return make_response(jsonify({'error': 'Bad Request'}), 400)



#######################################################################################


if __name__ == '__main__':
    create_mongodatabase()
    app.run(host='0.0.0.0', debug=True)