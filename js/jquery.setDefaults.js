/* If you need to override the element handlers all you have to do is add a function with 
 * 	the same name as the handler eg. onElementFocus to 
 * 		elem.data('setDefaults._opts', {new opts that include opts.onElementFocus = function ....) 
 */
(function($,window){
	var _defaults = {
		defaultText : '',
		fontStyle : '',
		fontColor : '',
		defaultFontStyle : "italic",
		defaultFontColor : "#666666"
	};
	$.fn.setDefaults = function(options){
		
		return this.each(function(){
			var _opts = $.extend({}, _defaults, options);
			
			//check if the browser supports the "placeholder" attribute
			//if it does ignore everything
			if( typeof document.createElement("input").placeholder != "undefined" ) return this;
			
			_opts.defaultText = _opts.defaultText || $(this).attr('placeholder') || $(this).attr('data-default');
			_opts.fontStyle = _opts.fontStyle || $(this).css('fontStyle');
			_opts.fontColor = _opts.fontColor || $(this).css('color');
			
			$(this).data('setDefaults._opts', _opts);
			$(this).bind('focus', onElementFocus);
			$(this).bind('blur', onElementBlur);
			$(this).parents('form').bind('submit', {_scope:$(this)}, onFormSubmit);
			$(this).blur();
			
			if ($(this).val() == _opts.defaultText){
				$(this).css({
					color:_opts.defaultFontColor,
					fontStyle:_opts.defaultFontStyle
				});
			};
		});
	};
	function onElementFocus(e){
		var _opts = $(this).data('setDefaults._opts');
		// call this element's override if one exists
		if(_opts.onElementFocus!=undefined){
			_opts.onElementFocus(e);
			return;
		}
		// do the default action
		if ($(this).val() == _opts.defaultText){
			$(this).val('');
			$(this).css({
				color:_opts.fontColor,
				fontStyle:_opts.fontStyle
			});
		};
	};
	function onElementBlur(e){
		var _opts = $(this).data('setDefaults._opts');
		// call this element's override if one exists
		if(_opts.onElementBlur!=undefined){
			_opts.onElementBlur(e);
			return;
		}
		// do the default action
		if($(this).attr('disabled')=='disabled') return;
		if ( $.trim($(this).val()) == '' ){
			$(this).val(_opts.defaultText);
			$(this).css({
				color:_opts.defaultFontColor,
				fontStyle:_opts.defaultFontStyle
			});
		};
			
	};
	function onFormSubmit(e){
		var _this = e.data._scope;
		var _opts = _this.data('setDefaults._opts');
		if (_this.val() == _this.data('default'))
			_this.val('');
			
	};
})(jQuery,window);