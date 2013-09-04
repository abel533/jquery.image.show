var Kibo = function(element) {
  this.element = element || window.document;
  this.initialize();
};

Kibo.KEY_NAMES_BY_CODE = {
  8: 'backspace', 9: 'tab', 13: 'enter',
  16: 'shift', 17: 'ctrl', 18: 'alt',
  20: 'caps_lock',
  27: 'esc',
  32: 'space',
  33: 'page_up', 34: 'page_down',
  35: 'end', 36: 'home',
  37: 'left', 38: 'up', 39: 'right', 40: 'down',
  45: 'insert', 46: 'delete',
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
  65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z',
  96: 'n0', 97: 'n1', 98: 'n2', 99: 'n3', 100: 'n4', 101: 'n5',102: 'n6', 103: 'n7',104: 'n8',105: 'n9',
  112: 'f1', 113: 'f2', 114: 'f3', 115: 'f4', 116: 'f5', 117: 'f6', 118: 'f7', 119: 'f8', 120: 'f9', 121: 'f10', 122: 'f11', 123: 'f12',
  144: 'num_lock'
};

Kibo.KEY_CODES_BY_NAME = {};
(function() {
for (var key in Kibo.KEY_NAMES_BY_CODE)
  if (Object.prototype.hasOwnProperty.call(Kibo.KEY_NAMES_BY_CODE, key))
    Kibo.KEY_CODES_BY_NAME[Kibo.KEY_NAMES_BY_CODE[key]] = +key;
})();

Kibo.MODIFIERS = ['shift', 'ctrl', 'alt'];

Kibo.WILDCARD_TYPES = ['arrow', 'number', 'letter', 'f'];

Kibo.WILDCARDS = {
  arrow: [37, 38, 39, 40],
  number: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
  letter: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,96,97,98,99,100,101,102,103,104,105],
  f: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
};

Kibo.assert = function(expression, exception) {
  exception = exception || {};
  exception.name = exception.name || 'Exception raised';
  exception.message = exception.message || 'an error has occurred.';

  try {
    if(!expression)
      throw(exception);
  } catch(error) {
    if((typeof console !== 'undefined') && console.log)
      console.log(error.name + ': ' + error.message);
    else
      window.alert(error.name + ': ' + error.message);
  }
};

Kibo.registerEvent = (function() {
  if(document.addEventListener) {
    return function(element, eventName, func) {
      element.addEventListener(eventName, func, false);
    };
  }
  else if(document.attachEvent) {
    return function(element, eventName, func) {
      element.attachEvent('on' + eventName, func);
    };
  }
})();

Kibo.unregisterEvent = (function() {
  if(document.removeEventListener) {
    return function(element, eventName, func) {
      element.removeEventListener(eventName, func, false);
    };
  }
  else if(document.detachEvent) {
    return function(element, eventName, func) {
      element.detachEvent('on' + eventName, func);
    };
  }
})();

Kibo.isArray = function(what) {
  return !!(what && what.splice);
};

Kibo.isString = function(what) {
  return typeof what === 'string';
};

Kibo.arrayIncludes = (function() {
  if(Array.prototype.indexOf) {
    return function(haystack, needle) {
      return haystack.indexOf(needle) !== -1;
    };
  }
  else {
    return function(haystack, needle) {
      for(var i = 0; i < haystack.length; i++)
        if(haystack[i] === needle)
          return true;
      return false;
    };
  }
})();

Kibo.trimString = function(string) {
  return string.replace(/^\s+|\s+$/g, '');
};

Kibo.neatString = function(string) {
  return Kibo.trimString(string).replace(/\s+/g, ' ');
};

Kibo.capitalize = function(string) {
  return string.toLowerCase().replace(/^./, function(match) { return match.toUpperCase(); });
};

Kibo.isModifier = function(key) {
  return Kibo.arrayIncludes(Kibo.MODIFIERS, key);
};

