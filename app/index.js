var $ = require('./jquery');
window.$ = $;
(function(factory){
	module.exports = factory($);
}(function($){
	//在parseCookieValue方法中使用
	var pluses = /\+/g;

	function encode(s){
		/*
			config.raw为true的时候(默认是编码)
			直接返回s，
			否则使用进行URI编码
		*/
		return config.raw ? s: encodeURIComponent(s);
	}
	function decode(s){
		return config.raw ? s : decodeURIComponent(s);
	}
	function stringifyCookieValue(value){
		//如果配置为json格式，将json转化成字符串再进行URI encode
		return encode(config.json ? JSON.stringify(value) : String(value))
	}
	function parseCookieValue(s){
		if(s.indexOf('"') === 0){
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		try {
			console.log(111, s);
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}
	/*
		result = read(cookie, value);
	*/
	function read(s, converter){
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}
	var config = $.cookie = function(key, value, options){
		//当参数多于1个并且第二个参数不是函数
		//如果只传入了key和options这里会出错，所以要按照参数顺序传递
		if(arguments.length > 1 && !$.isFunction(value)){
			//config.defaults在下面有定义(可以自定义)
			options = $.extend({}, config.defaults, options);
			if(typeof options.expires === 'number'){
				var days = options.expires,
					t = options.expires = new Date();
				/*
					setMilliseconds(millisec)
					millisec必需。用于设置 dateObject 毫秒字段，在当前时间的基础上增加 dateObject 毫秒。 
					方法用于设置指定时间的毫秒字段。

					dateObject.getMilliseconds()
					dateObject 的毫秒字段，以本地时间显示。
					
					864e+5是86400000
					也就是60*60*24*1000，一天的毫秒数			
				*/
				t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
			}
			//将数组元素拼接成连续字符串
			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				//使用expires特性, max-age不被IE支持
				options.expires ? '; expires=' + options.expires.toUTCString() : '',
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
			].join(''));
		}
		//当不传参数或者只传一个为读取cookie
		var result = key ? undefined : {},
			cookies = document.cookie ? document.cookie.split('; ') : [],
			i = 0,
			l = cookies.length;
		for(; i < l; i++){
			var parts = cookies[i].split('='),
				name = decode(parts.shift()),
				cookie = parts.join('=');
			//如果找到指定的key
			if(key === name){
				result = read(cookie, value);
				break;
			}
			//当没有传key
			if(!key && (cookie = read(cookie)) !== undefined){
				result[name] = cookie;
			}
		}
		return result;
	}
	config.defaults = {};
	$.removeCookie = function(key, options){
		//设置为一天前过期
		$.cookie(key, '', $.$.extend({}, options, { expires: -1}));
		//返回该key的查询
		return !$.cookie(key);
	}
}));
