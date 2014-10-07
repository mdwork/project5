if (typeof this.console === "undefined") {
	this.console = {};
	this.console.log = function() {};
}
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  }
}

(function(window, $){
	
	var YMM = window.YMM = function(){};
	YMM.init = function(){
		$(window).on("resize", onBrowserResize);
		
		$("input[type='text']").setDefaults();
		
		$("._gb_fix_text").fitText(1.3, {minFontSize:"12px"});
		$("#title-container").css({position:"absolute", margin:0,top:0});
		//alignPanoTitles();
		onBrowserResize();
		GBSocial.init();
		
		$("#contactus-flag #trigger").on("click", onPulloutClick);

		parseGET.set();
	};
	
	YMM.onResize = function(){
		//if ( $.support.cssFloat )
		onBrowserResize();
	}
	
	function onPulloutClick(){
		var $this = $(this).parent();
		if ( $this.hasClass("open")){
			$this.animate({left:-400}, 300, function(){
				$this.removeClass("open");
				$this.animate({left:-355}, 300);
			})
		} else {
			$this.animate({left:-400}, 300, function(){
				$this.addClass("open");
				$this.animate({left:-15}, 300);
			})
		}
	};
	
	function alignPanoTitles(){
		//@TODO this centers the copy in the pano area
		//broken right now and Can't figure it out
		//look at it with some fresh eyes later
		var $pano = $("#pano");
		var $sidebar = $("#sidebar");
		var _height = ($sidebar.offset().top - $pano.offset().top );
		
		
		var sideBarTopHeight = $("#pano").height() - (parseFloat($sidebar.css("paddingTop")));
		
		/*$sidebar.css({
			paddingTop:(sideBarTopHeight - $sidebar.find(".zip-postal-form").height())/2
		})*/
		var _titleHeight = sideBarTopHeight - $(".sidebar-container .free-quote-top").innerHeight();
		var _paddingTop = (_titleHeight - $("#sidebar-title-top #tpl_labellink").height())/2
		$("#sidebar-title-top").css({
			height:_titleHeight,
			paddingTop : _paddingTop
		})
		
		if ( $("#home").length > 0 ){
			$("#sidebar-title-top").css({
				paddingLeft:$sidebar.offset().left - $("#sidebar-title-top").offset().left
			});
		}
	};

function onBrowserResize(e){

	var $sidebar = $("#sidebar");
	$("#pano").css({height:$("#pano img").height()})
	$sidebar.css("height", "");
		//position the sidebar
		//needs to be chained because onload marginTop=0 so that needs to be applied before the height can be determined
		$sidebar.css({
			right:0,
			marginTop:-($("#pano").height()*($(".half-sidebar").length == 0 ? 1 : .33))
		})
		
		var additionalHeight = $("#homepage-callout").length > 0 ? $("#homepage-callout").height() - (parseFloat($("#page-content").css("paddingBottom"))) : 0
		if ( $.support.cssFloat ){
			if ( $sidebar.height() < $("#page-content-container").height() + Math.abs(parseInt($("#sidebar").css("marginTop")))){

				if ( $("#home").length > 0 )
					$sidebar.css({
						height:$("#page-content-container").innerHeight() + Math.abs(parseInt($("#sidebar").css("marginTop")))
					});
				else
					$sidebar.css({
						height:$("#page-content-container").innerHeight() + Math.abs(parseInt($("#sidebar").css("marginTop"))) + additionalHeight
					});
				
			} else{
				$("#page-content-container").css({
					minHeight:$sidebar.outerHeight(true) + additionalHeight
				})
			}
		} else {
			$("#page-content-container").css({
				paddingBottom:additionalHeight
			})
			if ( $sidebar.height() < ($("#page-content-container").innerHeight() + Math.abs(parseInt($("#sidebar").css("marginTop"))) + additionalHeight)){
				
				$sidebar.css({
					height:$("#page-content-container").height() + Math.abs(parseInt($("#sidebar").css("marginTop"))) + additionalHeight
				});
				
			}else{
				$("#page-content-container").css({
					minHeight:$sidebar.outerHeight(true)+ additionalHeight
				})
			}
		};
		alignPanoTitles();
		
	};
	
})(window, jQuery);

