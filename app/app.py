from flask import Flask, jsonify, request
from flask import make_response
from json import loads, dumps
from idc_index import index
from flask import Flask
from flask_cors import CORS 
import subprocess
import sys

app = Flask(__name__)
CORS(app)
def filter_primary_sites(patient_ids, primary_sites):
	print("before", file=sys.stderr)
	if primary_sites is None or primary_sites == "":
		return patient_ids
	print("after", file=sys.stderr)
	include_or_exclude = "in"

	patient_ids = "\"" + "\",\"".join(patient_ids.split(',')) + "\""
	primary_sites = "\"" + "\",\"".join(primary_sites.split(',')) + "\""
	print("i exist", file=sys.stderr)
	command = f"curl -s --data 'filters={{\"op\":\"and\",\"content\":[{{\"op\":\"in\",\"content\":{{\"field\":\"cases.submitter_id\",\"value\":[{patient_ids}]}}}},{{\"op\":\"{include_or_exclude}\",\"content\":{{\"field\":\"cases.primary_site\",\"value\":[{primary_sites}]}}}}]}}&fields=case_id,submitter_id,primary_site&size=10' 'https://api.gdc.cancer.gov/cases' | jq -r '.data.hits | map(.submitter_id) | join(\",\")'"
	print(command, file=sys.stderr)
	try:
		output = subprocess.check_output(command, shell=True, text=True, stderr=subprocess.PIPE)
		print(f"Command output: {output}", file=sys.stderr)
		return output.strip()
	except subprocess.CalledProcessError as e:
		print(f"Command failed with return code {e.returncode}", file=sys.stderr)
		print(f"Error output: {e.stderr}", file=sys.stderr)
		return ""
	#outputs nothing, figure out why, is it the curl command???

def filter_experimental_strategies(patient_ids, experimental_strategies):
	if experimental_strategies is None or experimental_strategies == "":
		return patient_ids

	patient_ids = "\"" + "\",\"".join(patient_ids.split(',')) + "\""
	experimental_strategies = "\"" + "\",\"".join(experimental_strategies.split(',')) + "\""

	command = f"curl -s --data 'filters={{\"op\":\"and\",\"content\":[{{\"op\":\"in\",\"content\":{{\"field\":\"cases.submitter_id\",\"value\":[{patient_ids}]}}}}]}}&fields=files.experimental_strategy,submitter_id&size=10' https://api.gdc.cancer.gov/cases| jq -r '.data.hits[] | select(.files[].experimental_strategy | IN({experimental_strategies})) | .submitter_id' | sort -u"
	#print("command: " + command, file=sys.stderr)

	output = subprocess.check_output(command, shell=True, text=True, stderr=subprocess.STDOUT)
	return output.strip()

def query(sql):
	client = index.IDCClient()
	df = client.sql_query(sql)
	return df
	
def safe_sql_value(value):
    return "'" + str(value).replace("'", "''") + "'"

