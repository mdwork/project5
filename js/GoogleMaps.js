/*
 * info parameters should be formatted like this:
 * 	{
 * 		latitude:1234,
 * 		longitude:1234,
 * 		zoom:10
 * 	}
 */
var dash = window.dash || {}
dash.GoogleMaps = dash.GoogleMaps || (function(window,$){
	
	var Public = {},
		Utils = {};
	
	Utils = {
		maps:{},
		markers:{},
		createMap:function(id, info){
			info = Utils.extendInfo(info);
			info.scrollwheel = false;
			if ( typeof Utils.maps[id] != "undefined" ) return Utils.maps[id];
			return info.mapType == "interactive" ? Utils._createInteractiveMap(id, info) : Utils._createStaticMap(id,info)
		},
		placeMarkers:function(markers, map){
			var _map = typeof map == "string" ? Utils.maps[map] : map;
			if ( _map.mapInfo.mapType == "interactive" )
				Utils._placeInteractiveMarkers(markers, _map)
			else
				Utils._placeStaticMarkers(markers, _map)
			
		},
		//call with the scope of a map object
		placeMarker:function(info){
			var latLng = new google.maps.LatLng(info.latitude, info.longitude);
			var marker = new google.maps.Marker({
				position:latLng,
				title:info.name,
				icon:info.icon
			});
			marker.setMap(this);
			Utils.markers[this.id].push(marker);
			google.maps.event.addListener(marker, 'click', function(){
				$("body").trigger("GOOGLE_MAP_MARKER_CLICKED", [marker]);
			});
		},
		//call with the scope of a map object
		clearMarkers:function(){
			if ( typeof Utils.markers[this.id] == "undefined" || Utils.markers[this.id] == null )return false;
			for(var i = 0, len = Utils.markers[this.id].length; i < len; i++)
				Utils.markers[this.id][i].setMap(null)
			Utils.markers[this.id] = []
		},
		centerPoints : function(map, minZoom){
			var _map = typeof map == "string" ? Utils.maps[map] : map;
			if ( _map.mapInfo.mapType == "interactive" )
				Utils._centerInteractivePoints(_map, minZoom)
			else
				Utils._centerStaticPoints(_map, minZoom)
		},
		extendInfo:function(info){
			return $.extend({}, Public.defaults, info);
		},
		deg2rad:function(deg) {
			return deg * (Math.PI/180)
		},

		_createInteractiveMap : function(id, info){
			var mapOptions = {
				center : new google.maps.LatLng(info.latitude, info.longitude),
				zoom : info.zoom,
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				id:id,
				mapInfo:info,
				scrollwheel:false

			};
			Utils.markers[id] = [];
			return Utils.maps[id] = new google.maps.Map(document.getElementById(id), mapOptions);
		},
		_createStaticMap : function(id,info){
			return Utils.maps[id] = {id:id,mapInfo:info}
		},
		_placeInteractiveMarkers: function(markers,map){
			for ( var i in markers){
				Utils.placeMarker.call(map, markers[i]);
			};
		},
		_placeStaticMarkers: function(markers,map){
			var strs = [];
			for( var i in markers){
				strs.push(markers[i].latitude + "," + markers[i].longitude)
			}

			$("#"+map.id).attr("src", "http://maps.googleapis.com/maps/api/staticmap?size=1000x400&markers=color:red%7C"+(strs.join("%7C"))+"&sensor=false");
			
		},
		_centerInteractivePoints : function(map, minZoom){
			var bounds = new google.maps.LatLngBounds();
			for(var i=0, len = Utils.markers[map.id].length; i<len; i++){
				var elem = Utils.markers[map.id][i];
				if ( isNaN(elem.getPosition().lat()) || isNaN(elem.getPosition().lng())) continue; 
				bounds.extend(elem.getPosition());
			}
			if ( !bounds.isEmpty() ){
				map.fitBounds(bounds);
				google.maps.event.addListenerOnce(map, "idle", function(){
					if (isNaN(map.getZoom())) return map;
					if ( map.getZoom() > minZoom )
						map.setZoom(parseInt(minZoom))
				});
			}
			
		},
		_centerStaticPoints : function(map){
			//shouldn't need to do anythign here.
			//This is just for consistency
		}
	};
	
	
	Public = {
		staticMapURL:"http://maps.googleapis.com/maps/api/staticmap?parameters",
		defaults:{ 
			latitude:0,
			longitude:0,
			zoom:10,
			width:"100%",
			height:"100%",
			mapType:"interactive"
		},
		currentMap:null,
		createMap:function(id, info){
			Public.currentMap = Utils.createMap(id, info);
			return this;
		},
		getMap:function(id, info){
			return Public.createMap(id, info);
		},
		//@param map - can be either the id of the map as a string or a reference to the map object
		//	The default will be Public.currentMap which is automatically set when the map is created.
		placeMarkers:function(markers, map){
			map = typeof map == "undefined" ? Public.currentMap : map;
			Utils.placeMarkers(markers, map);
			return this;
		},
		centerPoints:function(minZoom, map){
			minZoom = minZoom || 21; //21 is the all the way zoomed in level
			map = map || Public.currentMap;
			Utils.centerPoints(map, minZoom);
			
		},
		zoomTo:function(latlng, zoom, map){
			map = map || Public.currentMap;
			zoom = typeof zoom == "undefined" ? 14 : zoom;
			map.setOptions({
				center:latlng,
				zoom:zoom
			})
		},
		clearMarkers:function(map){
			map = typeof map == "undefined" ? Public.currentMap : map;
			Utils.clearMarkers.call(map);
			return this
		},
		getDistance:function(lat1,lat2,lon1,lon2){
			var R = 6371; // Radius of the earth in km
			var dLat = Utils.deg2rad(lat2-lat1);  // deg2rad below
			var dLon = Utils.deg2rad(lon2-lon1);
			var a =
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(Utils.deg2rad(lat1)) * Math.cos(Utils.deg2rad(lat2)) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = R * c; // Distance in km
			return d;
		},
		doResize:function(map){
			map = typeof map == "undefined" ? Public.currentMap : map;
			google.maps.event.trigger(map, "resize");
			return this;
		}
		
	};
	
	return Public;
})(window, jQuery);