(function(window,$){
	
	var _requester = null;
	var _currentSocialMedia = null;
	var _triggered = false;
	var SPEED = 400;
	
	var GBSocial = window.GBSocial = function(){};
	
	GBSocial.init = function(){
		if ( typeof videoAutoPlay != "undefined" && videoAutoPlay && !_triggered) {
			var extra = "&autoplay=1";
			$(".video_trigger").attr("data-href", $(".video_trigger").attr("data-href")+extra);
			$(".video_trigger").trigger("click");
			$(".video_trigger").attr("data-href", $(".video_trigger").attr("data-href").replace(extra,""));
			_triggered = true;
		}
		
		if ($("#social-sidebar-tabs a").length == 0 )return false;
		_requester = $("#social-sidebar").requester();
		$("#social-sidebar-tabs a").on("click", onSocialTabClick);
		loadSocialTab($("#social-sidebar-tabs a:first-child").attr("rel"));
	};
	
	function onSocialTabClick(e){
		loadSocialTab($(this).attr("rel"));
		return false;
	};
	
	function loadSocialTab(socialMedia){
		if ( $("#sidebar-"+socialMedia+"-container").length == 0 ){
			_requester.request({
				url:"/!/social/"+socialMedia+"feed",
				dataType:"html",
				onSuccess:function(val){
					animateOutActive(function(){
						activeTransition(socialMedia,val);
					}, socialMedia);
				}
			});
		} else {
			animateOutActive(function(){
				activeTransition(socialMedia);
			});
		};
	};
	
	function activeTransition(socialMedia, val){
		if ( $("#sidebar-"+socialMedia+"-container").length == 0  && val)
			$("#social-siderbar-container").append(val);
		
		if ( typeof videoAutoPlay != "undefined" && videoAutoPlay && !_triggered) {
			var extra = "&autoplay=1";
			$(".video_trigger").attr("data-href", $(".video_trigger").attr("data-href")+extra);
			$(".video_trigger").trigger("click");
			$(".video_trigger").attr("data-href", $(".video_trigger").attr("data-href").replace(extra,""));
			_triggered = true;
		}
		_currentSocialMedia = socialMedia;
		$(".active-tab").removeClass("active-tab");
		$("#social-sidebar-tabs a."+socialMedia).addClass("active-tab");
		$("#sidebar-"+socialMedia+"-container")
		.css({opacity:0, display:"block"})
		.addClass("active-social");
		animateInActive();
	};
	
	function animateInActive(){
		
		var steps = $.support.cssFloat ? 0 : 9;
		
		var interval = setInterval(function(){
			steps++;
			YMM.onResize();
			if ( steps >= 10 )
				clearInterval(interval);
		},SPEED/10);
		
		$("#social-siderbar-container").animate({height:($(".active-social:eq(0)").innerHeight() + 20)}, SPEED, function(){
			$(".active-social").animate({opacity:1}, SPEED);
		})
	};
	
	function animateOutActive( callback, socialMedia ){
		if ( socialMedia  == _currentSocialMedia )return false;
		if ( $(".active-social").length == 0 ){
			if ( typeof callback != "undefined" )
				callback();
		};
		$(".active-social").animate({opacity:0}, SPEED, function(){
			$(this).css({opacity:0, display:"none"});
			$(".active-social").removeClass("active-social");
			$(".active-tab").removeClass("active-tab");
			if( typeof callback != "undefined" )
				callback();
		});
	};
	
})(window,jQuery);

var GBRouter = GBRouter || (function($){
	
	var Core = {},
	App = {},
	Router = {},
	Public = {};
	
	Core = {
		settings:{
			meta:{},
			init:function(delimeter){
				$('meta[name^="gb-"]').each(function(){
					try{
						Core.settings.meta[ this.name.replace('gb-','') ] = $.parseJSON(this.content);
					} catch(e){
						Core.settings.meta[ this.name.replace('gb-','') ] = (this.content);
					}
				});
				Router.parse();
			}
		},
		Util:{
			arrayToObject: function(arr){
				var obj = {};
				var pointer = obj;
				arr.forEach(function(item){
					if ( item != 0 && item )
						pointer = pointer[item] = {};
				});
				return obj;
			},
			verifyRoute:function(route){
				var pointer = Router.routes;
				route.forEach(function(item){
					if ( typeof pointer[item] == "undefined" ){
						pointer = false;
						return false;
					};
					pointer = pointer[item];
				});
				return pointer;
			}
		}
	};
	Router = {
		routes:{},
		parse:function(){
			var route = Core.settings.meta.route.split("-");
			//console.log(route);
			Router.routes = Core.Util.arrayToObject(route);
		}
	};
	App = {
		callbacks:{},
		init:function(){
			//functions that should run on every page
			App.eventCalled(Public.Events.READY)
		},
		eventCalled:function(event){
			if (typeof App.callbacks[event] == "undefined" ) return false;
			for( var i=0, len=App.callbacks[event].length; i < len; i++ ){
				if (typeof App.callbacks[event][i] != "undefined" )
					App.callbacks[event][i]();
			}

		}
	};
	Public = {
		Events:{
			READY:"READY" //called 
		},
		routes:{
			call:function(route, callback){
				var func = Core.Util.verifyRoute(route.split("-"));
				//console.log(func);
				//console.log(callback);
				if ( func && typeof callback != "undefined")
					callback(Core.settings.meta);
			}
		},
		executeRoute:function(route,callback){
			Public.routes.call(route,callback);
		},
		addEventListener:function(event, callback){
			if ( typeof App.callbacks[event] == "undefined" ) App.callbacks[event] = [];
			App.callbacks[event].push(callback);
		}
	};
	$(window).load(App.init);
	Core.settings.init();
	return Public;
})(jQuery);