# http://index:5000/data?PatientID=TCGA-13-0921&primary_sites=Ovary (WRONG ONE)
# index:5000/data?primary_sites=Ovary&PatientID=TCGA-13-0921
@app.route('/data', methods=['GET', 'POST'])
def get_data():
	#test = ""
	#for key, value in request.args.items():
	#	test += key + "=" + value + ","
	#return test

	# set up response
	response = {
		"code": 200,
		"error": "",
		"result_count": 0,
		"result_set": []
	}

	# configurations
	page = 0
	limit = 10
	_format = "json"
	select = "*"
	where = "1 = 1"
	_filter = {}
	field_list = []
	experimental_strategies = ""
	patient_ids = ""
	primary_sites = ""
	key = ""
	value = ""
	
	client = index.IDCClient()
	# GET or POST limit the length of parameters
	# This should be only for debugging purpose
	if request.method == "GET":
		items = request.args.items()
	elif request.method == "POST":
		items = request.form.items()
	else:
		# set up response
		response["code"] = 405
		response["message"] = "Method " + request.method + " Not Allowed"
		return jsonify(response)

	try:
		for key, value in request.args.items():
			if key == "select":
				select = value
				field_list = select.split(',')
			elif key == "PatientID":
				patient_ids = value
			elif key == "primary_sites":
				primary_sites = value
			elif key == "experimental_strategies":
				experimental_strategies = value
			elif key == "format":
				_format = value
			elif key == "limit":
				limit = int(value)
			elif key == "page":
				page = int(value)
		
		# patients
		#print("patient_ids: " + patient_ids, file=sys.stderr)
		#print("primary_sites: " + primary_sites, file=sys.stderr)
		values = filter_primary_sites(patient_ids, primary_sites)
		values = filter_experimental_strategies(values, experimental_strategies) # Assuming filter_primary_sites is defined elsewhere
		# print("patient_ids_filtered: " + values, file=sys.stderr) # index:5000/data?primary_sites=Ovary&PatientID=TCGA-13-0921
		# values = patient_ids # DEBUGGING
		values = values.split(',')
		if len(values) > 0:
			where += ' and ' + key + ' in (\'' + '\',\''.join(values) + '\')'
		else:
			where += ' and ' + key + ' = ' + value + '"'
	except Exception as e:
		return str(e)

	try:
		if where == "":
			# set up response
			response["code"] = 204
			response["message"] = "Must specify field(s) to filter"
			return jsonify(response)

		allowed_columns = {'PatientID', 'StudyInstanceUID', 'SeriesInstanceUID', 'gcs_url', 'collection_id'}
		select_columns = [col.strip() for col in select.split(',') if col.strip() in allowed_columns]
        
		if not select_columns:
			select_columns = ['*']
		offset = limit * page
        # Construct the SQL query with validated columns
		select_clause = ', '.join(select_columns)
		query = f"""
        SELECT 
            {select_clause}, 
            collection_id, 
            StudyInstanceUID, 
            SeriesInstanceUID, 
            series_aws_url
        FROM 
            index 
        WHERE 
            {where} 
        LIMIT {limit} 
        OFFSET {offset}
        """
        
		print("Debug: Constructed SQL query:", query, file=sys.stderr)
        
		df = client.sql_query(query)
    
		print("Debug: Query executed successfully", file=sys.stderr)

		records = df.to_dict(orient="records")
		print("Debug: after records declared", records, file=sys.stderr)
		collection_data = {}
		for record in records:
			viewer_urls = generate_viewer_urls(record)
			record.update(viewer_urls)
            # Remove StudyInstanceUID and SeriesInstanceUID if you don't want them in the output
			record.pop('collection_id', None)
			record.pop('StudyInstanceUID', None)
			record.pop('SeriesInstanceUID', None)

            
		response["result_count"] = len(records)
		response["result_set"] = records
		#command = "bq query --format=json --use_legacy_sql=false 'select " + select + " from bigquery-public-data.idc_current.dicom_all where " + where + " limit " + str(limit) + " offset " + str(offset) + "'"
		#output = subprocess.check_output(command, shell=True, text=True, stderr=subprocess.STDOUT)
		#records = json.loads(output)

		if _format not in ["json"]:
			return jsonify({"error": f"Unsupported format: {_format}"}), 400

		if _format == "json":
			print("Debug: Records before jsonify:", records, file=sys.stderr)
			json_response = jsonify(records)
			print("Debug: JSON response:", json_response.get_data(as_text=True), file=sys.stderr)
			return json_response
	
	except Exception as e:
		print(f"Error in get_data: {str(e)}", file=sys.stderr)
		return jsonify({"error": str(e)}), 500


def generate_viewer_urls(record):
    study_uid = record['StudyInstanceUID']
    series_uid = record['SeriesInstanceUID']
    aws_url = record['series_aws_url'] 
    return {
		'ohif_v2_url': f"https://viewer.imaging.datacommons.cancer.gov/viewer/{study_uid}?SeriesInstanceUID={series_uid}",
        'ohif_v3_url': f"https://viewer.imaging.datacommons.cancer.gov/v3/viewer/?StudyInstanceUIDs={study_uid}&SeriesInstanceUID={series_uid}",
        'slim_url': f"https://viewer.imaging.datacommons.cancer.gov/slim/studies/{study_uid}/series/{series_uid}",
    }
