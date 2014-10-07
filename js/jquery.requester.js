// create closure
(function($) {
	// plugin definition

	$.fn.requester = function(options) {
		
		var _idAdd = new Date().getTime();
		
		var defaults = {
			loaderBackgroundColor : "#ffffff",
			position:"center",
			loaderId : "loader_display_"+_idAdd,
			overlayId : "loader_display_overlay_"+_idAdd,
			messageId : "loader_display_message_"+_idAdd,
			loaderContainer : "loader_display_img_container",
			loaderContent : "<div class='loader_display_img_container'><img class='ajax_loader_gif' src='http://drive.gloveboxcms.com/themes/drive/ymm/_assets/images/ajax-loader.gif' alt='' title='' /></div>",
			loaderObj : null
		};

		var ajaxDefaults = {
			type : "GET",
			dataType: "json",
			url : null,
			data : null,
			onSuccess: null,
			onError : null
		}
		var opts = $.extend(defaults, options);
		var currentRequest = null;
		
		this.disableLoaderDisplay = false;
		
		/*
		 * Can have multiple requests or just one
		 * single:
		 * same format as ajaxDefaults
		 * multiple:
		 * {onSuccess:function, requests:[singleObj, singleObj]}
		 */
		
		this.request = function(params) {
			//only one request
			if ( typeof params.requests == "undefined"){
				return request.call(this, $.extend({}, ajaxDefaults, params), $(this).data());
			} else if ( typeof params.requests == "object"){
				if ( params.requests.length > 1 ){
					request.call(this, $.extend({}, ajaxDefaults, params.requests[0]), $(this).data(), true);
					//cut of one request because we just requested it
					params.requests.splice(0,1);
					this.request(params);
					
				} else {
					params.requests[0].onSuccess = params.onSuccess;
					request.call(this, $.extend({},ajaxDefaults, params.requests[0]), $(this).data())
				}
			};
		};
		
		this.abort = function(){
			currentRequest.abort();
		};
		
		this.getLoaderObject = function(){
			return $(this).data().requester.loaderObj;
		};
		
		return this.each( function() {
			opts._this = this;
			opts.loaderObj = opts.loaderObj || $(this).loaderDisplay(opts);
			$(this).data('requester', opts);
			//what you want to do to each element you assign the plugin to
			return this;
		});
	};
	// methods that are generic to all the elements
	function request(params, obj, persist) {
		var _requestObj = obj.requester;
		var _persist = persist || false;
		var _this = this;
		if ( !_this.disableLoaderDisplay )
			_requestObj.loaderObj.showLoader(100);
		
		
		return $.ajax({
					url: params.url,
					type: params.type,
					dataType: params.dataType,
					data: params.data,
					success: function(val) {
							if ( !_persist ){
								if ( !_this.disableLoaderDisplay )
									_requestObj.loaderObj.animateOut(250);
								if (params.onSuccess != null)
									params.onSuccess(val);
							}
					},
					error : function(val) {
						if ( !_this.disableLoaderDisplay )
							_requestObj.loaderObj.animateOut(250);
						if (params.onError != null)
							params.onError(val);
					}
				});
	};
})(jQuery);
(function($) {

	$.fn.loaderDisplay = function(options) {
		
		var _idAdd = new Date().getTime();
		
		var defaults = {
			loaderBackgroundColor : "#ffffff",
			position:"center",
			loaderId : "loader_display_"+_idAdd,
			overlayId : "loader_display_overlay_"+_idAdd,
			messageId : "loader_display_message_"+_idAdd,
			loaderContainer : "loader_display_img_container",
			loaderContent : "<div class='loader_display_img_container'><img class='ajax_loader_gif' src='http://drive.gloveboxcms.com/themes/drive/ymm/_assets/images/ajax-loader.gif' alt='' title='' /></div>"
		};
		var opts = $.extend(defaults, options);
		var _this = this;
		this.loaderContentContainer = '.loader_display_img_container';

		this.showLoader = function(_duration) {
			show(this, _duration);
		};
		this.hideLoader = function() {
			hide();
		};
		this.animateOut = function(_duration) {
			animateOut(this, _duration);
		};
		return this.each( function() {
			//<p id='"+opts.messageId+"' class='round_all loader_display_loading_message'>This is a laoder message</p>
			$(this).prepend("<div class='loader_display' id='"+opts.loaderId+"'><div class='loader_display_overlay' id='"+opts.overlayId+"'></div>"+opts.loaderContent+"</div>")
			var _width = _this.width();
			var _height = _this.height();
			$(this).css({position:"relative"});
			$('#'+opts.loaderId).css({
				width:_width,
				height:_height,
				position:"absolute",
				top: "0px",
				left:"0px"
				
			});
			$('#'+opts.overlayId).css({
				width:_width,
				height:_height,
				backgroundColor:opts.loaderBackgroundColor
			});
			
			$(this).data('loaderDisplay', opts);
			$("#"+opts.loaderId).find('.'+opts.loaderContainer).css('display',"none");
			animateOut(this,5);
			return this;
		});
	};
	function show(_element, _duration, _message) {
		_duration = _duration || 250;
		
		var _data = _element.data('loaderDisplay');
		
		_message = "Loading your page..."
		//setMessage(_data, _message);
		
		$('#'+_data.loaderId).css({
			display:'block'
		});
		var _width = _element[0].nodeName == "BODY" ? $(window).width() : _element.innerWidth();
		var _height = _element[0].nodeName == "BODY" ? $(window).height() : _element.innerHeight();
		
		$('#'+_data.overlayId)
			.css({
				opacity: 0,
				width:_width,
				height:_height
			})
			.animate({
				opacity:.25
			}, _duration);
		
		$('#'+_data.loaderId)
			.find("."+_data.loaderContainer).stop()
			.css({
				opacity:0,
				display:"block", 
				position:"absolute"
			})
			.animate({
				width:"30px",
				height:"30px",
				top: "58%",
				left: "45%",
				opacity:1
			}, _duration);
		
		//debug
		/*$('#'+_data.loaderId).click( function() {
			animateOut(_element, _duration)
		})*/
	};

	function animateOut(_element, _duration) {
		_duration = !_duration ? 250 : _duration;

		var _data = $(_element).data('loaderDisplay');
		$("#"+_data.loaderId).find('.'+_data.loaderContainer).stop().animate({
			opacity:0
		}, _duration, function() {
			$("#"+_data.loaderId).find('.'+_data.loaderContainer).css('display', "block");
			$("#"+_data.loaderId).css({
				display:'none'
			});
		});
		
		$('#'+_data.messageId).animate
		
		$('#'+_data.overlayId).animate({
			opacity:0
		})
	};
	
	function setMessage(_data, _message){
		$('#'+_data.messageId).html(_message);
		$('#'+_data.messageId).css({
			position:'absolute',
			display:'block',
			marginLeft:-Math.floor(($('#'+_data.messageId).width()/2+10))
		});
	};

})(jQuery);
