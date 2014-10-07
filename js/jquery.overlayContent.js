(function($) {
	$.fn.overlayContent = function(options) {
		var defaults = {
			closeSelector:"#overlay_close",
			attr:"href",
			width:560,
			height:349,
			animationDuration:500,
			animateOut:false
		}
		var _opts = $.extend(defaults, options);
		
		
		_opts._elements = createOverlay(_opts);
		
		return this.each( function() {
			_opts._this = $(this);
			$(this).on('click', {scope:$(this)}, onOverlayContentClick);
			$(this).data('overlayContent.opts' , _opts);
			return this;
		});
	};
	
	function onOverlayContentClick(e) {
		e.preventDefault();
		var _this = e.data.scope;
		var _opts = _this.data('overlayContent.opts');
		addGlobalListeners(_opts);
		if (_opts.attr == 'html'){
			//get content for popup based on ID
		} else {
			_opts._elements.$_iframe.css('display', 'block');
			_opts._elements.$_iframe.attr('src', _this.attr(_opts.attr));
		}
		
		if ( _opts.animationDuration > 0 )
			animateOpen(_opts);
		else
			open(_opts);
		
		$(_this).trigger('open', [_this]);
		return false;
	};
	
	function closeOverlayContent(e){
		var _opts = e.data._opts;
		if ( _opts.animationDuration > 0 && _opts.animateOut )
			animateClose(_opts);
		else
			close(_opts);
	};
	
	function animateOpen(_opts){
		_opts._elements.$_overlay.css({'opacity':'0', "display":"block"});
		_opts._elements.$_contentContainer.css({'opacity':'0', "display":"block"});
		_opts._elements.$_container.css('display', "block");
		_opts._elements.$_overlay.animate({opacity:"0.75"}, _opts.animationDuration/2, function(){
			_opts._elements.$_contentContainer.animate({opacity:1}, _opts.animationDuration, function(){
				
			});
		});
	};
	
	function animateClose(_opts){
		_opts._elements.$_contentContainer.animate({opacity:0}, _opts.animationDuration/2, function(){
			_opts._elements.$_overlay.animate({opacity:0}, _opts.animationDuration/2, function(){
				close(_opts)
			});
		});
	}
	
	function close (_opts){
		_opts._elements.$_overlay.css('display', "none");
		_opts._elements.$_contentContainer.css('display', "none");
		_opts._elements.$_container.css('display', "none");
		_opts._this.trigger('close', [_opts._this]);
		_opts._elements.$_iframe.attr('src', '');
		removeGlobalListeners(_opts);
	};
	
	function open(_opts){
		_opts._elements.$_overlay.css('display', "block");
		_opts._elements.$_contentContainer.css('display', "block");
		_opts._elements.$_container.css('display', "block");
	};
	function createOverlay(_org){
		var idAddon = generateId();
		var _opts = {};
		var _html = "<div class='overlay_content_container' id='overlay_content_"+idAddon+"'>";
				_html += "<div id='overlay_content_container_"+idAddon+"'>";
					_html += "<div id='overlay_background_"+idAddon+"'>";
						_html += "<iframe frameborder='0' allowfullscreen id='overlay_content_iframe_"+idAddon+"'></iframe>";
						_html += "<div id='overlay_content_html_content'></div>"
						_html += "<div id='"+_org.closeSelector.replace('#','')+"'></div>"
					_html += "</div>";
				_html += "</div>";
				_html += "<div id='overlay_"+idAddon+"'></div>";
			_html += "</div>";
		$('body').prepend(_html);
		
		_opts.$_container = $('#overlay_content_'+idAddon);
		_opts.$_contentContainer = $('#overlay_content_container_'+idAddon);
		_opts.$_backgroundContainer = $('#overlay_background_'+idAddon);
		_opts.$_overlay = $('#overlay_'+idAddon);
		_opts.$_iframe = $('#overlay_content_iframe_'+idAddon);
		_opts.$_htmlContent = $('#overlay_content_html_content');
		
		_opts.$_htmlContent.css({'display':"none"});
		_opts.$_iframe.css({display:'none', width:"100%", height:"100%"});
		_opts.$_container.css({display:"none", position:"fixed", top:'0', left:'0', zIndex:"999"});
		_opts.$_overlay.css({background:"#000000",opacity:"0.5",top:'0',left:'0',zIndex:"998"});
		_opts.$_backgroundContainer.css({padding:'15px',background:"#ffffff", position:"relative",width:_org.width, height:_org.height});
		_opts.$_contentContainer.css({position:"absolute", padding:'45px', width:_org.width, height:_org.height,zIndex:"999", overflow:"visible"});
		
		return _opts;
	}
	
	function addGlobalListeners(_opts){
		$(document).on('click', _opts.closeSelector, {_opts:_opts}, closeOverlayContent);
		$(document).on('click', _opts._elements.$_overlay.selector, {_opts:_opts}, closeOverlayContent);
		$(window).on('resize', {_opts:_opts}, setPosition);
		setPosition(null, _opts);
	};
	
	function removeGlobalListeners(_opts){
		$(window).off('resize');
	};
	
	function setPosition(e, _opts){
		if ( typeof _opts == "undefined")
			_opts = e.data._opts;
		var _width = $(window).width()+30;
		var _height = $(window).height()+30;
		
		_opts._elements.$_overlay.css({width:_width,height:_height});
		_opts._elements.$_contentContainer.css({top:(_height/2) - (_opts.height/2) -80, left:(_width/2) - (_opts.width/2) - 50});
	};
	
	function generateId() {
		var d = new Date();
        return d.getTime()+Math.floor(Math.random()*d.getTime());
    }

})(jQuery);