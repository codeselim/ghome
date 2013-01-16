
// those variables are global in order not to compile the regexp every time we execute the tpl engine...
TPL_ENGINE_regexp = new RegExp("\\{\\$([A-Z_]+)\\}", "g")
TPL_ENGINE_regexp2 = new RegExp("\\{\\$([A-Z_]+)\\}", "")
//* @param data dictionary of the form {'VAR_NAME_IN_TEMPLATE': 'Value to be put in place of the template variable', etc... }
//* @param template_name is the name of the template we wanna read and parse
function template_engine(template_name, data) {
	// somehow gets the content of the file "template_name.html" in the templates/views folder
	template_content = somehow()
	
	m = template_content.match(TPL_ENGINE_regexp)
	result = template_content
	for(i = 0; i<m.length; i++) {
		result = result.replace(m[i], data[m[i].replace(TPL_ENGINE_regexp2, "$1")])
	}

	return result
}