Kibo.prototype.initialize = function() {
  var i, that = this;

  this.lastKeyCode = -1;
  this.lastModifiers = {};
  for(i = 0; i < Kibo.MODIFIERS.length; i++)
    this.lastModifiers[Kibo.MODIFIERS[i]] = false;

  this.keysDown = { any: [] };
  this.keysUp = { any: [] };
  for(i = 0; i < Kibo.WILDCARD_TYPES.length; i++) {
    this.keysDown['any ' + Kibo.WILDCARD_TYPES[i]] = [];
    this.keysUp['any ' + Kibo.WILDCARD_TYPES[i]] = [];
  }

  this.downHandler = this.handler('down');
  this.upHandler = this.handler('up');

  Kibo.registerEvent(this.element, 'keydown', this.downHandler);
  Kibo.registerEvent(this.element, 'keyup', this.upHandler);
  Kibo.registerEvent(window, 'unload', function unloader() {
    Kibo.unregisterEvent(that.element, 'keydown', that.downHandler);
    Kibo.unregisterEvent(that.element, 'keyup', that.upHandler);
    Kibo.unregisterEvent(window, 'unload', unloader);
  });
};

Kibo.prototype.matchingKeys = function(registeredKeys) {
  var i, j, keyCombination, match, result = [];
  for(var registeredKey in registeredKeys) {
    if(Object.prototype.hasOwnProperty.call(registeredKeys, registeredKey)) {
      keyCombination = Kibo.trimString(registeredKey).split(' ');
      if(keyCombination.length && keyCombination[0] !== 'any') {
        match = true;
        for(j = 0; j < keyCombination.length; j++)
          match = match && (Kibo.isModifier(keyCombination[j]) ? this.lastKey(keyCombination[j]) : (this.lastKey() === keyCombination[j]));
        if(match)
          result.push(registeredKey);
      }
    }
  }
  return result;
};

Kibo.prototype.handler = function(upOrDown) {
  var that = this;
  return function(e) {
    var i, j, matchingKeys, registeredKeys;

    e = e || window.event;

    that.lastKeyCode = e.keyCode;
    for(i = 0; i < Kibo.MODIFIERS.length; i++)
      that.lastModifiers[Kibo.MODIFIERS[i]] = e[Kibo.MODIFIERS[i] + 'Key'];
    if(Kibo.arrayIncludes(Kibo.MODIFIERS, Kibo.keyName(that.lastKeyCode)))
      that.lastModifiers[Kibo.keyName(that.lastKeyCode)] = true;

    registeredKeys = that['keys' + Kibo.capitalize(upOrDown)];
    matchingKeys = that.matchingKeys(registeredKeys);

    for(i = 0; i < registeredKeys.any.length; i++)
      if((registeredKeys.any[i](e) === false) && e.preventDefault)
        e.preventDefault();

    for(i = 0; i < Kibo.WILDCARD_TYPES.length; i++)
      if(Kibo.arrayIncludes(Kibo.WILDCARDS[Kibo.WILDCARD_TYPES[i]], that.lastKeyCode))
        for(j = 0; j < registeredKeys['any ' + Kibo.WILDCARD_TYPES[i]].length; j++)
          if((registeredKeys['any ' + Kibo.WILDCARD_TYPES[i]][j](e) === false) && e.preventDefault)
            e.preventDefault();

    for(i = 0; i < matchingKeys.length; i++)
      for(j = 0; j < registeredKeys[matchingKeys[i]].length; j++)
        if((registeredKeys[matchingKeys[i]][j](e) === false) && e.preventDefault)
          e.preventDefault();
  };
};

Kibo.prototype.registerKeys = function(upOrDown, newKeys, func) {
  var i, registeredKeys = this['keys' + Kibo.capitalize(upOrDown)];

  if(!Kibo.isArray(newKeys))
    newKeys = [newKeys];

  for(i = 0; i < newKeys.length; i++) {
    Kibo.assert(
      Kibo.isString(newKeys[i]),
      { name: 'Type error', message: 'expected string or array of strings.' }
    );

    newKeys[i] = Kibo.neatString(newKeys[i]);

    if(Kibo.isArray(registeredKeys[newKeys[i]]))
      registeredKeys[newKeys[i]].push(func);
    else
      registeredKeys[newKeys[i]] = [func];
    }

    return this;
};

