'use strict';

(function() {
	var c_start = '<!-' + '-';
	var c_end = '-' + '->';
	var t_reg = /\t/g;

	function Template(id) {
		var e = document.getElementById(id);

		if (!e) { throw 'Invalid template'; }
		
		var token_arr;
		var key_index;
		
		function init(e) {
			var html = e.innerHTML.trim();
			var len = html.length;

			var start = 0 === html.indexOf(c_start) ? c_start.length : 0;
			var end = html.length;
			if(end - c_end.length === html.indexOf(c_end)) {
				end -= c_end.length;
			}
			
			html = html
				.substring(start, end)
				.trim()
				.replace(t_reg, '')
			;
			
			var tokens = html.split('#');
			
			// There should always be an even number of #'s
			if(0 !== (tokens.length - 1) % 2) {
				throw 'Invalid template';
			}
			
			parse_html(tokens);
		}
		
		function parse_html(t_arr) {
			token_arr = [];
			key_index = {};
			
			var key_lens = {};
			var j = 0;
			
			for(var i = 0, len = t_arr.length - 1; i <= len; ++i) {
				var token = t_arr[i];
				
				// Keys inside hashes will always be odd indices
				var odd = 0 !== i % 2;
				
				// Handle escaped hash or hashes at the beginning or end of the tokens
				if('' === token) {
					if(i !== 0 && i !== len) {
						if(odd) {
							token_arr[j++] = '#';
						} else {
							// Todo: add hash parsing for JS inside key
						}
					}
				} else {
					if(odd) {
						if('=' === token[0]) {
							var key = token.substring(1, token.length).trim();
							
							if(undefined === key_index[key]) {
								key_index[key] = [];
								key_lens[key] = 0;
							}
							
							key_index[key][key_lens[key]++] = j;
						} else {
							// Todo: add JS parser
						}
						
						token_arr[j++] = '';
					} else {
						token_arr[j++] = t_arr[i];
					}
				}
			}
		}
		
		this.render = function (o) {
			var html = '';
			
			if(undefined !== o) {
				for(var key in o) {
					if (key === 'length' || !o.hasOwnProperty(key)) { continue; }
					
					var val = o[key];
					var i_arr = key_index[key];
					
					if(undefined === i_arr) { continue; }
					
					for(var i = 0, len = i_arr.length - 1; i <= len; ++i) {
						token_arr[i_arr[i]] = val;
					}
				}
			}
			
			for(var i = 0, len = token_arr.length - 1; i <= len; ++i) {
				html += token_arr[i];
			}
			
			return html;
		}
		
		this.render_dom = function (o) {
			var html = this.render(o);

			var div = document.createElement('div');
			div.innerHTML = html;

			var frag = document.createDocumentFragment();
			while (0 !== div.children.length) {
				frag.appendChild(div.children[0]);
			}

			return frag;
		}
		
		init(e);
	}
	
	
	
	window.Template = Template;
})();