# Enable CORS for all routes by adding the appropriate headers to the response
@app.after_request
def add_cors_headers(response):
	response.headers['Access-Control-Allow-Origin'] = '*'  # You can replace '*' with your specific domain
	response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
	response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
	return response

@app.route('/collections', methods=["GET"])
def get_collections():
	client = index.IDCClient()
	query = f"""
	select collection_id
	from index
	group by collection_id
	order by collection_id asc
	"""
	df = client.sql_query(query)
	result = df.to_json(orient="records")
	return result
	#return client.get_collections()
	#return jsonify({"msg": "Hello from Flask"})

# http://index:5000/patients/tcga_ov/Brain
@app.route('/patients/<collection>/', defaults={'filters': None}, methods=["GET"])
@app.route('/patients/<collection>/<filters>', methods=["GET"])
def get_patients(collection, filters):
	client = index.IDCClient()
	print("iam here", file=sys.stderr)
	query = f"""
	select PatientID
	from index
	where collection_id = '{collection}'
	""" 
	
	df = client.sql_query(query)
	df_unique = df.drop_duplicates()
	patient_ids = df_unique['PatientID'].tolist()

	if filters:
		patient_ids = ",".join(patient_ids)
	print("before get_patient jsonify", file=sys.stderr)
	result = jsonify(patient_ids)
	print("After get_patient jsonify", file=sys.stderr)
	return result
	
	#patients = client.get_patients(
	#	collection_id=collection, output_format="list"
	#)

	###df = client.sql_query(query)
	###df_unique = df.drop_duplicates()
	###result = df_unique.to_json(orient="records")
	#parsed = loads(result)

	#dumps(parsed, indent=4)
	###return result
	
	#return client.get_collections()
	#return jsonify({"msg": "Hello from Flask"})

@app.route('/patients/', methods=["GET"])
def get_patients_with_params():
	print("in get patient with params", file = sys.stderr)
	try:
		primary_sites = request.args.get('primary_sites', '')
		patient_ids = request.args.get('patient_ids', '')
		collection = request.args.get('collection', '')  # Add this line

		if not collection:
			return jsonify({"error": "Collection parameter is required."}), 400
		
		client = index.IDCClient()

        # Split patient_ids string into a list
		patient_id_list = [pid.strip() for pid in patient_ids.split(',') if pid.strip()]
		
		if patient_id_list:
			placeholders = ','.join(['%s'] * len(patient_id_list))
			query = f"""
            SELECT DISTINCT PatientID
            FROM index
            WHERE collection_id = %s
                AND PatientID IN ({placeholders})
            """
			params = [collection] + patient_id_list
		else:
			query = """
            SELECT DISTINCT PatientID
            FROM index
            WHERE collection_id = %s
            """
			params = [collection]
		
		print(f"Debug: SQL Query: {query}", file = sys.stderr)
		print(f"Debug: Query Parameters: {params}", file = sys.stderr)
		
		df = client.sql_query(query, params)
		patient_ids = df['PatientID'].tolist()
		
		filtered_patient_ids = filter_primary_sites(patient_ids, primary_sites)
		return jsonify(filtered_patient_ids)

	except Exception as e:
		print(f"Error in get_patients_with_params: {str(e)}", file=sys.stderr)
		return jsonify({"error": str(e)}), 500

@app.route('/', methods=["GET"])
def root():
	client = index.IDCClient()
	
	query = """
	SELECT
	  collection_id,
	  STRING_AGG(DISTINCT(Modality)) as modalities,
	  STRING_AGG(DISTINCT(BodyPartExamined)) as body_parts
	FROM
	  index
	GROUP BY
	  collection_id
	ORDER BY
	  collection_id ASC
	"""

	df = client.sql_query(query)
	result = df.to_json(orient="records")
	#parsed = loads(result)

	#dumps(parsed, indent=4)
	return result
	
	#return client.get_collections()
	#return jsonify({"msg": "Hello from Flask"})

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5001)


"""
	SELECT
	  collection_id,
	  STRING_AGG(DISTINCT(Modality)) as modalities,
	  STRING_AGG(DISTINCT(BodyPartExamined)) as body_parts
	FROM
	  index
	GROUP BY
	  collection_id
	ORDER BY
	  collection_id ASC
"""