Kibo.prototype.unregisterKeys = function(upOrDown, newKeys, func) {
  var i, j, registeredKeys = this['keys' + Kibo.capitalize(upOrDown)];

  if(!Kibo.isArray(newKeys))
    newKeys = [newKeys];

  for(i = 0; i < newKeys.length; i++) {
    Kibo.assert(
      Kibo.isString(newKeys[i]),
      { name: 'Type error', message: 'expected string or array of strings.' }
    );

    newKeys[i] = Kibo.neatString(newKeys[i]);

    if(func === null)
      delete registeredKeys[newKeys[i]];
    else {
      if(Kibo.isArray(registeredKeys[newKeys[i]])) {
        for(j = 0; j < registeredKeys[newKeys[i]].length; j++) {
          if(String(registeredKeys[newKeys[i]][j]) === String(func)) {
            registeredKeys[newKeys[i]].splice(j, 1);
            break;
          }
        }
      }
    }
  }

  return this;
};

Kibo.prototype.delegate = function(action, keys, func) {
  return func !== null ? this.registerKeys(action, keys, func) : this.unregisterKeys(action, keys, func);
};
Kibo.prototype.down = function(keys, func) {
  return this.delegate('down', keys, func);
};

Kibo.prototype.up = function(keys, func) {
  return this.delegate('up', keys, func);
};

Kibo.keyName = function(keyCode) {
  return Kibo.KEY_NAMES_BY_CODE[keyCode + ''];
};

Kibo.keyCode = function(keyName) {
  return +Kibo.KEY_CODES_BY_NAME[keyName];
};

Kibo.prototype.lastKey = function(modifier) {
  if(!modifier)
    return Kibo.keyName(this.lastKeyCode);

  Kibo.assert(
    Kibo.arrayIncludes(Kibo.MODIFIERS, modifier),
    { name: 'Modifier error', message: 'invalid modifier ' + modifier + ' (valid modifiers are: ' + Kibo.MODIFIERS.join(', ') + ').' }
  );

  return this.lastModifiers[modifier];
};

