'use strict';

angular.module('keepballin') 
	.factory('Panorama', function() {
		return {
			addEvent: function(panorama, streetViewControl, closeBtn) {
				var panoControl = {
			    	disableDefaultUI: true,
			    	zoomControl: true,
			    	zoomControlOptions: {
			    		position: google.maps.ControlPosition.LEFT_CENTER
			    	},
			    	enableCloseButton: false
			    };
				google.maps.event.addListener(panorama, 'visible_changed', function() {
		   
				    if (panorama.getVisible()) {
				        panorama.setOptions(panoControl);
				        //Prevent the button to be made if it exist
				        if (closeBtn === undefined) {
				        	closeBtn = document.createElement('button');
					        var glyph = document.createElement('span');
					   
					        closeBtn.className = 'closeBtn';
					        closeBtn.title = '回地圖';
					        glyph.className = 'glyphicon glyphicon-remove';
					        closeBtn.appendChild(glyph);
					        streetViewControl.push(closeBtn);
					        //Add eventlistener to the button
					        google.maps.event.addDomListener(closeBtn, 'click', function() {
							    //Disable panorama
							    panorama.setVisible(false);
							    closeBtn = undefined;
							});
				       	} else {
				       		return;
				       	}
				        
				    } else {
				    	//Remove button from control
				    	streetViewControl.pop();
				    }
				});
			}
		};
	});