GBRouter.executeRoute("combo",function(arguments){
});
GBRouter.executeRoute("combo-single",function(arguments){
});

GBRouter.executeRoute("locations",function(info){
	var _map = dash.GoogleMaps.createMap("locations-map",{mapType:"static", width:680, height:300});
	//placeMarkers(info.locations).centerPoints()
	var _markers = [];
	for( var i in info.locations){
		for(loc in info.locations[i]){
			for(var j=0, len=info.locations[i][loc].length; j<len; j++){
				_markers.push(info.locations[i][loc][j]);
			};
			
		};
		
	}
	_map.placeMarkers(_markers);
	
	_map.centerPoints();
	
	$("body").on("GOOGLE_MAP_MARKER_CLICKED", function(e, marker){
		dash.GoogleMaps.zoomTo(marker.getPosition());
	});
});

GBRouter.executeRoute("combo-faq", function(){
	$(".faq_block").each(function(){
		$(this).css({width:$(this).innerWidth(), height:$(this).innerHeight()});
		$(this).data("size", {width:$(this).innerWidth(), height:$(this).innerHeight()});
	}); 
	
	var open = function($parent){
		var _w  = parseInt($parent.outerWidth()), _h = parseInt($parent.outerHeight());
		$parent.addClass("faq_open");
		
		var _style = {};
		_style.position = "absolute";
		_style.zIndex = 99;
		if ( ($parent.index()+1) % 3 == 0){
			_style.right = 38;
		}
		else
			_style.left = $parent.offset().left - ($parent.parent().offset().left) + parseInt($parent.css('padding-left'));
		
		if ( ($parent.parent().offset().top + $parent.height() + 300) > $("footer").offset().top)
			_style.bottom = 27;
		else
			_style.top = $parent.offset().top - $parent.parent().offset().top;
		
		$parent.css(_style);
		
		$parent.before("<div class='faq_placeholder'></div>")
		$parent.parent().find(".faq_placeholder").css({
			width:parseFloat($parent.data("size").width),
			height:parseFloat($parent.data("size").height),
			"float":"left",
			marginBottom:parseFloat($parent.css("marginBottom"))
		});
		$parent.find("a.toggle_faq").css({display:"none"});
		var _width = $parent.outerWidth(true)*2;
		$parent.find(".answer").css({opacity:0, display:"block"});
		
		TweenMax.to($parent.find(".question"),.1,{css:{opacity:0}, ease:Sine.easeIn});
		//
		$(".faq_overlay").css({width:$(".faq_overlay").parent().innerWidth(), height:$(".faq_overlay").parent().innerHeight(), opacity:0, display:"block", zIndex:9})
		TweenMax.to($(".faq_overlay"),.4,{css:{opacity:.7}, ease:Sine.easeOut});
		//parent
		TweenMax.to($parent, .3,{css:{width:_width},ease:Sine.easeOut, onComplete:function(){
			var _height = $parent.find(".faq_inner_block").innerHeight();	
			TweenMax.to($parent, .3,{css:{height:_height, maxHeight:_height}, ease:Sine.easeOut, onComplete:function(){
				$c = $parent.find(".close");
				$c.css({display:"block", opacity:0});
				TweenMax.to([$c,$parent.find(".question"),$parent.find(".answer")], .3,{css:{opacity:1}, ease:Sine.easeOut});
			}});
		}})

	};
	var close = function($parent){
		$(".faq_overlay").animate({opacity:0}, 300, function(){
			$(this).css({display:"none"})
		});
		$parent.find(".question, .answer, .close").animate({opacity:0}, 300, function(){
			$parent.removeClass("faq_open");
			$parent.find("a.toggle_faq").css({display:"block"})
			$parent.animate({width:parseInt($parent.data("size").width), height:parseInt($parent.data("size").height)}, 200, function(){
				$(".faq_placeholder").remove();
				$parent.find(".answer, .close").css({display:"none"});
				$parent.attr("style", "");
				$parent.find(".question").animate({opacity:1},300)
			})
		});
		
	};

	var set =

	$(".toggle_faq").on("click",function(){
		var $parent = $(this).parents(".faq_block")
		if ( $parent.hasClass("faq_open"))
			close.call(this,$parent);
		else
			open.call(this, $parent);
	});

});

