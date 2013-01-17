//* Module containing utils for template parsing/decoding for the webserver

var DBG = true // Use this variable when developping, will disable cache (and maybe other things... !)
var fs = require('fs')

// those variables are global in order not to compile the regexp every time we execute the tpl engine...
var TPL_ENGINE_regexp = new RegExp("\\{\\$([A-Z_]+)\\}", "g")
var TPL_ENGINE_regexp2 = new RegExp("\\{\\$([A-Z_]+)\\}", "")
var TPL_ENGINE_cache = {}
var TPL_ENGINE_views_dir = ""

function init_views_dir (views_dir) {
	TPL_ENGINE_views_dir = views_dir
}

//* @param data dictionary of the form {'VAR_NAME_IN_TEMPLATE': 'Value to be put in place of the template variable', etc... }
//* @param template_name is the name of the template we wanna read and parse
function template_engine(template_name, data) {
	// somehow gets the content of the file "template_name.html" in the templates/views folder
	template_content = get_template_file(template_name)
	
	m = template_content.match(TPL_ENGINE_regexp)
	result = template_content
	for(i = 0; i<m.length; i++) {
		result = result.replace(m[i], data[m[i].replace(TPL_ENGINE_regexp2, "$1")])
	}

	return result
}

function get_template_file (template_name) {
	
	if (false == DBG) {
		if (template_name in TPL_ENGINE_cache) {
			content = TPL_ENGINE_cache[template_name]
		} else {
			content = fs.readFileSync(TPL_ENGINE_views_dir + "template_name")
		}
	}
}

exports.get_template_result = template_engine
exports.init_views_dir = init_views_dir