Backend API Endpoints

/api/upload
body
{
"userId" : string,
"image" : 64 encoded png
}

/api/query
body
{
"text" : string,
"userId" : string
}

/api/create_user
body
{
"userId" : string
}

/api/add classes
body
{
"userId" : string,
"classes" : [string ... ]
}

/api/get_subjects
body
{
"userId" : string
}

/api/get_nodes
body
{
"userId" : string
"class" : string
}