GBRouter.executeRoute("combo-tips", function(){
	var $tipSlider = $('#tipSlider');
	var _selectedSliderItem, _selectedDescItem,_selectedNum;
	
	function getHashNum(){
		var hashstr = location.hash.substr (1, location.hash.length);
		if (hashstr.indexOf('tip') < 0) return 0;
		return parseInt(hashstr.split('tip').pop());
	}
	function getSelectedDescItem(){
		return $('.tip-content[rel='+_selectedNum+']');
	}
	function getSelectedSliderItem(){
		return $('#tipSlider li[rel='+_selectedNum+']');
	}
	function onHashChange(){
		_selectedNum = getHashNum();
		if ( isNaN(_selectedNum) || _selectedNum <0 ) _selectedNum = 0;
		_selectedSliderItem = getSelectedSliderItem();
		_selectedDescItem = getSelectedDescItem();

		$tipSlider.find('li').removeClass('selected');
		_selectedSliderItem.addClass('selected');

		TweenMax.to($('.tip-content'),.3,{css:{opacity:0}, ease:Sine.easeIn, onComplete:function(){
			$('.tip-content').css('display', 'none')
			_selectedDescItem.css('opacity', 0).show();
			TweenMax.to (_selectedDescItem, .3, {css:{opacity:1}, ease:Sine.easeOut});
		}});
	}
	_selectedNum = getHashNum();
	$(window).bind('hashchange', function(){
		onHashChange();
	})
	onHashChange();
	/* end hash change stuff */

	/* Init the elastislide responsive slider*/
	/* Figure out the tip num from the hash and start the slider at that number */ 
	$tipSlider.elastislide({minItems: 3, speed: 500, orientation:'horizontal', start:_selectedNum, easing:'ease-in'});
	
});

GBRouter.executeRoute("blog", function(){
	height = 0
	var heightCheck = setInterval(function(){
		var newHeight = $("#blog-comments").height()
		if ( newHeight != height ){
			YMM.onResize()
			height = newHeight
		}
	},500)
});

GBRouter.executeRoute("combo-testimonials", function(){
	var colCount = 0;
	var colWidth = 0;
	var margin = 20;
	var windowWidth = 0;
	var blocks = [];
	GBRouter.addEventListener(GBRouter.Events.READY, function(){
		$(".list-block").css({position:"absolute"});
		$(window).resize(setupBlocks);
		setupBlocks();
	});
	
	function setupBlocks() {
		windowWidth = $("#page-content").width() + 100;
		colWidth = $('.list-block').width();
		blocks = [];
		
		colCount = Math.floor(windowWidth/(colWidth+margin*2));
		for(var i=0;i<colCount;i++)
			blocks.push(0);

		positionBlocks();
	}
	
	function positionBlocks() {
		var _height = 0;
		$('.list-block').each(function(){
			var min = Array.min(blocks);
			var index = $.inArray(min, blocks);
			var leftPos = margin+(index*(colWidth+margin));
			
			var _myHeight = $(this).find(".testimonial-list-item").innerHeight();
			
			$(this).css({
				'left':leftPos+'px',
				'top':min+'px',
				'height': _myHeight
			});
			if ( min + _myHeight > _height) _height = min + _myHeight;
			
			blocks[index] = min+_myHeight+margin;
		});	
		$(".testimonial-list").css({height:_height});
	}
	
	// Function to get the Min value in Array
	Array.min = function(array) {
		return Math.min.apply(Math, array);
	};
	
});
GBRouter.addEventListener(GBRouter.Events.READY, YMM.init);
/*
if (typeof console == "undefined" || typeof console != "object" || typeof console.log != "function"){
	console = {};
	console.log = function(){};
};*/

(function(window, $){

	var options = {path:"/", expires:1};
	var SESSION_NAME = "__gbsession";

	var parseGET = window.parseGET = function(){};

	parseGET.set = 	function(){
		if ( window.location.search == "" ) return;
		var params = parseQueryString(window.location.search);
		$.cookie(SESSION_NAME, assebleQueryString($.extend({}, parseQueryString($.cookie(SESSION_NAME)), params)))
	}

	parseGET.get = function(){
		return $.cookie(SESSION_NAME) == null ? "" : "&" + $.cookie(SESSION_NAME);
	};

	function parseQueryString(str){
		if (typeof str == "undefined" || str==null) return {};
		var obj = {};
		str = str.replace("\?", "").split("&");
		for( var i in str ){
			var keyVal = str[i].split("=");
			obj[keyVal[0]] = keyVal[1]
		}
		return obj;
	}

	function assebleQueryString(arr){
		var ret = [];
		for ( var i in arr ){
			ret.push(i+"="+arr[i])
		}
		return ret.join("&")
	}

})(window, jQuery)
