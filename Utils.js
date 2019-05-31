'use strict';

var pi2 = Math.PI * 2;
				
// http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
// t: current time, b: beginning value, c: change in value, d: duration
function ease_quintic(t, b, c, d)   { var ts = (t /= d) * t;     var tc = ts * t; return b + c * (tc * ts); }
function ease_quartic(t, b, c, d)   { var ts = (t /= d) * t;                      return b + c * (ts * ts); }
function ease_cubic(t, b, c, d)     { var tc = (t /= d) * t * t;                  return b + c * (tc);      }
function ease_quadratic(t, b, c, d) { var ts = (t /= d) * t;                      return b + c * (ts);      }
function ease_inout_quintic(t, b, c, d) {
	if ((t /= d / 2) < 1) { return c / 2 * t * t * t * t * t + b; }
	return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
}

function min(a, b) { return a < b ? a : b; }
function max(a, b) { return a > b ? a : b; }
function clamp(n, min, max) { return n < min ? min : n > max ? max : n; }
function rand(min, max) { return Math.random() * (max - min) + min; }
function empty(o) { return undefined === o || null === o || '' === o || 0 === o.length; }

function strtolen(str, len) {
	if(str.length <= len) { return str; }

	str = str.substr(0, len);
	
	var i = str.lastIndexOf(' ');
	if(-1 !== i) {
		str = str.substr(0, i);
	}

	str += ' ...';

	return str;
}

if(!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	}
}

function init_element(selector, callback, i) {
	i = i || 0;
	var e = document.querySelector(selector);
	
	if(!e && i < 50) {
		setTimeout(function() { return init_element(selector, callback, ++i); }, 100);
		return;
	}
	
	if(callback) { callback(e); }
}

function strip_tag(e, tag) {
	tag = tag.toUpperCase();
	
	if(e.tagName && e.tagName.toUpperCase() === tag) {
		var frag = document.createDocumentFragment();
		
		while(e.firstChild) {
			strip_tag(e.firstChild, tag);
			frag.appendChild(e.firstChild);
		}
		
		e.parentNode.replaceChild(frag, e);
	} else {				
		for(var i = 0, len = e.childNodes.length; i < len; ++i) {
			strip_tag(e.childNodes[i], tag);
		}
	}
}

function clear_children(e) {
	var last;
	while(last = e.lastChild) {
		e.removeChild(last);
	}
}

function Rect() {
	this.top = null;
	this.left = null;
	this.bottom = null;
	this.right = null;
}

function force_redraw(e) {
	var s = e.style;
	var d = s.display;
	
	s.display = 'none';
	e.offsetHeight;
	s.display = d;
}

function get_relative_position(el, container) {
	var rect = new Rect();
	
	var t = 0;
	var l = 0;
	var b = 0;
	var r = 0;

	while (el && el !== container && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		l += el.offsetLeft;
		t += el.offsetTop;

		var op = el.offsetParent;
		var p = el;
		while (p !== op) {
			var style = window.getComputedStyle(p);
			var xform_matrix = style[Transforms.xform];
			if ('none' !== xform_matrix && '' !== xform_matrix) {
				var mat_arr = xform_matrix.replace('matrix(', '').replace('matrix3d(', '').replace(')', '').split(',');

				var ml = 0;
				var mt = 0;
				if (-1 != xform_matrix.indexOf('3d')) {
					ml = parseFloat(mat_arr[12]);
					mt = parseFloat(mat_arr[13]);
				} else {
					ml = parseFloat(mat_arr[4]);
					mt = parseFloat(mat_arr[5]);
				}

				l += ml;
				r += ml;

				t += mt;
				b += mt;
			}

			p = p.parentNode;
		}

		if (op) {
			b += op.offsetHeight - el.offsetHeight - el.offsetTop;
			r += op.offsetWidth - el.offsetWidth - el.offsetLeft;
		}

		el = op;
	}
	
	rect.top = t;
	rect.left = l;
	rect.right = r;
	rect.bottom = b;
	
	return rect;
}

function is_visible(e) {
	var style = e.style;

	return !(
		   'hidden' === e.type
		|| 'none' === style.display
		|| 'hidden' === style.visibility
		|| 0 === e.offsetHeight
		|| 0 === e.offsetWidth
	);
}

function visible_elements() {
	var all_arr = document.querySelectorAll('input,select,textarea');
	for(var i = 0, j = 0, arr = [], len = all_arr.length; i < len; ++i) {
		var e = all_arr[i];
		if(is_visible(e)) {
			arr[j++] = e;
		}
	}
	
	return arr;
}

function get_tab_element(e, dir) {
	var arr = visible_elements();
	var len = arr.length;
	
	if (1 === len) { return null; }
	
	var i = arr.indexOf(e);
	if(-1 === i) { return null; }
	
	i += dir;
	if(i < 0) {
		i = 0;
	} else if(i >= len) {
		i = len - 1;
	}
	
	return arr[i];
}

function detect_ie() {
	var ua = navigator.userAgent;

	var msie = ua.indexOf('MSIE ');
	if (msie > 0) {
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	}

	var trident = ua.indexOf('Trident/');
	if (trident > 0) {
		var rv = ua.indexOf('rv:');

		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
	}

	var edge = ua.indexOf('Edge/');
	if (edge > 0) {
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
	}

	return false;
}

function detect_mobile() {
	var ua = navigator.userAgent;
	
	return (
		   ua.match(/Android/i)
		|| ua.match(/webOS/i)
		|| ua.match(/iPhone/i)
		|| ua.match(/iPad/i)
		|| ua.match(/iPod/i)
		|| ua.match(/BlackBerry/i)
		|| ua.match(/Windows Phone/i)
	);
}

function shift_down(arr, num) {
	for(var i = 0, len = num % arr.length; i < len; ++i) {
		arr.push(arr.shift());
	}
}

function shift_up(arr, num) {
	for(var i = 0, len = num % arr.length; i < len; ++i) {
		arr.unshift(arr.pop());
	}
}

function remove_at(arr, index) {
	var len = arr.length - 1;
	for(var i = index; i < len; ++i) {
		arr[i] = arr[i + 1];
	}
	
	arr.length = len;
}

function cypher(key, cypher_protocol, cypher_link, id, text, css_class) {
	var b = key.split('').sort().join('');
	var d = '', p = '';

	for (var i = 0, len = cypher_link.length; i < len; ++i) {
		d += b.charAt(key.indexOf(cypher_link.charAt(i)));
	}

	for (var i = 0, len = cypher_protocol.length; i < len; ++i) {
		p += b.charAt(key.indexOf(cypher_protocol.charAt(i)));
	}

	if (empty(text)) { text = d; }
	if (!empty(css_class)) {
		css_class = 'class="' + css_class + '" ';
	}

	document.getElementById(id).innerHTML = '<a ' + css_class + 'href="' + p + ':' + d + '">' + text + '</a>';
}