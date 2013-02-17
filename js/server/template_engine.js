//* Module containing utils for template parsing/decoding for the webserver

var DBG = true // Use this variable when developping, will disable cache (and maybe other things... !)
var fs = require('fs')
var tplengine = require('mustache')

// those variables are global in order not to compile the regexp every time we execute the tpl engine...
var TPL_ENGINE_cache = {}
var TPL_ENGINE_views_dir = "../../views/"

//* Pre-compiling standard partials
tplengine.compilePartial('header', fs.readFileSync(TPL_ENGINE_views_dir + 'header.html').toString())
tplengine.compilePartial('footer', fs.readFileSync(TPL_ENGINE_views_dir + 'footer.html').toString())

function init_views_dir (views_dir) {
	TPL_ENGINE_views_dir = views_dir
}

//* @param data dictionary of the form {'VAR_NAME_IN_TEMPLATE': 'Value to be put in place of the template variable', etc... }
//* @param template_name is the name of the template we wanna read and parse
function template_engine(template_name, data/*, partials*/) {
	// somehow gets the content of the file "template_name.html" in the views_dir folder
	// if (!partials || null == partials || typeof partials == "undefined") {
	// 	partials = {}
	// }
	if (DBG) {
		//* No cache, directly execute i/o and template parsing and also re-render the default partials
		tplengine.compilePartial('header', fs.readFileSync(TPL_ENGINE_views_dir + 'header.html').toString())
		tplengine.compilePartial('footer', fs.readFileSync(TPL_ENGINE_views_dir + 'footer.html').toString())
		return tplengine.to_html(fs.readFileSync(TPL_ENGINE_views_dir + template_name, "utf8").toString(), data)
	} else {
		//* Precompilation of the template and caching
		var compiled_template = prepare_template(template_name, partials)
		return compiled_template(data)
	}
}

/** 
 * Prepares the template: 
 * When cache is not disabled, will cache compiled template in memory so that we don't redo I/O operations
 * and have a less CPU-itensive process when parsing the template (compiled templates are parsed faster)
 *
*/
function prepare_template (template_name, partials) {
	if (! TPL_ENGINE_cache[template_name]) {
		//* toString after readFileSync is required, compile doesn't work on buffers
		TPL_ENGINE_cache[template_name] = tplengine.compile(fs.readFileSync(TPL_ENGINE_views_dir + template_name).toString());
	}
	return TPL_ENGINE_cache[template_name]
}

exports.get_template_result = template_engine
exports.init_views_dir = init_views_dir