//* Module containing utils for template parsing/decoding for the webserver

var DBG = true // Use this variable when developping, will disable cache (and maybe other things... !)
var fs = require('fs')
var Mustache = require('mustache')

// those variables are global in order not to compile the regexp every time we execute the tpl engine...
// var TPL_ENGINE_regexp = new RegExp("\\{\\$([A-Z_]+)\\}", "g")
// var TPL_ENGINE_regexp2 = new RegExp("\\{\\$([A-Z_]+)\\}", "")
var TPL_ENGINE_cache = {}
var TPL_ENGINE_views_dir = "../../views/"

function init_views_dir (views_dir) {
	TPL_ENGINE_views_dir = views_dir
}

//* @param data dictionary of the form {'VAR_NAME_IN_TEMPLATE': 'Value to be put in place of the template variable', etc... }
//* @param template_name is the name of the template we wanna read and parse
function template_engine(template_name, data) {
	// somehow gets the content of the file "template_name.html" in the views_dir folder
	if (DBG) {
		//* No cache
		return Mustache.to_html(fs.readFileSync(TPL_ENGINE_views_dir + template_name, "utf8"), data)
	} else {
		//* Precompilation of the template and caching
		var compiled_template = get_compiled_template(template_name)
		console.log('compiled_template: ' + compiled_template)
		return compiled_template(data)
	}
}

function get_compiled_template (template_name) {
	if (! TPL_ENGINE_cache[template_name]) {
		console.log('file to cache: ' + TPL_ENGINE_views_dir + template_name)
		//* toString after readFileSync is required, compile doesn't work on buffers
		TPL_ENGINE_cache[template_name] = Mustache.compile(fs.readFileSync(TPL_ENGINE_views_dir + template_name).toString());
		console.log(TPL_ENGINE_cache[template_name])
	}
	console.log(TPL_ENGINE_cache[template_name])
	return TPL_ENGINE_cache[template_name]
}

exports.get_template_result = template_engine
exports.init_views_dir = init_views_dir