(function($){
	/**
	* EasyDrag 1.4 - Drag & Drop jQuery Plug-in
	*
	* Thanks for the community that is helping the improvement
	* of this little piece of code.
	*
	* For usage instructions please visit http://fromvega.com
	*/
	// to track if the mouse button is pressed
	var isMouseDown    = false;

	// to track the current element being dragged
	var currentElement = null;

	// callback holders
	var dropCallbacks = {};
	var dragCallbacks = {};

	// global position records
	var lastMouseX;
	var lastMouseY;
	var lastElemTop;
	var lastElemLeft;
	
	// track element dragStatus
	var dragStatus = {};	

	// returns the mouse (cursor) current position
	$.getMousePosition = function(e){
		var posx = 0;
		var posy = 0;

		if (!e) var e = window.event;

		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
		}

		return { 'x': posx, 'y': posy };
	};

	// updates the position of the current element being dragged
	$.updatePosition = function(e) {
		var pos = $.getMousePosition(e);

		var spanX = (pos.x - lastMouseX);
		var spanY = (pos.y - lastMouseY);

		$(currentElement).css("top",  (lastElemTop + spanY));
		$(currentElement).css("left", (lastElemLeft + spanX));
	};

	// when the mouse is moved while the mouse button is pressed
	$(document).mousemove(function(e){
		if(isMouseDown && dragStatus[currentElement.id] == 'on'){
			// update the position and call the registered function
			$.updatePosition(e);
			if(dragCallbacks[currentElement.id] != undefined){
				dragCallbacks[currentElement.id](e, currentElement);
			}

			return false;
		}
	});

	// when the mouse button is released
	$(document).mouseup(function(e){
		if(isMouseDown && dragStatus[currentElement.id] == 'on'){
			isMouseDown = false;
			if(dropCallbacks[currentElement.id] != undefined){
				dropCallbacks[currentElement.id](e, currentElement);
			}

			return false;
		}
	});

	// register the function to be called while an element is being dragged
	$.fn.ondrag = function(callback){
		return this.each(function(){
			dragCallbacks[this.id] = callback;
		});
	};

	// register the function to be called when an element is dropped
	$.fn.ondrop = function(callback){
		return this.each(function(){
			dropCallbacks[this.id] = callback;
		});
	};
	
	// stop the element dragging feature
	$.fn.dragOff = function(){
		return this.each(function(){
			dragStatus[this.id] = 'off';
		});
	};
	
	
	$.fn.dragOn = function(){
		return this.each(function(){
			dragStatus[this.id] = 'on';
		});
	};

	// set an element as draggable - allowBubbling enables/disables event bubbling
	$.fn.easydrag = function(allowBubbling){

		return this.each(function(){

			// if no id is defined assign a unique one
			if(undefined == this.id || !this.id.length) this.id = "easydrag"+(new Date().getTime());

			// set dragStatus 
			dragStatus[this.id] = "on";
			
			// change the mouse pointer
			$(this).css("cursor", "move");

			// when an element receives a mouse press
			$(this).mousedown(function(e){

				// set it as absolute positioned
				$(this).css("position", "absolute");

				// set z-index
				$(this).css("z-index", "100");

				// update track variables
				isMouseDown    = true;
				currentElement = this;

				// retrieve positioning properties
				var pos    = $.getMousePosition(e);
				lastMouseX = pos.x;
				lastMouseY = pos.y;

				lastElemTop  = this.offsetTop;
				lastElemLeft = this.offsetLeft;

				$.updatePosition(e);

				return allowBubbling ? true : false;
			});
		});
	};
	
	
	
	
	
	
	/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
	 * Licensed under the MIT License (LICENSE.txt).
	 *
	 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
	 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
	 * Thanks to: Seamus Leahy for adding deltaX and deltaY
	 *
	 * Version: 3.1.3
	 *
	 * Requires: 1.2.2+
	 */
	var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
        if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( orgEvent.deltaX ) {
            deltaX = orgEvent.deltaX;
            delta  = deltaX * -1;
        }

        // Webkit
        if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
        if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta  = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        deltaY = Math[fn](deltaY / lowestDeltaXY);

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
	
	
	
	
    
    
    
    
    
    
 // VERSION: 2.3 LAST UPDATE: 11.07.2013
    /* 
     * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
     * 
     * Made by Wilq32, wilq32@gmail.com, Wroclaw, Poland, 01.2009
     * Website: http://code.google.com/p/jqueryrotate/ 
     */
    var supportedCSS, supportedCSSOrigin, styles = document
	.getElementsByTagName("head")[0].style, toCheck = "transformProperty WebkitTransform OTransform msTransform MozTransform"
	.split(" ");
	for ( var a = 0; a < toCheck.length; a++)
	if (styles[toCheck[a]] !== undefined) {
		supportedCSS = toCheck[a];
	}
	if (supportedCSS) {
	supportedCSSOrigin = supportedCSS.replace(/[tT]ransform/,
			"TransformOrigin");
	if (supportedCSSOrigin[0] == "T")
		supportedCSSOrigin[0] = "t";
	}
	
	// Bad eval to preven google closure to remove it from code o_O
	eval('IE = "v"=="\v"');
	
	jQuery.fn.extend({
	rotate : function(parameters) {
		if (this.length === 0 || typeof parameters == "undefined")
			return;
		if (typeof parameters == "number")
			parameters = {
				angle : parameters
			};
		var returned = [];
		for ( var i = 0, i0 = this.length; i < i0; i++) {
			var element = this.get(i);
			if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {
	
				var paramClone = $.extend(true, {}, parameters);
				var newRotObject = new Wilq32.PhotoEffect(element,
						paramClone)._rootObj;
	
				returned.push($(newRotObject));
			} else {
				element.Wilq32.PhotoEffect._handleRotation(parameters);
			}
		}
		return returned;
	},
	getRotateAngle : function() {
		var ret = [];
		for ( var i = 0, i0 = this.length; i < i0; i++) {
			var element = this.get(i);
			if (element.Wilq32 && element.Wilq32.PhotoEffect) {
				ret[i] = element.Wilq32.PhotoEffect._angle;
			}
		}
		return ret;
	},
	stopRotate : function() {
		for ( var i = 0, i0 = this.length; i < i0; i++) {
			var element = this.get(i);
			if (element.Wilq32 && element.Wilq32.PhotoEffect) {
				clearTimeout(element.Wilq32.PhotoEffect._timer);
			}
		}
	}
	});
	
	// Library agnostic interface
	
	Wilq32 = window.Wilq32 || {};
	Wilq32.PhotoEffect = (function() {
	
	if (supportedCSS) {
		return function(img, parameters) {
			img.Wilq32 = {
				PhotoEffect : this
			};
	
			this._img = this._rootObj = this._eventObj = img;
			this._handleRotation(parameters);
		}
	} else {
		return function(img, parameters) {
			this._img = img;
			this._onLoadDelegate = [ parameters ];
	
			this._rootObj = document.createElement('span');
			this._rootObj.style.display = "inline-block";
			this._rootObj.Wilq32 = {
				PhotoEffect : this
			};
			img.parentNode.insertBefore(this._rootObj, img);
	
			if (img.complete) {
				this._Loader();
			} else {
				var self = this;
				jQuery(this._img).bind("load", function() {
					self._Loader();
				});
			}
		}
	}
	})();
	
	Wilq32.PhotoEffect.prototype = {
	_setupParameters : function(parameters) {
		this._parameters = this._parameters || {};
		if (typeof this._angle !== "number") {
			this._angle = 0;
		}
		if (typeof parameters.angle === "number") {
			this._angle = parameters.angle;
		}
		this._parameters.animateTo = (typeof parameters.animateTo === "number") ? (parameters.animateTo)
				: (this._angle);
	
		this._parameters.step = parameters.step || this._parameters.step
				|| null;
		this._parameters.easing = parameters.easing
				|| this._parameters.easing || this._defaultEasing;
		this._parameters.duration = parameters.duration
				|| this._parameters.duration || 1000;
		this._parameters.callback = parameters.callback
				|| this._parameters.callback || this._emptyFunction;
		this._parameters.center = parameters.center
				|| this._parameters.center || [ "50%", "50%" ];
		if (typeof this._parameters.center[0] == "string") {
			this._rotationCenterX = (parseInt(this._parameters.center[0],
					10) / 100)
					* this._imgWidth * this._aspectW;
		} else {
			this._rotationCenterX = this._parameters.center[0];
		}
		if (typeof this._parameters.center[1] == "string") {
			this._rotationCenterY = (parseInt(this._parameters.center[1],
					10) / 100)
					* this._imgHeight * this._aspectH;
		} else {
			this._rotationCenterY = this._parameters.center[1];
		}
	
		if (parameters.bind && parameters.bind != this._parameters.bind) {
			this._BindEvents(parameters.bind);
		}
	},
	_emptyFunction : function() {
	},
	_defaultEasing : function(x, t, b, c, d) {
		return -c * ((t = t / d - 1) * t * t * t - 1) + b
	},
	_handleRotation : function(parameters, dontcheck) {
		if (!supportedCSS && !this._img.complete && !dontcheck) {
			this._onLoadDelegate.push(parameters);
			return;
		}
		this._setupParameters(parameters);
		if (this._angle == this._parameters.animateTo) {
			this._rotate(this._angle);
		} else {
			this._animateStart();
		}
	},
	
	_BindEvents : function(events) {
		if (events && this._eventObj) {
			// Unbinding previous Events
			if (this._parameters.bind) {
				var oldEvents = this._parameters.bind;
				for ( var a in oldEvents)
					if (oldEvents.hasOwnProperty(a))
						jQuery(this._eventObj).unbind(a, oldEvents[a]);
			}
	
			this._parameters.bind = events;
			for ( var a in events)
				if (events.hasOwnProperty(a))
					jQuery(this._eventObj).bind(a, events[a]);
		}
	},
	
	_Loader : (function() {
		if (IE)
			return function() {
				var width = this._img.width;
				var height = this._img.height;
				this._imgWidth = width;
				this._imgHeight = height;
				this._img.parentNode.removeChild(this._img);
	
				this._vimage = this.createVMLNode('image');
				this._vimage.src = this._img.src;
				this._vimage.style.height = height + "px";
				this._vimage.style.width = width + "px";
				this._vimage.style.position = "absolute"; // FIXES IE PROBLEM - its only rendered if its on absolute position!
				this._vimage.style.top = "0px";
				this._vimage.style.left = "0px";
				this._aspectW = this._aspectH = 1;
	
				/* Group minifying a small 1px precision problem when rotating object */
				this._container = this.createVMLNode('group');
				this._container.style.width = width;
				this._container.style.height = height;
				this._container.style.position = "absolute";
				this._container.style.top = "0px";
				this._container.style.left = "0px";
				this._container.setAttribute('coordsize', width - 1 + ','
						+ (height - 1)); // This -1, -1 trying to fix ugly problem with small displacement on IE
				this._container.appendChild(this._vimage);
	
				this._rootObj.appendChild(this._container);
				this._rootObj.style.position = "relative"; // FIXES IE PROBLEM
				this._rootObj.style.width = width + "px";
				this._rootObj.style.height = height + "px";
				this._rootObj.setAttribute('id', this._img
						.getAttribute('id'));
				this._rootObj.className = this._img.className;
				this._eventObj = this._rootObj;
				var parameters;
				while (parameters = this._onLoadDelegate.shift()) {
					this._handleRotation(parameters, true);
				}
			}
		else
			return function() {
				this._rootObj.setAttribute('id', this._img
						.getAttribute('id'));
				this._rootObj.className = this._img.className;
	
				this._imgWidth = this._img.naturalWidth;
				this._imgHeight = this._img.naturalHeight;
				var _widthMax = Math.sqrt((this._imgHeight)
						* (this._imgHeight) + (this._imgWidth)
						* (this._imgWidth));
				this._width = _widthMax * 3;
				this._height = _widthMax * 3;
	
				this._aspectW = this._img.offsetWidth
						/ this._img.naturalWidth;
				this._aspectH = this._img.offsetHeight
						/ this._img.naturalHeight;
	
				this._img.parentNode.removeChild(this._img);
	
				this._canvas = document.createElement('canvas');
				this._canvas.setAttribute('width', this._width);
				this._canvas.style.position = "relative";
				this._canvas.style.left = -this._img.height * this._aspectW
						+ "px";
				this._canvas.style.top = -this._img.width * this._aspectH
						+ "px";
				this._canvas.Wilq32 = this._rootObj.Wilq32;
	
				this._rootObj.appendChild(this._canvas);
				this._rootObj.style.width = this._img.width * this._aspectW
						+ "px";
				this._rootObj.style.height = this._img.height
						* this._aspectH + "px";
				this._eventObj = this._canvas;
	
				this._cnv = this._canvas.getContext('2d');
				var parameters;
				while (parameters = this._onLoadDelegate.shift()) {
					this._handleRotation(parameters, true);
				}
			}
	})(),
	
	_animateStart : function() {
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this._animateStartTime = +new Date;
		this._animateStartAngle = this._angle;
		this._animate();
	},
	_animate : function() {
		var actualTime = +new Date;
		var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;
	
		if (checkEnd && !this._parameters.animatedGif) {
			clearTimeout(this._timer);
		} else {
			if (this._canvas || this._vimage || this._img) {
				var angle = this._parameters.easing(0, actualTime
						- this._animateStartTime, this._animateStartAngle,
						this._parameters.animateTo
								- this._animateStartAngle,
						this._parameters.duration);
				this._rotate((~~(angle * 10)) / 10);
			}
			if (this._parameters.step) {
				this._parameters.step(this._angle);
			}
			var self = this;
			this._timer = setTimeout(function() {
				self._animate.call(self);
			}, 10);
		}
	
		// To fix Bug that prevents using recursive function in callback I moved this function to back
		if (this._parameters.callback && checkEnd) {
			this._angle = this._parameters.animateTo;
			this._rotate(this._angle);
			this._parameters.callback.call(this._rootObj);
		}
	},
	
	_rotate : (function() {
		var rad = Math.PI / 180;
		if (IE)
			return function(angle) {
				this._angle = angle;
				this._container.style.rotation = (angle % 360) + "deg";
				this._vimage.style.top = -(this._rotationCenterY - this._imgHeight / 2)
						+ "px";
				this._vimage.style.left = -(this._rotationCenterX - this._imgWidth / 2)
						+ "px";
				this._container.style.top = this._rotationCenterY
						- this._imgHeight / 2 + "px";
				this._container.style.left = this._rotationCenterX
						- this._imgWidth / 2 + "px";
	
			}
		else if (supportedCSS)
			return function(angle) {
				this._angle = angle;
				this._img.style[supportedCSS] = "rotate(" + (angle % 360)
						+ "deg)";
				this._img.style[supportedCSSOrigin] = this._parameters.center
						.join(" ");
			}
		else
			return function(angle) {
				this._angle = angle;
				angle = (angle % 360) * rad;
				// clear canvas	
				this._canvas.width = this._width;//+this._widthAdd;
				this._canvas.height = this._height;//+this._heightAdd;
	
				// REMEMBER: all drawings are read from backwards.. so first function is translate, then rotate, then translate, translate..
				this._cnv.translate(this._imgWidth * this._aspectW,
						this._imgHeight * this._aspectH); // at least center image on screen
				this._cnv.translate(this._rotationCenterX,
						this._rotationCenterY); // we move image back to its orginal 
				this._cnv.rotate(angle); // rotate image
				this._cnv.translate(-this._rotationCenterX,
						-this._rotationCenterY); // move image to its center, so we can rotate around its center
				this._cnv.scale(this._aspectW, this._aspectH); // SCALE - if needed ;)
				this._cnv.drawImage(this._img, 0, 0); // First - we draw image
			}
	
	})()
	}
	
	if (IE) {
	Wilq32.PhotoEffect.prototype.createVMLNode = (function() {
		document.createStyleSheet().addRule(".rvml",
				"behavior:url(#default#VML)");
		try {
			!document.namespaces.rvml
					&& document.namespaces.add("rvml",
							"urn:schemas-microsoft-com:vml");
			return function(tagName) {
				return document.createElement('<rvml:' + tagName
						+ ' class="rvml">');
			};
		} catch (e) {
			return function(tagName) {
				return document
						.createElement('<'
								+ tagName
								+ ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
			};
		}
	})();
	}
	
	//显示缩略图
	function showSLT(target,img,opt){
		return function(){
			_showSLT(target,img,opt);
		}
	}
	//缩略图
	function _showSLT(target,img,opt){
		var bl = (img.height()/img.width()).toFixed(1)*10;
		$('<img>').attr('src',img.attr('src'))
				  .css({
				  		'position':'absolute',
				  		'width':opt.sltWidth,
				  		'height':'auto',
				  		'right':0,
				  		'bottom':0,
				  		'border':'1px solid black',
				  		'z-index':200
				  }).appendTo(target);
	}
	
	//显示控制器
	function imgControl(target,img,opt){
		return function(){
			_imgControl(target,img,opt);
		}
	}
	//控制器
	function _imgControl(target,img,opt){
		var bl = (img.height()/img.width()).toFixed(1)*10;
		var id = 'control'+new Date().getTime();
		var kibo = new Kibo();
		var html = '<input type="button" title="快捷键：ctrl + n5" value="复位" />';
			html+= '<input type="button" title="快捷键：ctrl + up" value="上" />';
			html+= '<input type="button" title="快捷键：ctrl + down" value="下" />';
			html+= '<input type="button" title="快捷键：ctrl + left" value="左" />';
			html+= '<input type="button" title="快捷键：ctrl + right" value="右" />';
			html+= '<input type="button" title="快捷键：ctrl + n0" value="旋转" />';
			html+= '<input type="button" title="快捷键：ctrl + n1" value="重置1" />';
			html+= '<input type="button" title="快捷键：ctrl + n2" value="重置2" />';
			html+= '<input type="button" title="快捷键：ctrl + n3" value="重置3" />';
			html+= '<input type="button" title="快捷键：ctrl + n4" value="重置4" />';
			html+= '<input type="button" title="快捷键：ctrl + n7" value="宽适应" />';
			html+= '<input type="button" title="快捷键：ctrl + n9" value="高适应" />';
		
		$('<div>').attr('src',img.attr('src'))
				  .attr('id',id)
				  .css({
				  		'position':'absolute',
				  		'width':'100%',
				  		'height':'auto',
				  		'top':0,
				  		'left':0,
				  		'display':opt.cdisplay,
				  		'background-color':'rgba(0,0,0,0.5)',
				  		'border':'1px solid black',
				  		'z-index':100
				  }).html(html).appendTo(target);
		
		$control = $('#'+id+' input[type=button]');
		$control.eq(0).click(function(){
			//复位
			img.rotate(0);
			img.css({top:opt.itop,left:opt.ileft,width:opt.iwidth,height:opt.iheight});
		});
		$control.eq(1).click(function(){
			//向上移动一段距离
			img.css('top','-='+opt.idy+'px');
		});
		$control.eq(2).click(function(){
			//向下移动一段距离
			img.css('top','+='+opt.idy+'px');
		});
		$control.eq(3).click(function(){
			//向左移动一段距离
			img.css('left','-='+opt.idx+'px');
		});
		$control.eq(4).click(function(){
			//向右移动一段距离
			img.css('left','+='+opt.idx+'px');
		});
		$control.eq(5).click(function(){
			//旋转
			var rota = img.getRotateAngle();
			var jd = 30;
			if(rota.length>0){
				jd += rota[0];
			}
			img.rotate(jd);
		});
		$control.eq(6).click(function(){
			//复位1
			img.rotate(0);
			img.css('top','-600px');
		});
		$control.eq(7).click(function(){
			//复位2
			img.rotate(0);
			img.css('top','-1200px');
		});
		$control.eq(8).click(function(){
			//复位3
			img.rotate(0);
			img.css('top','-1800px');
		});
		$control.eq(9).click(function(){
			//复位4
			img.rotate(0);
			img.css('top','-2400px');
		});
		$control.eq(10).click(function(){
			//宽适应
			img.rotate(0);
			img.css({left:'0px',width:'100%',height:'auto'});
		});
		$control.eq(11).click(function(){
			//高适应
			img.rotate(0);
			img.css({top:'0px',height:'100%',width:'auto'});
		});
		
		
		
		kibo.down('ctrl n5',function(){
			$control.eq(0).click();
		});
		kibo.down('ctrl up',function(){
			$control.eq(1).click();
		});
		kibo.down('ctrl down',function(){
			$control.eq(2).click();
		});
		kibo.down('ctrl left',function(){
			$control.eq(3).click();
		});
		kibo.down('ctrl right',function(){
			$control.eq(4).click();
		});
		kibo.down('ctrl n0',function(){
			$control.eq(5).click();
		});
		kibo.down('ctrl n1',function(){
			$control.eq(6).click();
		});
		kibo.down('ctrl n2',function(){
			$control.eq(7).click();
		});
		kibo.down('ctrl n3',function(){
			$control.eq(8).click();
		});
		kibo.down('ctrl n4',function(){
			$control.eq(9).click();
		});
		kibo.down('ctrl n7',function(){
			$control.eq(10).click();
		});
		kibo.down('ctrl n9',function(){
			$control.eq(11).click();
		});
	}
	
	
	
	$.fn.imgShow = function(src,options){
		var opt = $.extend({},$.imgShow.options,options);
		//对当前容器进行调整
		this.css({
			'border':'1px solid black',
			'position':'relative',
			'width':opt.cwidth,
			'height':opt.cheight,
			'margin':'0 auto',
			'text-align':'center',
			'overflow':'hidden'
		});
		var className = 'imgshow'+new Date().getTime();
		$('<img>').attr('src',src)
				  .addClass(className)
				  .css({
				  		'position':'absolute',
				  		'width':opt.iwidth,
				  		'height':opt.iheight,
				  		'top':opt.itop,
				  		'left':opt.ileft
				  }).appendTo(this);
		var $img = $('.'+className);
		//添加移动
		$img.easydrag(opt.allowBubbling);
		//添加放大功能
		imgMouseWheel($img,opt);
		//显示缩略图
		if(opt.slt){
			setTimeout(showSLT(this,$img,opt),10);
		}
		//显示控制按钮
		if(opt.control){
			setTimeout(imgControl(this,$img,opt),10);
		}
		return $img;
	}
	//鼠标滚轮放大
	function imgMouseWheel(target,opt){
		target.bind('mousewheel', function(event, delta, deltaX, deltaY) {
		    var ofx = event.offsetX;
		    var ofy = event.offsetY;
		    var x = target.width();
		    var y = target.height();
		    var dx = ofx*(opt.dz/x);
		    var dy = dx*ofy/ofx;
		    var bl = y/x;
		    x += delta*opt.dz;
		    y = x*bl;
		    target.width(x);
		    target.height(y);
		    
		    target.css('left','+='+(-delta*dx)+'px');
		    target.css('top','+='+(-delta*dy)+'px');
		});
	}
	$.imgShow = {};
	$.imgShow.options = {
		iwidth:'100%',		//图片宽度
		iheight:'auto',		//图片高度
		itop:'0px',			//图片顶部
		ileft:'0px',		//图片左部
		idy:100,			//纵向移动增量
		idx:100,			//横向移动增量
		
		dz:40,      		//放大增量
		rota:30,			//旋转增量（单位°）
		
		slt:true,   		//显示缩略图
		sltWidth:'10%',		//缩略图宽度
		allowBubbling:false,//事件冒泡
		control:true, 		//使用控制键
		cdisplay:'block',	//显示菜单
		cwidth:800,			//容器的宽度
		cheight:600 		//容器的高度
	};
})(jQuery);


