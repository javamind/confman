/*!
 * Angular Material Design
 * WIP Banner
 */
(function(){
angular.module('ngMaterial', [ 'ng', 'ngAnimate', 'material.services.attrBind', 'material.services.compiler', 'material.services.position', 'material.services.registry', 'material.services.throttle', "material.components.button","material.components.card","material.components.checkbox","material.components.content","material.components.dialog","material.components.form","material.components.icon","material.components.list","material.components.radioButton","material.components.sidenav","material.components.slider","material.components.tabs","material.components.toast","material.components.toolbar","material.components.whiteframe"]);
angular.module('ngAnimateSequence', ['ngAnimate'])

  .factory('$$animateAll', function() {
    return function all(arr, fn) {
      var count = 0;
      for(var i = 0; i < arr.length; i++) {
        arr[i](onChainDone);
      }

      function onChainDone() {
        if(++count == arr.length) fn();
      }
    };
  })

  .provider('$$animateStyler', ['$provide', function($provide) {
    var register = this.register = function(name, factory) {
      $provide.factory(name + 'Styler', factory);
    };

    this.$get = ['$injector', function($injector) {
      register('default', function() {
        return function(element, pre) {
          element.css(pre);
          return function(post, done) {
            element.css(post);
            done();
          }
        };
      });

      return function(name) {
        return $injector.get(name + 'Styler');
      }
    }];
  }])

  .factory('$animateRunner', ['$$animateReflow', '$animate', '$$animateStyler', '$$animateAll', '$timeout',
    function($$animateReflow,   $animate,   $$animateStyler,   $$animateAll,   $timeout) {
      return function(element, options, queue, duration, completeFn) {
        options = options || {};

        var node = element[0];
        var self;
        var index = 0;
        var paused = false;
        var cancelAnimation = angular.noop;

        var styler = angular.isFunction(options.styler)
          ? options.styler
          : angular.isString(options.styler)
          ? $$animateStyler(options.styler)
          : $$animateStyler('default');

        var style = function(element, duration, cssStyles) {
          cssStyles = cssStyles || {};
          var delay = cssStyles.delay;
          delete cssStyles.delay;
          return styler(element, cssStyles, duration, delay);
        };


        completeFn = completeFn || angular.noop;

        function tick(initialTimeout) {
          if (paused) return;

          var step = queue[index++];
          if(!step || !$animate.enabled()) {
            completeFn();
            queue = null;
            return;
          }

          if(angular.isString(step)) {
            self[step].apply(self);
            tick();
            return;
          }

          var time  = step[0];
          var pre   = step[1];
          var post  = step[2];
          var fn    = step[3];

          if(!initialTimeout && index == 1 && time > 0 && time <= 1 && duration > 0) {
            index--;
            $timeout(function() {
              tick(true);
            }, time * duration, false);
            return;
          }

          var animationDuration = time;
          if(duration > 0 && time <= 1) { //Keyframes
            var nextEntry = queue[index];
            var next = angular.isArray(nextEntry) ? nextEntry[0] : 1;
            if(next <= 1) {
              animationDuration = (next - time) * duration;
            }
          }

          var postStyle = style(element, animationDuration, pre);

          accumulatedStyles = angular.extend(accumulatedStyles, pre);
          accumulatedStyles = angular.extend(accumulatedStyles, post);

          $$animateReflow(function() {
            $$animateAll([
              function(done) { postStyle(post || {}, done); },
              function(done) {
                cancelAnimation = fn(element, animationDuration, done) || angular.noop;
              }
            ], tick);
          });

          return self;
        }

        var startingClassName = node.className;
        var accumulatedStyles = {};

        return self = {
          revertStyles : function() {
            angular.forEach(accumulatedStyles, function(_, prop) {
              node.style.removeProperty(prop);
            });
            accumulatedStyles = {};
            return this;
          },

          revertClasses : function() {
            node.className = startingClassName;
            return this;
          },

          next : function() {
            cancelAnimation();
            return tick();
          },

          redo : function() {
            cancelAnimation();
            index--;
            return tick();
          },

          run : function() {
            if (paused) {
              paused = false;
              cancelAnimation();
            }
            return tick();
          },

          pause : function() {
            paused = true;
            cancelAnimation();
            return self;
          },

          restart : function() {
            cancelAnimation();
            index = 0;

            return tick();
          }

        };
      }
    }])

  .factory('$animateSequence', ['$animate', '$animateRunner', '$sniffer',
    function($animate,   $animateRunner,   $sniffer) {
      return function(options) {
        var self, queue = [];

        return self = {
          run : function(element, duration, completeFn) {
            return $animateRunner(element, options, queue, duration, completeFn).next();
          },

          then : function(fn) {
            return addToChain(0, null, null, function(element, duration, done) {
              fn(element, done);
            });
          },

          animate : function(preOptions, postOptions, time ) {
            if (arguments.length == 2 && !angular.isObject(postOptions)) {
              time = postOptions;
              postOptions = preOptions;
              preOptions  = {};
            } else if(arguments.length == 1) {
              postOptions = preOptions;
              preOptions = {};
            } else {
              postOptions = postOptions || {};
            }

            return addToChain(time || postOptions.duration, preOptions, postOptions, function(_, duration, done) {
              done();
            });
          },

          revertStyles : function() {
            queue.push('revertStyles');
            return self;
          },

          revertClasses : function() {
            queue.push('revertClasses');
            return self;
          },

          revertElement : function() {
            return this.revertStyles().revertClasses();
          },

          enter : function(parent, after, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.enter(element, parent, after, done);
            });
          },

          move : function(parent, after, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.move(element, parent, after, done);
            });
          },

          leave : function(preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.leave(element, done);
            });
          },

          addClass : function(className, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.addClass(element, className, done);
            });
          },

          removeClass : function(className, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.removeClass(element, className, done);
            });
          },

          setClass : function(add, remove, preOptions, postOptions, time ) {
            return addToChain(time, preOptions, postOptions, function(element, duration, done) {
              return $animate.setClass(element, add, remove, done)
            });
          }

        };

        /**
         * Append chain step into queue
         * @returns {*} this
         */
        function addToChain(time, pre, post, fn) {
          queue.push([time || 0, addSuffix(pre), addSuffix(post), fn]);
          queue = queue.sort(function(a,b) {
            return a[0] > b[0];
          });
          return self;
        };

        /**
         * For any positional fields, ensure that a `px` suffix
         * is provided.
         * @param target
         * @returns {*}
         */
        function addSuffix(target) {
          var styles = 'top left right bottom ' +
            'x y width height ' +
            'border-width border-radius borderWidth borderRadius' +
            'margin margin-top margin-bottom margin-left margin-right ' +
            'padding padding-left padding-right padding-top padding-bottom'.split(' ');

          angular.forEach(target, function(val, key) {
            var isPositional = styles.indexOf(key) > -1;
            var hasPx        = String(val).indexOf('px') > -1;

            if (isPositional && !hasPx) {
              target[key] = val + 'px';
            }
          });

          return target;
        }
      };
    }]);

angular.module('ngAnimateStylers', ['ngAnimateSequence'])

  .config(['$$animateStylerProvider', function($$animateStylerProvider) {
    var isDefined = angular.isDefined;

    //JQUERY
    $$animateStylerProvider.register('jQuery', function() {
      return function(element, pre, duration, delay) {
        delay = delay || 0;
        element.css(pre);
        return function(post, done) {
          element.animate(post, duration, null, done);
        }
      };
    });

    //Web Animations API
    $$animateStylerProvider.register('webAnimations', ['$window', '$sniffer',
                                               function($window,   $sniffer) {
      // TODO(matias): figure out other styles to add here
      var specialStyles = 'transform,transition,animation'.split(',');
      var webkit = $sniffer.vendorPrefix.toLowerCase() == 'webkit';

      return function(element, pre, duration, delay) {
        var node = element[0];
        if (!node.animate) {
          throw new Error("WebAnimations (element.animate) is not defined for use within $$animationStylerProvider.");
        }

        delay = delay || 0;
        duration = duration || 1000;
        var iterations = 1; // FIXME(matias): make sure this can be changed
        pre = camelCaseStyles(pre);

        return function(post, done) {
          var finalStyles = normalizeVendorPrefixes(post);

          post = camelCaseStyles(post);

          var missingProperties = [];
          angular.forEach(post, function(_, key) {
            if (!isDefined(pre[key])) {
              missingProperties.push(key);
            }
          });

          // The WebAnimations API requires that each of the to-be-animated styles
          // are provided a starting value at the 0% keyframe. Since the sequencer
          // API does not require this then let's figure out each of the styles using
          // computeStartingStyles(...) and merge that with the existing pre styles
          if (missingProperties.length) {
            pre = angular.extend(pre, computeStartingStyles(node, missingProperties));
          }

          var animation = node.animate([pre, post], {
            duration : duration,
            delay : delay,
            iterations : iterations
          });
          animation.onfinish = function() {
            element.css(finalStyles);
            done();
          };
        }
      };

      function computeStartingStyles(node, props) {
        var computedStyles = $window.getComputedStyle(node);
        var styles = {};
        angular.forEach(props, function(prop) {
          var value = computedStyles[prop];

          // TODO(matias): figure out if webkit is the only prefix we need
          if (!isDefined(value) && webkit && specialStyles.indexOf(prop) >= 0) {
            prop = 'webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
            value = computedStyles[prop];
          }
          if (isDefined(value)) {
            styles[prop] = value;
          }
        });
        return styles;
      }

      function normalizeVendorPrefixes(styles) {
        var newStyles = {};
        angular.forEach(styles, function(value, prop) {
          if(webkit && specialStyles.indexOf(prop) >= 0) {
            newStyles['webkit' + prop.charAt(0).toUpperCase() + prop.substr(1)] = value;
          }
          newStyles[prop]=value;
        });
        return newStyles;
      }
    }]);

    // Greensock Animation Platform (GSAP)
    $$animateStylerProvider.register('gsap', function() {
      return function(element, pre, duration, delay) {
        var styler = TweenMax || TweenLite;

        if ( !styler) {
          throw new Error("GSAP TweenMax or TweenLite is not defined for use within $$animationStylerProvider.");
        }


        return function(post, done) {
          styler.fromTo(
            element,
            (duration || 0)/1000,
            pre || { },
            angular.extend( post, {onComplete:done, delay: (delay || 0)/1000} )
          );
        }
      };
    });

    function camelCaseStyles(styles) {
      var newStyles = {};
      angular.forEach(styles, function(value, prop) {
        prop = prop.toLowerCase().replace(/-(.)/g, function(match, group1) {
          return group1.toUpperCase();
        });
        newStyles[prop]=value;
      });
      return newStyles;
    }
  }]);

var Util = {
  /**
   * Checks to see if the element or its parents are disabled.
   * @param element DOM element to start scanning for `disabled` attribute
   * @param limit Number of parent levels that should be scanned; defaults to 4
   * @returns {*} Boolean
   */
  isDisabled : function isDisabled(element, limit) {
    return Util.ancestorHasAttribute( element, 'disabled', limit );
  },
  /**
   * Checks if the specified element has an ancestor (ancestor being parent, grandparent, etc)
   * with the given attribute defined.
   *
   * Also pass in an optional `limit` (levels of ancestry to scan), default 8.
   */
  ancestorHasAttribute: function ancestorHasAttribute(element, attrName, limit) {
    limit = limit || 4;
    var current = element;
    while (limit-- && current.length) {
      if (current[0].hasAttribute && current[0].hasAttribute(attrName)) {
        return true;
      }
      current = current.parent();
    }
    return false;
  },

  /**
   * Checks if two elements have the same parent
   */
  elementIsSibling: function elementIsSibling(element, otherElement) {
    return element.parent().length &&
      (element.parent()[0] === otherElement.parent()[0]);
  }
};


/**
 * @ngdoc module
 * @name material.components.animate
 * @description
 *
 * Ink and Popup Effects
 */
angular.module('material.animations', [
  'ngAnimateStylers',
  'ngAnimateSequence',
  'material.services.position',
  'material.services.throttle'
])
  .service('$materialEffects', [
    '$animateSequence',
    '$ripple',
    '$rootElement',
    '$position',
    '$$rAF',
    '$sniffer',
    MaterialEffects
  ]);

/**
 * @ngdoc service
 * @name $materialEffects
 * @module material.components.animate
 *
 * @description
 * The `$materialEffects` service provides a simple API for various
 * Material Design effects:
 *
 * 1) to animate ink bars and ripple effects, and
 * 2) to perform popup open/close effects on any DOM element.
 *
 * @returns A `$materialEffects` object with the following properties:
 * - `{function(canvas,options)}` `inkRipple` - Renders ripple ink
 * waves on the specified canvas
 * - `{function(element,styles,duration)}` `inkBar` - starts ink bar
 * animation on specified DOM element
 * - `{function(element,parentElement,clickElement)}` `popIn` - animated show of element overlayed on parent element
 * - `{function(element,parentElement)}` `popOut` - animated close of popup overlay
 *
 */
function MaterialEffects($animateSequence, $ripple, $rootElement, $position, $$rAF, $sniffer) {

  var styler = angular.isDefined( $rootElement[0].animate ) ? 'webAnimations' :
               angular.isDefined( window['TweenMax'] || window['TweenLite'] ) ? 'gsap'   :
               angular.isDefined( window['jQuery'] ) ? 'jQuery' : 'default';


  var isWebkit = /webkit/i.test($sniffer.vendorPrefix);
  var TRANSFORM_PROPERTY = isWebkit ? 'webkitTransform' : 'transform';
  var TRANSITIONEND_EVENT = 'transitionend' +
    (isWebkit ? ' webkitTransitionEnd' : '');

  // Publish API for effects...
  return {
    inkRipple: animateInkRipple,
    popIn: popIn,
    popOut: popOut,

    /* Constants */
    TRANSFORM_PROPERTY: TRANSFORM_PROPERTY,
    TRANSITIONEND_EVENT: TRANSITIONEND_EVENT
  };

  // **********************************************************
  // API Methods
  // **********************************************************

  /**
   * Use the canvas animator to render the ripple effect(s).
   */
  function animateInkRipple( canvas, options )
  {
    return new $ripple(canvas, options);
  }

  /**
   *
   */
  function popIn(element, parentElement, clickElement, done) {
    parentElement.append(element);

    var startPos;
    if (clickElement) {
      var clickPos = $position.offset(clickElement);
      startPos = translateString(
        clickPos.left - element[0].offsetWidth / 2,
        clickPos.top - element[0].offsetHeight / 2,
        0
      ) + ' scale(0.2)';
    } else {
      startPos = 'translate3d(0,100%,0) scale(0.5)';
    }

    element
      .css(TRANSFORM_PROPERTY, startPos)
      .css('opacity', 0);

    $$rAF(function() {
      $$rAF(function() {
        element
          .addClass('active')
          .css(TRANSFORM_PROPERTY, '')
          .css('opacity', '')
          .on(TRANSITIONEND_EVENT, finished);
      });
    });

    function finished(ev) {
      //Make sure this transitionend didn't bubble up from a child
      if (ev.target === element[0]) {
        element.off(TRANSITIONEND_EVENT, finished);
        (done || angular.noop)();
      }
    }
  }

  /**
   *
   *
   */
  function popOut(element, parentElement, done) {
    var endPos = $position.positionElements(parentElement, element, 'bottom-center');

    element.css({
      '-webkit-transform': translateString(endPos.left, endPos.top, 0) + ' scale(0.5)',
      opacity: 0
    });
    element.on(TRANSITIONEND_EVENT, finished);

    function finished(ev) {
      //Make sure this transitionend didn't bubble up from a child
      if (ev.target === element[0]) {
        element.off(TRANSITIONEND_EVENT, finished);
        (done || angular.noop)();
      }
    }
  }


  // **********************************************************
  // Utility Methods
  // **********************************************************


  function translateString(x, y, z) {
    return 'translate3d(' + Math.floor(x) + 'px,' + Math.floor(y) + 'px,' + Math.floor(z) + 'px)';
  }


  /**
   * Support values such as 0.65 secs or 650 msecs
   */
  function safeDuration(value) {
    var duration = isNaN(value) ? 0 : Number(value);
    return (duration < 1.0) ? (duration * 1000) : duration;
  }

  /**
   * Convert all values to decimal;
   * eg 150 msecs -> 0.15sec
   */
  function safeVelocity(value) {
    var duration = isNaN(value) ? 0 : Number(value);
    return (duration > 100) ? (duration / 1000) :
      (duration > 10 ) ? (duration / 100) :
        (duration > 1  ) ? (duration / 10) : duration;
  }

}


angular.module('material.animations')
  .service('$ripple', [
    '$$rAF',
    MaterialRippleService
  ]);
/**
 * Port of the Polymer Paper-Ripple code
 * This service returns a reference to the Ripple class
 *
 * @group Paper Elements
 * @element paper-ripple
 * @homepage github.io
 */

function MaterialRippleService($$rAF) {
  var now = Date.now;

  if (window.performance && performance.now) {
    now = performance.now.bind(performance);
  }

  /**
   * Unlike angular.extend() will always overwrites destination,
   * mixin() only overwrites the destination if it is undefined; so
   * pre-existing destination values are **not** modified.
   */
  var mixin = function (dst) {
    angular.forEach(arguments, function(obj) {
      if (obj !== dst) {
        angular.forEach(obj, function(value, key) {
          // Only mixin if destination value is undefined
          if ( angular.isUndefined(dst[key]) )
            {
              dst[key] = value;
            }
        });
      }
    });
    return dst;
  };

  // **********************************************************
  // Ripple Class
  // **********************************************************

  return (function(){

    /**
     *  Ripple creates a `paper-ripple` which is a visual effect that other quantum paper elements can
     *  use to simulate a rippling effect emanating from the point of contact.  The
     *  effect can be visualized as a concentric circle with motion.
     */
    function Ripple(canvas, options) {

      this.canvas = canvas;
      this.waves = [];
      this.cAF = undefined;

      return angular.extend(this, mixin(options || { }, {
        onComplete: angular.noop,   // Completion hander/callback
        initialOpacity: 0.6,        // The initial default opacity set on the wave.
        opacityDecayVelocity: 1.7,  // How fast (opacity per second) the wave fades out.
        backgroundFill: true,
        pixelDensity: 1
      }));
    }

    /**
     *  Define class methods
     */
    Ripple.prototype = {

      /**
       *
       */
      createAt : function (startAt) {
        var canvas = this.adjustBounds(this.canvas);
        var width = canvas.width / this.pixelDensity;
        var height = canvas.height / this.pixelDensity;
        var recenter = this.canvas.classList.contains("recenteringTouch");

        // Auto center ripple if startAt is not defined...
        startAt = startAt || { x: Math.round(width / 2), y: Math.round(height / 2) };

        this.waves.push( createWave(canvas, width, height, startAt, recenter ) );
        this.cancelled = false;

        this.animate();
      },

      /**
       *
       */
      draw : function (done) {
        this.onComplete = done;

        for (var i = 0; i < this.waves.length; i++) {
          // Declare the next wave that has mouse down to be mouse'ed up.
          var wave = this.waves[i];
          if (wave.isMouseDown) {
            wave.isMouseDown = false
            wave.mouseDownStart = 0;
            wave.tUp = 0.0;
            wave.mouseUpStart = now();
            break;
          }
        }
        this.animate();
      },

      /**
       *
       */
      cancel : function () {
        this.cancelled = true;
        return this;
      },

      /**
       *  Stop or start rendering waves for the next animation frame
       */
      animate : function (active) {
        if (angular.isUndefined(active)) active = true;

        if (active === false) {
          if (angular.isDefined(this.cAF)) {
            this._loop = null;
            this.cAF();

            // Notify listeners [via callback] of animation completion
            this.onComplete();
          }
        } else {
          if (!this._loop) {
            this._loop = angular.bind(this, function () {
              var ctx = this.canvas.getContext('2d');
              ctx.scale(this.pixelDensity, this.pixelDensity);

              this.onAnimateFrame(ctx);
            });
          }
          this.cAF = $$rAF(this._loop);
        }
      },

      /**
       *
       */
      onAnimateFrame : function (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var deleteTheseWaves = [];
        // wave animation values
        var anim = {
          initialOpacity: this.initialOpacity,
          opacityDecayVelocity: this.opacityDecayVelocity,
          height: ctx.canvas.height,
          width: ctx.canvas.width
        };

        for (var i = 0; i < this.waves.length; i++) {
          var wave = this.waves[i];

          if ( !this.cancelled ) {

            if (wave.mouseDownStart > 0) {
              wave.tDown =  now() - wave.mouseDownStart;
            }
            if (wave.mouseUpStart > 0) {
              wave.tUp = now() - wave.mouseUpStart;
            }

            // Obtain the instantaneous size and alpha of the ripple.
            // Determine whether there is any more rendering to be done.

            var radius = waveRadiusFn(wave.tDown, wave.tUp, anim);
            var maximumWave = waveAtMaximum(wave, radius, anim);
            var waveDissipated = waveDidFinish(wave, radius, anim);
            var shouldKeepWave = !waveDissipated || !maximumWave;

            if (!shouldKeepWave) {

              deleteTheseWaves.push(wave);

            } else {


              drawWave( wave, angular.extend( anim, {
                radius : radius,
                backgroundFill : this.backgroundFill,
                ctx : ctx
              }));

            }
          }
        }

        if ( this.cancelled ) {
          // Clear all waves...
          deleteTheseWaves = deleteTheseWaves.concat( this.waves );
        }
        for (var i = 0; i < deleteTheseWaves.length; ++i) {
          removeWave( deleteTheseWaves[i], this.waves );
        }

        if (!this.waves.length) {
          // If there is nothing to draw, clear any drawn waves now because
          // we're not going to get another requestAnimationFrame any more.
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

          // stop animations
          this.animate(false);

        } else if (!waveDissipated && !maximumWave) {
          this.animate();
        }

        return this;
      },

      /**
       *
       */
      adjustBounds : function (canvas) {
        // Default to parent container to define bounds
        var self = this,
        src = canvas.parentNode.getBoundingClientRect(),  // read-only
        bounds = { width: src.width, height: src.height };

        angular.forEach("width height".split(" "), function (style) {
          var value = (self[style] != "auto") ? self[style] : undefined;

          // Allow CSS to explicitly define bounds (instead of parent container
          if (angular.isDefined(value)) {
            bounds[style] = sanitizePosition(value);
            canvas.setAttribute(style, bounds[style] * self.pixelDensity + "px");
          }

        });

        // NOTE: Modified from polymer implementation
        canvas.setAttribute('width', bounds.width * this.pixelDensity + "px");
        canvas.setAttribute('height', bounds.height * this.pixelDensity + "px");

        function sanitizePosition(style) {
          var val = style.replace('px', '');
          return val;
        }

        return canvas;
      }

    };

    // Return class reference

    return Ripple;
  })();




  // **********************************************************
  // Private Wave Methods
  // **********************************************************

  /**
   *
   */
  function waveRadiusFn(touchDownMs, touchUpMs, anim) {
    // Convert from ms to s.
    var waveMaxRadius = 150;
    var touchDown = touchDownMs / 1000;
    var touchUp = touchUpMs / 1000;
    var totalElapsed = touchDown + touchUp;
    var ww = anim.width, hh = anim.height;
    // use diagonal size of container to avoid floating point math sadness
    var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
    var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
    var tt = (totalElapsed / duration);

    var size = waveRadius * (1 - Math.pow(80, -tt));
    return Math.abs(size);
  }

  /**
   *
   */
  function waveOpacityFn(td, tu, anim) {
    // Convert from ms to s.
    var touchDown = td / 1000;
    var touchUp = tu / 1000;

    return (tu <= 0) ? anim.initialOpacity : Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
  }

  /**
   *
   */
  function waveOuterOpacityFn(td, tu, anim) {
    // Convert from ms to s.
    var touchDown = td / 1000;
    var touchUp = tu / 1000;

    // Linear increase in background opacity, capped at the opacity
    // of the wavefront (waveOpacity).
    var outerOpacity = touchDown * 0.3;
    var waveOpacity = waveOpacityFn(td, tu, anim);
    return Math.max(0, Math.min(outerOpacity, waveOpacity));
  }


  /**
   * Determines whether the wave should be completely removed.
   */
  function waveDidFinish(wave, radius, anim) {
    var waveMaxRadius = 150;
    var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
    // If the wave opacity is 0 and the radius exceeds the bounds
    // of the element, then this is finished.
    if (waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
      return true;
    }
    return false;
  };

  /**
   *
   */
  function waveAtMaximum(wave, radius, anim) {
    var waveMaxRadius = 150;
    var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
    if (waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
      return true;
    }
    return false;
  }

  /**
   *  Wave is created on mouseDown
   */
  function createWave(elem, width, height, startAt, recenter ) {
    var wave = {
      startPosition : startAt,
      containerSize : Math.max(width, height),
      waveColor: window.getComputedStyle(elem).color,
      maxRadius : distanceFromPointToFurthestCorner(startAt, {w: width, h: height}) * 0.75,

      isMouseDown : true,
      mouseDownStart : now(),
      mouseUpStart : 0.0,

      tDown : 0.0,
      tUp : 0.0
    };

    if ( recenter ) {
      wave.endPosition = {x: width / 2, y: height / 2};
      wave.slideDistance = dist(wave.startPosition, wave.endPosition);
    }

    return wave;
  }

  /**
   *
   */
  function removeWave(wave, buffer) {
    if (buffer && buffer.length) {
      var pos = buffer.indexOf(wave);
      buffer.splice(pos, 1);
    }
  }

  function drawWave ( wave, anim ) {

    // Calculate waveColor and alphas; if we do a background
    // fill fade too, work out the correct color.

    anim.waveColor = cssColorWithAlpha(
      wave.waveColor,
      waveOpacityFn(wave.tDown, wave.tUp, anim)
    );

    if ( anim.backgroundFill ) {
      anim.backgroundFill = cssColorWithAlpha(
        wave.waveColor,
        waveOuterOpacityFn(wave.tDown, wave.tUp, anim)
      );
    }

    // Position of the ripple.
    var x = wave.startPosition.x;
    var y = wave.startPosition.y;

    // Ripple gravitational pull to the center of the canvas.
    if ( wave.endPosition ) {

      // This translates from the origin to the center of the view  based on the max dimension of
      var translateFraction = Math.min(1, anim.radius / wave.containerSize * 2 / Math.sqrt(2));

      x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
      y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
    }

    // Draw the ripple.
    renderRipple(anim.ctx, x, y, anim.radius, anim.waveColor, anim.backgroundFill);

    // Render the ripple on the target canvas 2-D context
    function renderRipple(ctx, x, y, radius, innerColor, outerColor) {
      if (outerColor) {
        ctx.fillStyle = outerColor || 'rgba(252, 252, 158, 1.0)';
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
      }
      ctx.beginPath();

      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = innerColor || 'rgba(252, 252, 158, 1.0)';
      ctx.fill();

      ctx.closePath();
    }
  }


  /**
   *
   */
  function cssColorWithAlpha(cssColor, alpha) {
    var parts = cssColor ? cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/) : null;
    if (typeof alpha == 'undefined') {
      alpha = 1;
    }
    if (!parts) {
      return 'rgba(255, 255, 255, ' + alpha + ')';
    }
    return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
  }

  /**
   *
   */
  function dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  /**
   *
   */
  function distanceFromPointToFurthestCorner(point, size) {
    var tl_d = dist(point, {x: 0, y: 0});
    var tr_d = dist(point, {x: size.w, y: 0});
    var bl_d = dist(point, {x: 0, y: size.h});
    var br_d = dist(point, {x: size.w, y: size.h});
    return Math.max(tl_d, tr_d, bl_d, br_d);
  }

}

(function() {

angular.module('material.animations')

/**
 * noink/nobar/nostretch directive: make any element that has one of
 * these attributes be given a controller, so that other directives can
 * `require:` these and see if there is a `no<xxx>` parent attribute.
 *
 * @usage
 * <hljs lang="html">
 * <parent noink>
 *   <child detect-no>
 *   </child>
 * </parent>
 * </hljs>
 *
 * <hljs lang="js">
 * myApp.directive('detectNo', function() {
 *   return {
 *     require: ['^?noink', ^?nobar'],
 *     link: function(scope, element, attr, ctrls) {
 *       var noinkCtrl = ctrls[0];
 *       var nobarCtrl = ctrls[1];
 *       if (noInkCtrl) {
 *         alert("the noink flag has been specified on an ancestor!");
 *       }
 *       if (nobarCtrl) {
 *         alert("the nobar flag has been specified on an ancestor!");
 *       }
 *     }
 *   };
 * });
 * </hljs>
 */
.directive({
  noink: attrNoDirective(),
  nobar: attrNoDirective(),
  nostretch: attrNoDirective(),
});

function attrNoDirective() {
  return function() {
    return {
      controller: angular.noop
    };
  };
}

})();

(function() {

  angular.module('material.animations')
    .directive('materialRipple', [
      '$materialEffects',
      '$interpolate',
      '$throttle',
      MaterialRippleDirective
    ]);

  /**
   * @ngdoc directive
   * @name materialRipple
   * @module material.components.animate
   *
   * @restrict E
   *
   * @description
   * The `<material-ripple/>` directive implements the Material Design ripple ink effects within a specified
   * parent container.
   *
   * @param {string=} start Indicates where the wave ripples should originate in the parent container area.
   * 'center' will force the ripples to always originate in the horizontal and vertical.
   * @param {number=} initial-opacity Value indicates the initial opacity of each ripple wave
   * @param {number=} opacity-decay-velocity Value indicates the speed at which each wave will fade out
   *
   * @usage
   * ```
   * <hljs lang="html">
   *   <material-ripple initial-opacity="0.9" opacity-decay-velocity="0.89"></material-ripple>
   * </hljs>
   * ```
   */
  function MaterialRippleDirective($materialEffects, $interpolate, $throttle) {
    return {
      restrict: 'E',
      require: '^?noink',
      compile: compileWithCanvas
    };

    /**
     * Use Javascript and Canvas to render ripple effects
     *
     * Note: attribute start="" has two (2) options: `center` || `pointer`; which
     * defines the start of the ripple center.
     *
     * @param element
     * @returns {Function}
     */
    function compileWithCanvas( element, attrs ) {
      var RIGHT_BUTTON = 2;

        var options  = calculateOptions(element, attrs);
        var tag =
          '<canvas ' +
            'class="material-ink-ripple {{classList}}"' +
            'style="top:{{top}}; left:{{left}}" >' +
          '</canvas>';

        element.replaceWith(
          angular.element( $interpolate(tag)(options) )
        );

      return function postLink( scope, element, attrs, noinkCtrl ) {
        if ( noinkCtrl ) return;

        var ripple, watchMouse,
          parent = element.parent(),
          makeRipple = $throttle({
            start : function() {
              ripple = ripple || $materialEffects.inkRipple( element[0], options );
              watchMouse = watchMouse || buildMouseWatcher(parent, makeRipple);

              // Ripples start with left mouseDowns (or taps)
              parent.on('mousedown', makeRipple);
            },
            throttle : function(e, done) {
              if ( !Util.isDisabled(element) ) {
                switch(e.type) {
                  case 'mousedown' :
                    // If not right- or ctrl-click...
                    if (!e.ctrlKey && (e.button !== RIGHT_BUTTON))
                    {
                      watchMouse(true);
                      ripple.createAt( options.forceToCenter ? null : localToCanvas(e) );
                    }
                    break;

                  default:
                    watchMouse(false);

                    // Draw of each wave/ripple in the ink only occurs
                    // on mouseup/mouseleave

                    ripple.draw( done );
                    break;
                }
              } else {
                done();
              }
            },
            end : function() {
              watchMouse(false);
            }
          })();


        // **********************************************************
        // Utility Methods
        // **********************************************************

        /**
         * Build mouse event listeners for the specified element
         * @param element Angular element that will listen for bubbling mouseEvents
         * @param handlerFn Function to be invoked with the mouse event
         * @returns {Function}
         */
        function buildMouseWatcher(element, handlerFn) {
          // Return function to easily toggle on/off listeners
          return function watchMouse(active) {
            angular.forEach("mouseup,mouseleave".split(","), function(eventType) {
              var fn = active ? element.on : element.off;
              fn.apply(element, [eventType, handlerFn]);
            });
          };
        }

        /**
         * Convert the mouse down coordinates from `parent` relative
         * to `canvas` relative; needed since the event listener is on
         * the parent [e.g. tab element]
         */
        function localToCanvas(e)
        {
          var canvas = element[0].getBoundingClientRect();

          return  {
            x : e.clientX - canvas.left,
            y : e.clientY - canvas.top
          };
        }

      };

      function calculateOptions(element, attrs)
      {
        return angular.extend( getBounds(element), {
          classList : (attrs.class || ""),
          forceToCenter : (attrs.start == "center"),
          initialOpacity : getFloatValue( attrs, "initialOpacity" ),
          opacityDecayVelocity : getFloatValue( attrs, "opacityDecayVelocity" )
        });

        function getBounds(element) {
          var node = element[0];
          var styles  =  node.ownerDocument.defaultView.getComputedStyle( node, null ) || { };

          return  {
            left : (styles.left == "auto" || !styles.left) ? "0px" : styles.left,
            top : (styles.top == "auto" || !styles.top) ? "0px" : styles.top,
            width : getValue( styles, "width" ),
            height : getValue( styles, "height" )
          };
        }

        function getFloatValue( map, key, defaultVal )
        {
          return angular.isDefined( map[key] ) ? +map[key] : defaultVal;
        }

        function getValue( map, key, defaultVal )
        {
          var val = map[key];
          return (angular.isDefined( val ) && (val !== ""))  ? map[key] : defaultVal;
        }
      }

    }

  }


})();

/**
 * @ngdoc module
 * @name material.components.buttons
 * @description
 *
 * Button
 */
angular.module('material.components.button', [
  'material.animations',
])
  .directive('materialButton', [
    'ngHrefDirective',
    MaterialButtonDirective
  ]);

/**
 * @ngdoc directive
 * @name materialButton
 * @order 0
 *
 * @restrict E
 *
 * @description
 * `<material-button>` is a button directive with optional ink ripples (default enabled).
 *
 * @param {boolean=} noink Flag indicates use of ripple ink effects
 * @param {boolean=} disabled Flag indicates if the tab is disabled: not selectable with no ink effects
 * @param {string=} type Optional attribute to specific button types (useful for forms); such as 'submit', etc.
 * @param {string=} ng-ref Optional attribute to support both ARIA and link navigation
 * @param {string=} href Optional attribute to support both ARIA and link navigation
 *
 * @usage
 * <hljs lang="html">
 *  <material-button>Button</material-button>
 *  <br/>
 *  <material-button noink class="material-button-colored">
 *    Button (noInk)
 *  </material-button>
 *  <br/>
 *  <material-button disabled class="material-button-colored">
 *    Colored (disabled)
 *  </material-button>
 * </hljs>
 */
function MaterialButtonDirective(ngHrefDirectives) {
  var ngHrefDirective = ngHrefDirectives[0];
  return {
    restrict: 'E',
    transclude: true,
    template: '<material-ripple start="center" initial-opacity="0.25" opacity-decay-velocity="0.75"></material-ripple>',
    compile: function(element, attr) {

      // Add an inner anchor if the element has a `href` or `ngHref` attribute,
      // so this element can be clicked like a normal `<a>`.
      var href = attr.ngHref || attr.href;
      var innerElement;
      if (href) {
        innerElement = angular.element('<a>');
        innerElement.attr('ng-href',href);
        innerElement.attr('rel', attr.rel);
        innerElement.attr('target', attr.target);

      // Otherwise, just add an inner button element (for form submission etc)
      } else {
        innerElement = angular.element('<button>');
        innerElement.attr('type', attr.type);
        innerElement.attr('disabled', attr.ngDisabled || attr.disabled);
        innerElement.attr('form', attr.form);
      }
      innerElement.addClass('material-button-inner');
      element.append(innerElement);

      return function postLink(scope, element, attr, ctrl, transclude) {
        // Put the content of the <material-button> inside after the ripple
        // and inner elements
        transclude(scope, function(clone) {
          element.append(clone);
        });
      };
    }
  };

}

/**
 * @ngdoc module
 * @name material.components.card
 *
 * @description
 * Card components.
 */
angular.module('material.components.card', [
])
  .directive('materialCard', [
    materialCardDirective
  ]);

/**
 * @ngdoc directive
 * @name materialCard
 * @module material.components.card
 *
 * @restrict E
 *
 * @description
 * The `<material-card>` directive is a container element used within `<material-content>` containers.
 *
 * @usage
 * <hljs lang="html">
 *  <material-card>
 *    <img src="/img/washedout.png" class="material-card-image">
 *    <h2>Paracosm</h2>
 *    <p>
 *      The titles of Washed Out's breakthrough song and the first single from Paracosm share the
 *      two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...
 *    </p>
 *  </material-card>
 * </hljs>
 *
 */
function materialCardDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  };
}

/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */
angular.module('material.components.checkbox', [
  'material.animations'
])
  .directive('materialCheckbox', [
    'inputDirective',
    materialCheckboxDirective
  ]);

/**
 * @ngdoc directive
 * @name materialCheckbox
 * @module material.components.checkbox
 * @restrict E
 *
 * @description
 * The checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D)
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} name Property name of the form under which the control is published.
 * @param {expression=} ngTrueValue The value to which the expression should be set when selected.
 * @param {expression=} ngFalseValue The value to which the expression should be set when not selected.
 * @param {string=} ngChange Angular expression to be executed when input changes due to user interaction with the input element.
 * @param {boolean=} noink Use of attribute indicates use of ripple ink effects
 * @param {boolean=} disabled Use of attribute indicates the tab is disabled: no ink effects and not selectable
 *
 * @usage
 * <hljs lang="html">
 * <material-checkbox ng-model="isChecked">
 *   Finished ?
 * </material-checkbox>
 *
 * <material-checkbox noink ng-model="hasInk">
 *   No Ink Effects
 * </material-checkbox>
 *
 * <material-checkbox disabled ng-model="isDisabled">
 *   Disabled
 * </material-checkbox>
 *
 * </hljs>
 *
 */
function materialCheckboxDirective(inputDirectives) {
  var inputDirective = inputDirectives[0];

  var CHECKED_CSS = 'material-checked';

  return {
    restrict: 'E',
    transclude: true,
    require: '?ngModel',
    template:
      '<div class="material-container">' +
        '<material-ripple start="center" class="circle" material-checked="{{ checked }}" ></material-ripple>' +
        '<div class="material-icon"></div>' +
      '</div>' +
      '<div ng-transclude class="material-label"></div>',
    link: postLink
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function postLink(scope, element, attr, ngModelCtrl) {
    var checked = false;

    // Create a mock ngModel if the user doesn't provide one
    ngModelCtrl = ngModelCtrl || {
      $setViewValue: function(value) {
        this.$viewValue = value;
      },
      $parsers: [],
      $formatters: []
    };

    // Reuse the original input[type=checkbox] directive from Angular core.
    // This is a bit hacky as we need our own event listener and own render
    // function.
    attr.type = 'checkbox';
    inputDirective.link(scope, {
      on: angular.noop,
      0: {}
    }, attr, [ngModelCtrl]);

    element.on('click', listener);
    ngModelCtrl.$render = render;

    function listener(ev) {
      if ( Util.isDisabled(element) ) return;

      scope.$apply(function() {
        checked = !checked;
        ngModelCtrl.$setViewValue(checked, ev && ev.type);
        ngModelCtrl.$render();
      });
    }

    function render() {
      checked = ngModelCtrl.$viewValue;
      element.attr('aria-checked', checked);
      if(checked) {
        element.addClass(CHECKED_CSS);
      } else {
        element.removeClass(CHECKED_CSS);
      }
    }
  }

}



/**
 * @ngdoc module
 * @name material.components.content
 *
 * @description
 * Scrollable content
 */
angular.module('material.components.content', [
  'material.services.registry'
])
  .directive('materialContent', [
    materialContentDirective
  ]);

/**
 * @ngdoc directive
 * @name materialContent
 * @module material.components.content
 *
 * @restrict E
 *
 * @description
 * The `<material-content>` directive is a container element useful for scrollable content
 *
 * @usage
 * <hljs lang="html">
 *  <material-content class="material-content-padding">
 *      Lorem ipsum dolor sit amet, ne quod novum mei.
 *  </material-content>
 * </hljs>
 *
 */
function materialContentDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="material-content" ng-transclude></div>',
    controller: angular.noop,
    link: function($scope, $element, $attr) {
      $scope.$broadcast('$materialContentLoaded', $element);
    }
  };
}

/**
 * @ngdoc module
 * @name material.components.dialog
 */
angular.module('material.components.dialog', [
  'material.animations',
  'material.services.compiler'
])
  .directive('materialDialog', [
    MaterialDialogDirective
  ])
  .factory('$materialDialog', [
    '$timeout',
    '$materialCompiler',
    '$rootElement',
    '$rootScope',
    '$materialEffects',
    '$animate',
    MaterialDialogService
  ]);

function MaterialDialogDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $materialDialog
 * @module material.components.dialog
 *
 * @description
 *
 * The $materialDialog service opens a dialog over top of the app.
 *
 * See the overview page for an example.
 *
 * The `$materialDialog` service can be used as a function, which when called will open a
 * dialog. Note: the dialog is always given an isolate scope.
 *
 * It takes one argument, `options`, which is defined below.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <material-button ng-click="openDialog($event)">
 *     Open a Dialog from this button!
 *   </material-dialog>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $materialDialog) {
 *   $scope.openDialog = function($event) {
 *     var hideDialog = $materialDialog({
 *       template: '<material-dialog>Hello!</material-dialog>',
 *       targetEvent: $event
 *     });
 *   };
 * });
 * </hljs>
 *
 * @returns {function} `hideDialog` - A function that hides the dialog.
 *
 * @paramType Options
 * @param {string=} templateUrl The url of a template that will be used as the content
 * of the dialog. Restrictions: the template must have an outer `material-dialog` element.
 * Inside, use an element with class `dialog-content` for the dialog's content, and use
 * an element with class `dialog-actions` for the dialog's actions.
 * @param {string=} template Same as templateUrl, except this is an actual template string.
 * @param {DOMClickEvent=} targetEvent A click's event object. When passed in as an option,
 * the location of the click will be used as the starting point for the opening animation
 * of the the dialog.
 * @param {boolean=} hasBackdrop Whether there should be an opaque backdrop behind the dialog.
 *   Default true.
 * @param {boolean=} clickOutsideToClose Whether the user can click outside the dialog to
 *   close it. Default true.
 * @param {boolean=} escapeToClose Whether the user can press escape to close the dialog.
 *   Default true.
 * @param {string=} controller The controller to associate with the dialog. The controller
 * will be injected with the local `$hideDialog`, which is a function used to hide the dialog.
 * @param {object=} locals An object containing key/value pairs. The keys will be used as names
 * of values to inject into the controller. For example, `locals: {three: 3}` would inject
 * `three` into the controller, with the value 3.
 * @param {object=} resolve Similar to locals, except it takes promises as values, and the
 * toast will not open until all of the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 * @param {element=} appendTo The element to append the dialog to. Defaults to appending
 *   to the root element of the application.
 */
function MaterialDialogService($timeout, $materialCompiler, $rootElement, $rootScope, $materialEffects, $animate) {
  var recentDialog;

  return showDialog;

  function showDialog(options) {
    options = angular.extend({
      appendTo: $rootElement,
      hasBackdrop: true, // should have an opaque backdrop
      clickOutsideToClose: true, // should have a clickable backdrop to close
      escapeToClose: true,
      // targetEvent: used to find the location to start the dialog from
      targetEvent: null,
      transformTemplate: function(template) {
        return '<div class="material-dialog-container">' + template + '</div>';
      },
      // Also supports all options from $materialCompiler.compile
    }, options || {});

    // Incase the user provides a raw dom element, always wrap it in jqLite
    options.appendTo = angular.element(options.appendTo);

    // Close the old dialog
    recentDialog && recentDialog.then(function(destroyDialog) {
      destroyDialog();
    });

    recentDialog = $materialCompiler.compile(options).then(function(compileData) {
      // Controller will be passed a `$hideDialog` function
      compileData.locals.$hideDialog = destroyDialog;

      var scope = $rootScope.$new(true);
      var element = compileData.link(scope);
      var popInTarget = options.targetEvent && options.targetEvent.target &&
        angular.element(options.targetEvent.target);
      var backdrop;

      if (options.hasBackdrop) {
        backdrop = angular.element('<material-backdrop class="opaque ng-enter">');
        $animate.enter(backdrop, options.appendTo, null);
      }
      $materialEffects.popIn(element, options.appendTo, popInTarget, function() {
        if (options.escapeToClose) {
          $rootElement.on('keyup', onRootElementKeyup);
        }

        if (options.clickOutsideToClose) {
          element.on('click', dialogClickOutside);
        }
      });

      return destroyDialog;

      function destroyDialog() {
        if (destroyDialog.called) return;
        destroyDialog.called = true;

        if (backdrop) {
          $animate.leave(backdrop);
        }
        if (options.escapeToClose) {
          $rootElement.off('keyup', onRootElementKeyup);
        }
        if (options.clickOutsideToClose) {
          element.off('click', dialogClickOutside);
        }
        $materialEffects.popOut(element, $rootElement, function() {
          element.remove();
          scope.$destroy();
          scope = null;
          element = null;
        });
      }
      function onRootElementKeyup(e) {
        if (e.keyCode == 27) {
          $timeout(destroyDialog);
        }
      }
      function dialogClickOutside(e) {
        // If we click the flex container outside the backdrop
        if (e.target === element[0]) {
          $timeout(destroyDialog);
        }
      }
    });

    return recentDialog;
  }
}

/**
 * @ngdoc module
 * @name material.components.form
 * @description
 * Form
 */
angular.module('material.components.form', [])
  .directive('materialInputGroup', [
    materialInputGroupDirective
  ])
  .directive('materialInput', [
    materialInputDirective
  ]);

/**
 * @ngdoc directive
 * @name materialInputGroup
 * @module material.components.form
 * @restrict E
 * @description
 * Use the `<material-input-group>` directive as the grouping parent of an `<material-input>` elements
 *
 * @usage
 * <hljs lang="html">
 * <material-input-group>
 *   <material-input type="text" ng-model="myText">
 * </material-input-group>
 * </hljs>
 */
function materialInputGroupDirective() {
  return {
    restrict: 'CE',
    controller: ['$element', function($element) {
      this.setFocused = function(isFocused) {
        $element.toggleClass('material-input-focused', !!isFocused);
      };
      this.setHasValue = function(hasValue) {
        $element.toggleClass('material-input-has-value', !!hasValue);
      };
    }]
  };
}

/**
 * @ngdoc directive
 * @name materialInput
 * @module material.components.form
 *
 * @restrict E
 *
 * @description
 * Use the `<material-input>` directive as elements within a `<material-input-group>` container
 *
 * @usage
 * <hljs lang="html">
 * <material-input-group>
 *   <material-input type="text" ng-model="user.fullName">
 *   <material-input type="text" ng-model="user.email">
 * </material-input-group>
 * </hljs>
 */
function materialInputDirective() {
  return {
    restrict: 'E',
    replace: true,
    template: '<input>',
    require: ['^?materialInputGroup', '?ngModel'],
    link: function(scope, element, attr, ctrls) {
      var inputGroupCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];
      if (!inputGroupCtrl) {
        return;
      }

      // When the input value changes, check if it "has" a value, and
      // set the appropriate class on the input group
      if (ngModelCtrl) {
        //Add a $formatter so we don't use up the render function
        ngModelCtrl.$formatters.push(function(value) {
          inputGroupCtrl.setHasValue(!!value);
          return value;
        });
      }
      element.on('input', function() {
        inputGroupCtrl.setHasValue(!!element.val());
      });

      // When the input focuses, add the focused class to the group
      element.on('focus', function(e) {
        inputGroupCtrl.setFocused(true);
      });
      // When the input blurs, remove the focused class from the group
      element.on('blur', function(e) {
        inputGroupCtrl.setFocused(false);
      });

      scope.$on('$destroy', function() {
        inputGroupCtrl.setFocused(false);
        inputGroupCtrl.setHasValue(false);
      });
    }
  };
}

/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */
angular.module('material.components.icon', [])
  .directive('materialIcon', [
    materialIconDirective
  ]);

/**
 * @ngdoc directive
 * @name materialIcon
 * @module material.components.icon
 *
 * @restrict E
 *
 * @description
 * The `<material-icon>` directive is an element useful for SVG icons
 *
 * @usage
 * <hljs lang="html">
 *  <material-icon icon="/img/icons/ic_access_time_24px.svg">
 *  </material-icon>
 * </hljs>
 *
 */
function materialIconDirective() {
  return {
    restrict: 'E',
    template: '<object class="material-icon"></object>',
    compile: function(element, attr) {
      var object = angular.element(element[0].children[0]);
      if(angular.isDefined(attr.icon)) {
        object.attr('data', attr.icon);
      }
    }
  };
}

/**
 * @ngdoc module
 * @name material.components.list
 * @description
 * List module
 */
angular.module('material.components.list', [])

.directive('materialList', [
  materialListDirective
])
.directive('materialItem', [
  materialItemDirective
]);

/**
 * @ngdoc directive
 * @name materialList
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<material-list>` directive is a list container for 1..n `<material-item>` tags.
 *
 * @usage
 * <hljs lang="html">
 * <material-list>
 *  <material-item ng-repeat="item in todos">
 *
 *    <div class="material-tile-content">
 *      <h2>{{item.what}}</h2>
 *      <h3>{{item.who}}</h3>
 *      <p>
 *        {{item.notes}}
 *      </p>
 *    </div>
 *
 *  </material-item>
 * </material-list>
 * </hljs>
 *
 */
function materialListDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  };
}

/**
 * @ngdoc directive
 * @name materialItem
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<material-item>` directive is a container intended for row items in a `<material-list>` container.
 *
 * @usage
 * <hljs lang="html">
 *  <material-list>
 *    <material-item>
 *            Item content in list
 *    </material-item>
 *  </material-list>
 * </hljs>
 *
 */
function materialItemDirective() {
  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
    }
  };
}


/**
 * @ngdoc module
 * @name material.components.radioButton
 * @description radioButton module!
 */
angular.module('material.components.radioButton', [
  'material.animations'
])
  .directive('materialRadioGroup', [
    materialRadioGroupDirective
  ])
  .directive('materialRadioButton', [
    materialRadioButtonDirective
  ]);

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name materialRadioGroup
 *
 * @order 0
 * @restrict E
 *
 * @description
 * The `<material-radio-group>` directive identifies a grouping
 * container for the 1..n grouped material radio buttons; specified using nested
 * `<material-radio-button>` tags.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {boolean=} noink Use of attribute indicates flag to disable ink ripple effects.
 *
 * @usage
 * <hljs lang="html">
 * <material-radio-group ng-model="selected">
 *
 *   <material-radio-button
 *        ng-repeat="d in colorOptions"
 *        ng-value="d.value">
 *
 *          {{ d.label }}
 *
 *   </material-radio-button>
 *
 * </material-radio-group>
 * </hljs>
 *
 */
function materialRadioGroupDirective() {
  Controller.prototype = createControllerProto();

  return {
    restrict: 'E',
    controller: Controller,
    require: ['materialRadioGroup', '?ngModel'],
    link: link
  };

  function link(scope, element, attr, ctrls) {
    var rgCtrl = ctrls[0],
      ngModelCtrl = ctrls[1] || {
        $setViewValue: angular.noop
      };
    rgCtrl.init(ngModelCtrl);
  }

  function Controller() {
    this._radioButtonRenderFns = [];
  }

  function createControllerProto() {
    return {
      init: function(ngModelCtrl) {
        this._ngModelCtrl = ngModelCtrl;
        this._ngModelCtrl.$render = angular.bind(this, this.render);
      },
      add: function(rbRender) {
        this._radioButtonRenderFns.push(rbRender);
      },
      remove: function(rbRender) {
        var index = this._radioButtonRenderFns.indexOf(rbRender);
        if (index !== -1) {
          this._radioButtonRenderFns.splice(index, 1);
        }
      },
      render: function() {
        this._radioButtonRenderFns.forEach(function(rbRender) {
          rbRender();
        });
      },
      setViewValue: function(value, eventType) {
        this._ngModelCtrl.$setViewValue(value, eventType);
        // update the other checkboxes as well
        this.render();
      },
      getViewValue: function() {
        return this._ngModelCtrl.$viewValue;
      }
    };
  }
}

/**
 * @ngdoc directive
 * @module material.components.radioButton
 * @name materialRadioButton
 *
 * @order 1
 * @restrict E
 *
 * @description
 * The `<material-radio-button>`directive is the child directive required to be used within `<material-radioo-group>` elements.
 *
 * While similar to the `<input type="radio" ng-model="" value="">` directive,
 * the `<material-radio-button>` directive provides material ink effects, ARIA support, and
 * supports use within named radio groups.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} ngChange Angular expression to be executed when input changes due to user
 *    interaction with the input element.
 * @param {string} ngValue Angular expression which sets the value to which the expression should
 *    be set when selected.*
 * @param {string} value The value to which the expression should be set when selected.
 * @param {string=} name Property name of the form under which the control is published.
 *
 * @usage
 * <hljs lang="html">
 *
 * <material-radio-button value="1">
 *   Label 1
 * </material-radio-button>
 *
 * <material-radio-button ng-model="color" ng-value="specialValue">
 *   Green
 * </material-radio-button>
 *
 * </hljs>
 *
 */
function materialRadioButtonDirective() {

  var CHECKED_CSS = 'material-checked';

  return {
    restrict: 'E',
    require: '^materialRadioGroup',
    transclude: true,
    template: '<div class="material-container">' +
                '<material-ripple start="center" class="circle"></material-ripple>' +
                '<div class="material-off"></div>' +
                '<div class="material-on"></div>' +
              '</div>' +
              '<div ng-transclude class="material-label" tab-index="0"></div>',
    link: link
  };

  function link(scope, element, attr, rgCtrl) {
    var lastChecked;

    rgCtrl.add(render);
    element.on('$destroy', function() {
      rgCtrl.remove(render);
    });

    element.on('click', listener);
    attr.$observe('value', render);

    function listener(ev) {
      if ( Util.isDisabled(element) ) return;

      scope.$apply(function() {
        rgCtrl.setViewValue(attr.value, ev && ev.type);
      });
    }

    function render() {
      var checked = (rgCtrl.getViewValue() === attr.value);
      if (checked === lastChecked) {
        return;
      }
      lastChecked = checked;
      element.attr('aria-checked', checked);
      if (checked) {
        element.addClass(CHECKED_CSS);
      } else {
        element.removeClass(CHECKED_CSS);
      }
    }
  }
}



/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
angular.module('material.components.sidenav', [
  'material.services.registry'
])
  .factory('$materialSidenav', [
    '$materialComponentRegistry',
    materialSidenavService
  ])
  .directive('materialSidenav', [
    '$timeout',
    materialSidenavDirective
  ])
  .controller('$materialSidenavController', [
    '$scope',
    '$element',
    '$attrs',
    '$timeout',
    '$materialSidenav',
    '$materialComponentRegistry',
    materialSidenavController
  ]);

/**
 * @private
 * @ngdoc object
 * @name materialSidenavController
 * @module material.components.sidenav
 *
 * @description
 * The controller for materialSidenav components.
 */
function materialSidenavController($scope, $element, $attrs, $timeout, $materialSidenav, $materialComponentRegistry) {

  var self = this;

  $materialComponentRegistry.register(this, $attrs.componentId);

  this.isOpen = function() {
    return !!$scope.isOpen;
  };

  /**
   * Toggle the side menu to open or close depending on its current state.
   */
  this.toggle = function() {
    $scope.isOpen = !$scope.isOpen;
  };

  /**
   * Open the side menu
   */
  this.open = function() {
    $scope.isOpen = true;
  };

  /**
   * Close the side menu
   */
  this.close = function() {
    $scope.isOpen = false;
  };
}

/**
 * @private
 * @ngdoc service
 * @name $materialSidenav
 * @module material.components.sidenav
 *
 * @description
 * $materialSidenav makes it easy to interact with multiple sidenavs
 * in an app.
 *
 * @usage
 *
 * ```javascript
 * // Toggle the given sidenav
 * $materialSidenav.toggle(componentId);
 * // Open the given sidenav
 * $materialSidenav.open(componentId);
 * // Close the given sidenav
 * $materialSidenav.close(componentId);
 * ```
 */
function materialSidenavService($materialComponentRegistry) {
  return function(handle) {
    var instance = $materialComponentRegistry.get(handle);
    if(!instance) {
      $materialComponentRegistry.notFoundError(handle);
    }

    return {
      isOpen: function() {
        if (!instance) { return; }
        return instance.isOpen();
      },
      /**
       * Toggle the given sidenav
       * @param handle the specific sidenav to toggle
       */
      toggle: function() {
        if(!instance) { return; }
        instance.toggle();
      },
      /**
       * Open the given sidenav
       * @param handle the specific sidenav to open
       */
      open: function(handle) {
        if(!instance) { return; }
        instance.open();
      },
      /**
       * Close the given sidenav
       * @param handle the specific sidenav to close
       */
      close: function(handle) {
        if(!instance) { return; }
        instance.close();
      }
    };
  };
}

/**
 * @ngdoc directive
 * @name materialSidenav
 * @module material.components.sidenav
 * @restrict E
 *
 * @description
 *
 * A Sidenav component that can be opened and closed programatically.
 *
 * When used properly with a layout, it will seamleslly stay open on medium
 * and larger screens, while being hidden by default on mobile devices.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="horizontal" ng-controller="MyController">
 *   <material-sidenav class="material-sidenav-left">
 *     Left Nav!
 *   </material-sidenav>
 *
 *   <material-content>
 *     Center Content
 *     <material-button ng-click="openLeftMenu()">
 *       Open Left Menu
 *     </material-button>
 *   </material-content>
 *
 *   <material-sidenav class="material-sidenav-right">
 *     Right Nav!
 *   </material-sidenav>
 * </div>
 * </hljs>
 *
 * <hljs lang="js">
 * var app = angular.module('myApp', ['ngMaterial']);
 * app.controller('MainController', function($scope, $materialSidenav) {
 *   $scope.openLeftMenu = function() {
 *     $materialSidenav('left').toggle();
 *   };
 * });
 * </hljs>
 */
function materialSidenavDirective($timeout) {
  return {
    restrict: 'E',
    scope: {},
    controller: '$materialSidenavController',
    link: function($scope, $element, $attr, sidenavCtrl) {
      var backdrop = angular.element('<material-backdrop class="material-sidenav-backdrop">');
      $scope.$watch('isOpen', openWatchAction);

      function openWatchAction(isOpen) {
        $element.toggleClass('open', !!isOpen);
        if (isOpen) {
          $element.parent().append(backdrop);
          backdrop.on('click', onBackdropClick);
        } else {
          backdrop.remove().off('click', onBackdropClick);
        }
      }
      function onBackdropClick() {
        $timeout(function() {
          sidenavCtrl.close();
        });
      }

    }
  };
}

/**
 * @ngdoc module
 * @name material.components.slider
 * @description Slider module!
 */
angular.module('material.components.slider', [])
  .directive('materialSlider', [
    '$window',
    materialSliderDirective
  ]);

/**
 * @ngdoc directive
 * @name materialSlider
 * @module material.components.slider
 * @restrict E
 *
 * @description
 * The `material-slider` directive creates a slider bar that you can use.
 *
 * Simply put a native `<input type="range">` element inside of a
 * `<material-slider>` container.
 *
 * On the range input, all HTML5 range attributes are supported.
 *
 * @usage
 * <hljs lang="html">
 * <material-slider>
 *   <input type="range" ng-model="slideValue" min="0" max="100">
 * </material-slider>
 * </hljs>
 */
function materialSliderDirective($window) {

  var MIN_VALUE_CSS = 'material-slider-min';
  var ACTIVE_CSS = 'material-active';

  function rangeSettings(rangeEle) {
    return {
      min: parseInt( rangeEle.min !== "" ? rangeEle.min : 0, 10 ),
      max: parseInt( rangeEle.max !== "" ? rangeEle.max : 100, 10 ),
      step: parseInt( rangeEle.step !== "" ? rangeEle.step : 1, 10 )
    };
  }

  return {
    restrict: 'E',
    scope: true,
    transclude: true,
    template: '<div class="material-track" ng-transclude></div>',
    link: link
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function link(scope, element, attr) {
    var input = element.find('input');
    var ngModelCtrl = angular.element(input).controller('ngModel');

    if(!input || !ngModelCtrl || input[0].type !== 'range') return;

    var rangeEle = input[0];
    var trackEle = angular.element( element[0].querySelector('.material-track') );

    trackEle.append('<div class="material-fill"><div class="material-thumb"></div></div>');
    var fillEle = trackEle[0].querySelector('.material-fill');

    if(input.attr('step')) {
      var settings = rangeSettings(rangeEle);
      var tickCount = (settings.max - settings.min) / settings.step;
      var tickMarkersEle = angular.element('<div class="material-tick-markers"></div>');
      for(var i=0; i<tickCount; i++) {
        tickMarkersEle.append('<div class="material-tick"></div>');
      }
      if (tickCount > 0) {
        tickMarkersEle.addClass('visible');
      }
      trackEle.append(tickMarkersEle);
    }

    input.on('mousedown touchstart', function(e){
      trackEle.addClass(ACTIVE_CSS);
    });

    input.on('mouseup touchend', function(e){
      trackEle.removeClass(ACTIVE_CSS);
    });


    function render() {
      var settings = rangeSettings(rangeEle);
      var adjustedValue = parseInt(ngModelCtrl.$viewValue, 10) - settings.min;
      var fillRatio = (adjustedValue / (settings.max - settings.min));

      fillEle.style.width = (fillRatio * 100) + '%';

      if(fillRatio <= 0) {
        element.addClass(MIN_VALUE_CSS);
      } else {
        element.removeClass(MIN_VALUE_CSS);
      }

    }

    scope.$watch( function () { return ngModelCtrl.$viewValue; }, render );

  }

}


/**
 * @ngdoc module
 * @name material.components.tabs
 * @description
 *
 * Tabs
 */
angular.module('material.components.tabs', [
  'material.animations',
  'material.services.attrBind',
  'material.services.registry'
])
  .controller('materialTabsController', [
    '$scope',
    '$attrs',
    '$materialComponentRegistry',
    '$timeout',
    TabsController
  ])
  .directive('materialTabs', [
    '$compile',
    '$timeout',
    '$materialEffects',
    '$window',
    TabsDirective
  ])
  .directive('materialTab', [
    '$attrBind',
    TabDirective
  ]);

/**
 * @ngdoc directive
 * @name materialTabs
 * @module material.components.tabs
 * @order 0
 *
 * @restrict E
 *
 * @description
 * The `<material-tabs>` directive serves as the container for 1..n `<material-tab>` child directives to produces a Tabs components.
 * In turn, the nested `<material-tab>` directive is used to specify a tab label for the **header button** and a [optional] tab view
 * content that will be associated with each tab button.
 *
 * Below is the markup for its simplest usage:
 *
 *  <hljs lang="html">
 *  <material-tabs>
 *    <material-tab label="Tab #1"></material-tab>
 *    <material-tab label="Tab #2"></material-tab>
 *    <material-tab label="Tab #3"></material-tab>
 *  <material-tabs>
 *  </hljs>
 *
 * Tabs supports three (3) usage scenarios:
 *
 *  1. Tabs (buttons only)
 *  2. Tabs with internal view content
 *  3. Tabs with external view content
 *
 * **Tab-only** support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views.
 * **Tabs with internal views** are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.
 * **Tabs with external view content** is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.
 *
 * > As a performance bonus, if the tab content is managed internally then the non-active (non-visible) tab contents are temporarily disconnected from the `$scope.$digest()` processes; which restricts and optimizes DOM updates to only the currently active tab.
 *
 * Additional features also include:
 *
 * *  Content can include any markup.
 * *  If a tab is disabled while active/selected, then the next tab will be auto-selected.
 * *  If the currently active tab is the last tab, then next() action will select the first tab.
 * *  Any markup (other than **`<material-tab>`** tags) will be transcluded into the tab header area BEFORE the tab buttons.
 *
 * @param {integer=} selected Index of the active/selected tab
 * @param {boolean=} noink Flag indicates use of ripple ink effects
 * @param {boolean=} nobar Flag indicates use of ink bar effects
 * @param {boolean=} nostretch Flag indicates use of elastic animation for inkBar width and position changes
 * @param {string=}  align-tabs Attribute to indicate position of tab buttons: bottom or top; default is `top`
 *
 * @usage
 * <hljs lang="html">
 * <material-tabs selected="selectedIndex" >
 *   <img ng-src="/img/angular.png" class="centered">
 *
 *   <material-tab
 *      ng-repeat="tab in tabs | orderBy:predicate:reversed"
 *      on-select="onTabSelected(tab)"
 *      on-deselect="announceDeselected(tab)"
 *      disabled="tab.disabled" >
 *
 *       <material-tab-label>
 *           {{tab.title}}
 *           <img src="/img/removeTab.png"
 *                ng-click="removeTab(tab)"
 *                class="delete" >
 *       </material-tab-label>
 *
 *       {{tab.content}}
 *
 *   </material-tab>
 *
 * </material-tabs>
 * </hljs>
 *
 */
function TabsDirective($compile, $timeout, $materialEffects, $window) {

  return {
    restrict: 'E',
    replace: false,
    transclude: 'true',

    scope: {
      $selIndex: '=?selected'
    },

    compile: compileTabsFn,
    controller: [ '$scope', '$attrs', '$materialComponentRegistry', '$timeout', TabsController ],

    template:
      '<div class="tabs-header">' +
      '  <div class="tabs-header-items"></div>' +
      '  <material-ink-bar></material-ink-bar>' +
      '</div>'+
      '<div class="tabs-content ng-hide"></div>'

  };

  /**
   * Use prelink to configure inherited scope attributes: noink, nobar, and nostretch;
   * do this before the child elements are linked.
   *
   * @param element
   * @param attr
   * @returns {{pre: materialTabsLink}}
   */
  function compileTabsFn() {

    return {
      pre: function tabsPreLink(scope, element, attrs, tabsController) {

        // These attributes do not have values; but their presence defaults to value == true.
        scope.noink = angular.isDefined(attrs.noink);
        scope.nobar = angular.isDefined(attrs.nobar);
        scope.nostretch = angular.isDefined(attrs.nostretch);

        // Publish for access by nested `<material-tab>` elements
        tabsController.noink = scope.noink;

        // Watch for external changes `selected` & auto-select the specified tab
        // Stop watching when the <material-tabs> directive is released
        scope.$on("$destroy", scope.$watch('$selIndex', function (index) {
          tabsController.selectAt(index);
        }));

        // Remove the `inkBar` element if `nobar` is defined
        var elBar = findNode("material-ink-bar",element);
        if ( elBar && scope.nobar ) {
          elBar.remove();
        }

      },
      post: function tabsPostLink(scope, element, attrs, tabsController, $transclude) {
        var  cache = {
          length: 0,
          contains: function (tab) {
            return !angular.isUndefined(cache[tab.$id]);
          }
        };

        transcludeHeaderItems();
        transcludeContentItems();

        configureInk();

        alignTabButtons();
        selectDefaultTab();

        // **********************************************************
        // Private Methods
        // **********************************************************

        /**
         * Conditionally configure ink bar animations when the
         * tab selection changes. If `nobar` then do not show the
         * bar nor animate.
         */
        function configureInk() {
          if ( scope.nobar ) return;

          // Single inkBar is used for all tabs
          var inkBar = findNode("material-ink-bar", element);

          // Wait until ther next event loop to run updateInkBar, to be sure
          // that all of the tabs have been added/removed.
          function updateInkNextFrame() {
            clearTimeout(updateInkNextFrame.timeout);
            updateInkNextFrame.timeout = setTimeout(updateInkBar, 0);
          }

          // On resize or tabChange
          tabsController.onTabChange = updateInkNextFrame;

          angular.element($window).on('resize', function() {
            updateInkBar(true);
          });

          // Immediately place the ink bar
          updateInkBar(true);

          /**
           * Update the position and size of the ink bar based on the
           * specified tab DOM element
           * @param tab
           * @param skipAnimation
           */
          function updateInkBar(skipAnimation) {
            var tabElement = tabsController.selectedElement();

            if ( angular.isDefined(tabElement) && angular.isDefined(inkBar) ) {

              var tabNode = tabElement[0];
              var width = tabNode.offsetWidth;
              var styles = {
                display : width > 0 ? 'block' : 'none',
                width: width + 'px'
              };
              styles[$materialEffects.TRANSFORM_PROPERTY] =
                'translate3d(' + tabNode.offsetLeft + 'px,0,0)';

              inkBar.toggleClass('animate', !skipAnimation).css(styles);
            }

          }
        }

        /**
         * Change the positioning of the tab header and buttons.
         * If the tabs-align attribute is 'bottom', then the tabs-content
         * container is transposed with the tabs-header
         */
        function alignTabButtons() {
          var align  = attrs.tabsAlign || "top";
          var container = findNode('.tabs-content', element);

          if ( align == "bottom") {
            element.prepend(container);
          }
        }

        /**
         * If an initial tab selection has not been specified, then
         * select the first tab by default
         */
        function selectDefaultTab() {
          var tabs = tabsController.$$tabs();

          if ( tabs.length && angular.isUndefined(scope.$selIndex)) {
            tabsController.select(tabs[0]);
          }
        }


        /**
         * Transclude the materialTab items into the tabsHeaderItems container
         *
         */
        function transcludeHeaderItems() {
          $transclude(function (content) {
            var header = findNode('.tabs-header-items', element);
            var parent = angular.element(element[0]);

            angular.forEach(content, function (node) {
              var intoHeader = isNodeType(node, 'material-tab') || isNgRepeat(node);

              if (intoHeader) {
                header.append(node);
              }
              else {
                parent.prepend(node);
              }
            });
          });
        }


        /**
         * Transclude the materialTab view/body contents into materialView containers; which
         * are stored in the tabsContent area...
         */
        function transcludeContentItems() {
          var cntr = findNode('.tabs-content', element),
              materialViewTmpl = '<div class="material-view" ng-show="active"></div>';

          scope.$watch(getTabsHash, function buildContentItems() {
            var tabs = tabsController.$$tabs(notInCache),
              views = tabs.map(extractContent);

            // At least 1 tab must have valid content to build; otherwise
            // we hide/remove the tabs-content container...

            if (views.some(notEmpty)) {
              angular.forEach(views, function (content, j) {

                var tab = tabs[j++],
                  materialView = $compile(materialViewTmpl)(tab);

                // Allow dynamic $digest() disconnect/reconnect of tab content's scope

                enableDisconnect(tab, content.scope);

                // Do we have content DOM nodes ?
                // If transcluded content is not undefined then add all nodes to the materialView

                if (content.nodes) {
                  angular.forEach(content.nodes, function (node) {
                    if ( !isNodeEmpty(node) ) {
                      materialView.append(node);
                    }
                  });
                }

                cntr.append(materialView);
                addToCache(cache, { tab:tab, element: materialView });

              });

              // We have some new content just added...
              showTabContent();

            } else {

              showTabContent(false);

            }


            /**
             * Add class to hide or show the container for the materialView(s)
             * NOTE: the `<div.tabs-content>` is **hidden** by default.
             * @param visible Boolean a value `true` will remove the `class="ng-hide"` setting
             */
            function showTabContent(visible) {
              cntr.toggleClass('ng-hide', !!visible);
            }

          });

          /**
           * Allow tabs to disconnect or reconnect their content from the $digest() processes
           * when unselected or selected (respectively).
           *
           * @param content Special content scope which is a direct child of a `tab` scope
           */
          function enableDisconnect(tab,  content) {
            if ( !content ) return;

            var selectedFn = angular.bind(tab, tab.selected),
                deselectedFn = angular.bind(tab, tab.deselected);

            addDigestConnector(content);

            // 1) Tail-hook deselected()
            tab.deselected = function() {
              deselectedFn();
              tab.$$postDigest(function(){
                content.$disconnect();
              });
            };

             // 2) Head-hook selected()
            tab.selected = function() {
              content.$reconnect();
              selectedFn();
            };

            // Immediate disconnect all non-actives
            if ( !tab.active ) {
              tab.$$postDigest(function(){
                content.$disconnect();
              });
            }
          }

          /**
           * Add tab scope/DOM node to the cache and configure
           * to auto-remove when the scope is destroyed.
           * @param cache
           * @param item
           */
          function addToCache(cache, item) {
            var scope = item.tab;

            cache[ scope.$id ] = item;
            cache.length = cache.length + 1;

            // When the tab is removed, remove its associated material-view Node...
            scope.$on("$destroy", function () {
              angular.element(item.element).remove();

              delete cache[ scope.$id];
              cache.length = cache.length - 1;
            });
          }

          function getTabsHash() {
            return tabsController.$$hash;
          }

          /**
           * Special function to extract transient data regarding transcluded
           * tab content. Data includes dynamic lookup of bound scope for the transcluded content.
           *
           * @see TabDirective::updateTabContent()
           *
           * @param tab
           * @returns {{nodes: *, scope: *}}
           */
          function extractContent(tab) {
            var content = hasContent(tab) ? tab.content : undefined;
            var scope   = (content && content.length) ? angular.element(content[0]).scope() : null;

            // release immediately...
            delete tab.content;

            return { nodes:content, scope:scope };
          }

          function hasContent(tab) {
            return tab.content && tab.content.length;
          }

          function notEmpty(view) {
            var hasContent = false;
            if (angular.isDefined(view.nodes)) {
              angular.forEach(view.nodes, function(node) {
                hasContent = hasContent || !isNodeEmpty(node);
              });
            }
            return hasContent;
          }

          function notInCache(tab) {
            return !cache.contains(tab);
          }
        }

      }
    };

    function findNode(selector, element) {
      var container = element[0];
      return angular.element(container.querySelector(selector));
    }

  }

}

/**
 * @ngdoc directive
 * @name materialTab
 * @module material.components.tabs
 * @order 1
 *
 * @restrict E
 *
 * @description
 * `<material-tab>` is the nested directive used [within `<material-tabs>`] to specify each tab with a **label** and optional *view content*
 *
 * If the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more
 * complex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested
 * markup of the `<material-tab>` is used as the tab header markup.
 *
 * If a tab **label** has been identified, then any **non-**`<material-tab-label>` markup
 * will be considered tab content and will be transcluded to the internal `<div class="tabs-content">` container.
 *
 * This container is used by the TabsController to show/hide the active tab's content view. This synchronization is
 * automatically managed by the internal TabsController whenever the tab selection changes. Selection changes can
 * be initiated via data binding changes, programmatic invocation, or user gestures.
 *
 * @param {string=} label Optional attribute to specify a simple string as the tab label
 * @param {boolean=} active Flag indicates if the tab is currently selected; normally the `<material-tabs selected="">`; attribute is used instead.
 * @param {boolean=} ngDisabled Flag indicates if the tab is disabled: not selectable with no ink effects
 * @param {expression=} deselected Expression to be evaluated after the tab has been de-selected.
 * @param {expression=} selected Expression to be evaluated after the tab has been selected.
 *
 *
 * @usage
 *
 * <hljs lang="html">
 * <material-tab label="" disabled="" selected="" deselected="" >
 *   <h3>My Tab content</h3>
 * </material-tab>
 *
 * <material-tab >
 *   <material-tab-label>
 *     <h3>My Tab content</h3>
 *   </material-tab-label>
 *   <p>
 *     Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
 *     totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
 *     dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
 *     sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
 *   </p>
 * </material-tab>
 * </hljs>
 *
 */
function TabDirective( $attrBind ) {
  var noop = angular.noop;

  return {
    restrict: 'E',
    replace: false,
    require: "^materialTabs",
    transclude: 'true',
    scope: true,
    link: linkTab,
    template:
      '<material-ripple initial-opacity="0.9" opacity-decay-velocity="0.89"> </material-ripple> ' +
      '<material-tab-label ' +
        'ng-class="{ disabled : disabled, active : active }"  >' +
      '</material-tab-label>'

  };

  function linkTab(scope, element, attrs, tabsController, $transclude) {
    var defaults = { active: false, disabled: false, deselected: noop, selected: noop };

    // Since using scope=true for inherited new scope,
    // then manually scan element attributes for forced local mappings...

    $attrBind(scope, attrs, {
      label: '@?',
      active: '=?',
      disabled: '=?ngDisabled',
      deselected: '&onDeselect',
      selected: '&onSelect'
    }, defaults);

    configureWatchers();
    updateTabContent(scope);

    // Click support for entire <material-tab /> element
    element.on('click', function onRequestSelect() {
      if (!scope.disabled) {
        scope.$apply(function () {
          tabsController.select(scope);
        });
      }
    });

    tabsController.add(scope, element);

    // **********************************************************
    // Private Methods
    // **********************************************************

    /**
     * Auto select the next tab if the current tab is active and
     * has been disabled.
     */
    function configureWatchers() {
      var unwatch = scope.$watch('disabled', function (isDisabled) {
        if (scope.active && isDisabled) {
          tabsController.next(scope);
        }
      });

      scope.$on("$destroy", function () {
        unwatch();
        tabsController.remove(scope);
      });
    }

    /**
     * Transpose the optional `label` attribute value or materialTabHeader or `content` body
     * into the body of the materialTabButton... all other content is saved in scope.content
     * and used by TabsController to inject into the `tabs-content` container.
     */
    function updateTabContent(scope) {
      var tab = scope;

      // Check to override label attribute with the content of the <material-tab-header> node,
      // If a materialTabHeader is not specified, then the node will be considered
      // a <material-view> content element...
      $transclude(function ( contents ) {

        // Transient references...
        tab.content = [ ];

        angular.forEach(contents, function (node) {

          if (!isNodeEmpty(node)) {
            if (isNodeType(node, 'material-tab-label')) {
              // Simulate use of `label` attribute

              tab.label = node.childNodes;

            } else {
              // Transient references...
              //
              // Attach to scope for future transclusion into materialView(s)
              // We need the bound scope for the content elements; which is NOT
              // the scope of tab or material-view container...

              tab.content.push(node);
            }
          }
        });

      });

      // Prepare to assign the materialTabButton content
      // Use the label attribute or fallback to TabHeader content

      var cntr = angular.element(element[0].querySelector('material-tab-label'));

      if (angular.isDefined(scope.label)) {
        // The `label` attribute is the default source

        cntr.append(scope.label);

        delete scope.label;

      } else {

        // NOTE: If not specified, all markup and content is assumed
        // to be used for the tab label.

        angular.forEach(scope.content, function (node) {
          cntr.append(node);
        });

        delete scope.content;
      }
    }

  }
}

/**
 * @ngdoc object
 * @name materialTabsController
 * @module material.components.tabs
 * @description Controller used within `<material-tabs>` to manage tab selection and iteration
 *
 * @private
 */
function TabsController($scope, $attrs, $materialComponentRegistry, $timeout ) {
  var list = iterator([], true),
    componentID = "tabs" + $scope.$id,
    elements = { },
    selected = null,
    self = this;

  $materialComponentRegistry.register( self, $attrs.componentId || componentID );

  // Methods used by <material-tab> and children

  this.add = addTab;
  this.remove = removeTab;
  this.select = selectTab;
  this.selectAt = selectTabAt;
  this.next = selectNext;
  this.previous = selectPrevious;

  // Property for child access
  this.noink = !!$scope.noink;
  this.nobar = !!$scope.nobar;
  this.scope = $scope;

  // Special internal accessor to access scopes and tab `content`
  // Used by TabsDirective::buildContentItems()

  this.$$tabs = findTabs;
  this.$$hash = "";

  // used within the link-Phase of materialTabs
  this.onTabChange = angular.noop;
  this.selectedElement = function() {
    return findElementFor( selected );
  };

  /**
   * Find the DOM element associated with the tab/scope
   * @param tab
   * @returns {*}
   */
  function findElementFor(tab) {
    if ( angular.isUndefined(tab) ) {
      tab = selected;
    }
    return tab ? elements[ tab.$id ] : undefined;
  }

  /**
   * Publish array of tab scope items
   * NOTE: Tabs are not required to have `contents` and the
   *       node may be undefined.
   * @returns {*} Array
   */
  function findTabs(filterBy) {
    return list.items().filter(filterBy || angular.identity);
  }

  /**
   * Create unique hashKey representing all available
   * tabs.
   */
  function updateHash() {
    self.$$hash = list.items()
      .map(function (it) {
        return it.$id;
      })
      .join(',');
  }

  /**
   * Select specified tab; deselect all others (if any selected)
   * @param tab
   */
  function selectTab(tab) {
    if ( tab == selected ) return;

    var activate = makeActivator(true),
      deactivate = makeActivator(false);

    // Turn off all tabs (if current active)
    angular.forEach(list.items(), deactivate);

    // Activate the specified tab (or next available)
    selected = activate(tab.disabled ? list.next(tab) : tab);

    // update external models and trigger databinding watchers
    $scope.$selIndex = String(selected.$index || list.indexOf(selected));

    // update the tabs ink to indicate the selected tab
    self.onTabChange();

    return selected;
  }

  /**
   * Select tab based on its index position
   * @param index
   */
  function selectTabAt(index) {
    if (list.inRange(index)) {
      var matches = list.findBy("$index", index),
        it = matches ? matches[0] : null;

      if (it != selected) {
        selectTab(it);
      }
    }
  }

  /**
   * Add tab to list and auto-select; default adds item to end of list
   * @param tab
   */
  function addTab(tab, element) {

    if (angular.isUndefined(tab.$index)) {
      tab.$index = list.count();
    }

    // cache materialTab DOM element; these are not materialView elements
    elements[ tab.$id ] = element;

    if (!list.contains(tab)) {
      var pos = list.add(tab, tab.$index);

      // Should we auto-select it?
      if ($scope.$selIndex == pos || tab.active) {
        selectTab(tab);
      } else {
        self.onTabChange();
      }
    }


    updateHash();

    return tab.$index;
  }

  /**
   * Remove the specified tab from the list
   * Auto select the next tab or the previous tab (if last)
   * @param tab
   */
  function removeTab(tab) {
    if (list.contains(tab)) {

      selectTab( list.next(tab, isEnabled) );
      list.remove(tab);

      self.onTabChange();
      // another tab was removed, make sure to update ink bar
      $timeout(function(){
        delete elements[tab.$id];
      },300);

    }

    updateHash();
  }

  /**
   * Select the next tab in the list
   * @returns {*} Tab
   */
  function selectNext() {
    return selectTab(list.next(selected, isEnabled));
  }

  /**
   * Select the previous tab
   * @returns {*} Tab
   */
  function selectPrevious() {
    return selectTab(list.previous(selected, isEnabled));
  }

  /**
   * Validation criteria for list iterator when List::next() or List::previous() is used..:
   * In this case, the list iterator should skip items that are disabled.
   * @param tab
   * @returns {boolean}
   */
  function isEnabled(tab) {
    return tab && !tab.disabled;
  }

  /**
   * Partial application to build function that will
   * mark the specified tab as active or not. This also
   * allows the `updateStatus` function to be used as an iterator.
   *
   * @param active
   */
  function makeActivator(active) {

    return function updateState(tab) {
      if (tab && (active != tab.active)) {
        tab.active = active;

        if (active) {
          selected = tab;

          tab.selected();

        } else {
          if (selected == tab) {
            selected = null;
          }

          tab.deselected();

        }
        return tab;
      }
      return null;
    };
  }

}

/**
 * Determine if the DOM element is of a certain tag type
 * or has the specified attribute type
 *
 * @param node
 * @returns {*|boolean}
 */
var isNodeType = function (node, type) {
  return node.tagName && (
    node.hasAttribute(type) ||
    node.hasAttribute('data-' + type) ||
    node.tagName.toLowerCase() === type ||
    node.tagName.toLowerCase() === 'data-' + type
  );
};

var isNgRepeat = function (node) {
  var COMMENT_NODE = 8;
  return node.nodeType == COMMENT_NODE && node.nodeValue.indexOf('ngRepeat') > -1;
};

/**
 * Is the an empty text string
 * @param node
 * @returns {boolean}
 */
var isNodeEmpty = function (node) {
  var TEXT_NODE = 3,
      COMMENT_NODE = 8;
  return (node.nodeType == COMMENT_NODE) ||
    (node.nodeType == TEXT_NODE && !(node.nodeValue || '').trim());
};


/*
 *  This function() provides scope-relative features to disconnect and reconnect to the $digest() processes
 *  NOTE: this is essentially a reversible $destroy() for scopes.
 *
 *  Detaching the scope would mean:
 *
 *    Detaching the scope from the scope's current parent so that watchers no
 *    longer fire when the scope's current parent's $digest is called
 *
 *  On re-attaching to a DOM element (as a child):
 *
 *    It would be attached as he child scope of the DOM element. This is useful
 *    for optimizations such as not running watchers on hidden DOM (that could be detached).
 *
 *  @see https://github.com/angular/angular.js/issues/5301
 *
 */
function addDigestConnector (scope) {
  var disconnect = function () {
    if (this.$root === this) {
      return; // we can't disconnect the root node;
    }
    var parent = this.$parent;
    this.$$disconnected = true;
    // See Scope.$destroy
    if (parent.$$childHead === this) {
      parent.$$childHead = this.$$nextSibling;
    }
    if (parent.$$childTail === this) {
      parent.$$childTail = this.$$prevSibling;
    }
    if (this.$$prevSibling) {
      this.$$prevSibling.$$nextSibling = this.$$nextSibling;
    }
    if (this.$$nextSibling) {
      this.$$nextSibling.$$prevSibling = this.$$prevSibling;
    }
    this.$$nextSibling = this.$$prevSibling = null;
  };
  var reconnect = function () {
    if (this.$root === this) {
      return; // we can't disconnect the root node;
    }
    var child = this;
    if (!child.$$disconnected) {
      return;
    }
    var parent = child.$parent;
    child.$$disconnected = false;
    // See Scope.$new for this logic...
    child.$$prevSibling = parent.$$childTail;
    if (parent.$$childHead) {
      parent.$$childTail.$$nextSibling = child;
      parent.$$childTail = child;
    } else {
      parent.$$childHead = parent.$$childTail = child;
    }
  };

  scope.$disconnect = angular.bind( scope, disconnect );
  scope.$reconnect  = angular.bind( scope, reconnect );

  return scope;
}

/*
 * iterator is a list facade to easily support iteration and accessors
 *
 * @param items Array list which this iterator will enumerate
 * @param reloop Boolean enables iterator to consider the list as an endless reloop
 */
function iterator(items, reloop) {

    reloop = !!reloop;

    var _items = items || [ ];

    // Published API

    return {

      items: getItems,
      count: count,

      hasNext: hasNext,
      inRange: inRange,
      contains: contains,
      indexOf: indexOf,
      itemAt: itemAt,
      findBy: findBy,

      add: add,
      remove: remove,

      first: first,
      last: last,
      next: next,
      previous: previous

    };

    /*
     * Publish copy of the enumerable set
     * @returns {Array|*}
     */
    function getItems() {
      return [].concat(_items);
    }

    /*
     * Determine length of the list
     * @returns {Array.length|*|number}
     */
    function count() {
      return _items.length;
    }

    /*
     * Is the index specified valid
     * @param index
     * @returns {Array.length|*|number|boolean}
     */
    function inRange(index) {
      return _items.length && ( index > -1 ) && (index < _items.length );
    }

    /*
     * Can the iterator proceed to the next item in the list; relative to
     * the specified item.
     *
     * @param tab
     * @returns {Array.length|*|number|boolean}
     */
    function hasNext(tab) {
      return tab ? inRange(indexOf(tab) + 1) : false;
    }

    /*
     * Get item at specified index/position
     * @param index
     * @returns {*}
     */
    function itemAt(index) {
      return inRange(index) ? _items[index] : null;
    }

    /*
     * Find all elements matching the key/value pair
     * otherwise return null
     *
     * @param val
     * @param key
     *
     * @return array
     */
    function findBy(key, val) {

      /*
       * Implement of e6 Array::find()
       * @param list
       * @param callback
       * @returns {*}
       */
      function find(list, callback) {
        var results = [ ];

        angular.forEach(list, function (it, index) {
          var val = callback.apply(null, [it, index, list]);
          if (val) {
            results.push(val);
          }
        });

        return results.length ? results : undefined;
      }

      // Use iterator callback to matches element key value
      // NOTE: searches full prototype chain

      return find(_items, function (el) {
        return ( el[key] == val ) ? el : null;
      });

    }

    /*
     * Add item to list
     * @param it
     * @param index
     * @returns {*}
     */
    function add(it, index) {
      if (!angular.isDefined(index)) {
        index = _items.length;
      }

      _items.splice(index, 0, it);

      return indexOf(it);
    }

    /*
     * Remove it from list...
     * @param it
     */
    function remove(it) {
      _items.splice(indexOf(it), 1);
    }

    /*
     * Get the zero-based index of the target tab
     * @param it
     * @returns {*}
     */
    function indexOf(it) {
      return _items.indexOf(it);
    }

    /*
     * Boolean existence check
     * @param it
     * @returns {boolean}
     */
    function contains(it) {
      return it && (indexOf(it) > -1);
    }

    /*
     * Find the next item
     * @param tab
     * @returns {*}
     */
    function next(it, validate) {

      if (contains(it)) {
        var index = indexOf(it) + 1,
          found = inRange(index) ? _items[ index ] :
            reloop ? first() : null,
          skip = found && validate && !validate(found);

        return skip ? next(found) : found;
      }

      return null;
    }

    /*
     * Find the previous item
     * @param tab
     * @returns {*}
     */
    function previous(it, validate) {

      if (contains(it)) {
        var index = indexOf(it) - 1,
          found = inRange(index) ? _items[ index ] :
            reloop ? last() : null,
          skip = found && validate && !validate(found);

        return skip ? previous(found) : found;
      }

      return null;
    }

    /*
     * Return first item in the list
     * @returns {*}
     */
    function first() {
      return _items.length ? _items[0] : null;
    }

    /*
     * Return last item in the list...
     * @returns {*}
     */
    function last() {
      return _items.length ? _items[_items.length - 1] : null;
    }

}




/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */
angular.module('material.components.toast', ['material.services.compiler'])
  .directive('materialToast', [
    QpToastDirective
  ])
  .factory('$materialToast', [
    '$timeout',
    '$rootScope',
    '$materialCompiler',
    '$rootElement',
    '$animate',
    QpToastService
  ]);

function QpToastDirective() {
  return {
    restrict: 'E'
  };
}

/**
 * @ngdoc service
 * @name $materialToast
 * @module material.components.toast
 *
 * @description
 * Open a toast notification on any position on the screen, with an optional
 * duration.
 *
 * Only one toast notification may ever be active at any time. If a new toast is
 * shown while a different toast is active, the old toast will be automatically
 * hidden.
 *
 * `$materialToast` takes one argument, options, which is defined below.
 *
 * @usage
 * <hljs lang="html">
 * <div ng-controller="MyController">
 *   <material-button ng-click="openToast()">
 *     Open a Toast!
 *   </material-button>
 * </div>
 * </hljs>
 * <hljs lang="js">
 * var app = angular.module('app', ['ngMaterial']);
 * app.controller('MyController', function($scope, $materialToast) {
 *   $scope.openToast = function($event) {
 *     var hideToast = $materialToast({
 *       template: '<material-toast>Hello!</material-toast>',
 *       duration: 3000
 *     });
 *   };
 * });
 * </hljs>
 *
 * @returns {function} `hideToast` - A function that hides the toast.
 *
 * @paramType Options
 * @param {string=} templateUrl The url of an html template file that will
 * be used as the content of the toast. Restrictions: the template must
 * have an outer `material-toast` element.
 * @param {string=} template Same as templateUrl, except this is an actual
 * template string.
 * @param {number=} duration How many milliseconds the toast should stay
 * active before automatically closing.  Set to 0 to disable duration.
 * Default: 3000.
 * @param {string=} position Where to place the toast. Available: any combination
 * of 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.
 * @param {string=} controller The controller to associate with this toast.
 * The controller will be injected the local `$hideToast`, which is a function
 * used to hide the toast.
 * @param {string=} locals An object containing key/value pairs. The keys will
 * be used as names of values to inject into the controller. For example,
 * `locals: {three: 3}` would inject `three` into the controller with the value
 * of 3.
 * @param {object=} resolve Similar to locals, except it takes promises as values
 * and the toast will not open until the promises resolve.
 * @param {string=} controllerAs An alias to assign the controller to on the scope.
 */
function QpToastService($timeout, $rootScope, $materialCompiler, $rootElement, $animate) {
  var recentToast;

  return showToast;

  /**
   * TODO fully document this
   * Supports all options from $materialPopup, in addition to `duration` and `position`
   */
  function showToast(options) {
    options = angular.extend({
      // How long to keep the toast up, milliseconds
      duration: 3000,
      // [unimplemented] Whether to disable swiping
      swipeDisabled: false,
      // Supports any combination of these class names: 'bottom top left right fit'.
      // Default: 'bottom left'
      position: 'bottom left',
    }, options || {});

    recentToast && recentToast.then(function(destroy) { destroy(); });

    recentToast = $materialCompiler.compile(options).then(function(compileData) {
      // Controller will be passed a `$hideToast` function
      compileData.locals.$hideToast = destroy;

      var scope = $rootScope.$new();
      var element = compileData.link(scope);
      element.addClass(options.position);

      var delayTimeout;
      $animate.enter(element, $rootElement, null, function() {
        if (options.duration) {
          delayTimeout = $timeout(destroy, options.duration);
        }
      });

      return destroy;

      function destroy() {
        $timeout.cancel(delayTimeout);
        $animate.leave(element, function() {
          scope.$destroy();
        });
      }
    });

    return recentToast;
  }
}

/**
 * @ngdoc module
 * @name material.components.toolbar
 */
angular.module('material.components.toolbar', [
  'material.components.content'
])
  .directive('materialToolbar', [
    '$$rAF',
    '$sniffer',
    materialToolbarDirective
  ]);

/**
 * @ngdoc directive
 * @name materialToolbar
 * @restrict E
 * @description
 * `material-toolbar` is used to place a toolbar in your app.
 *
 * Toolbars are usually used above a content area to display the title of the
 * current page, and show relevant action buttons for that page.
 *
 * You can change the height of the toolbar by adding either the
 * `material-medium-tall` or `material-tall` class to the toolbar.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="vertical" layout-fill>
 *   <material-toolbar>
 *
 *     <div class="material-toolbar-tools">
 *       <span>My App's Title</span>
 *
 *       <!-- fill up the space between left and right area -->
 *       <span flex></span>
 *
 *       <material-button>
 *         Right Bar Button
 *       </material-button>
 *     </div>
 *
 *   </material-toolbar>
 *   <material-content>
 *     Hello!
 *   </material-content>
 * </div>
 * </hljs>
 *
 * @param {boolean=} scrollShrink Whether the header should shrink away as
 * the user scrolls down, and reveal itself as the user scrolls up.
 *
 * Note: for scrollShrink to work, the toolbar must be a sibling of a
 * `material-content` element, placed before it. See the scroll shrink demo.
 */
function materialToolbarDirective($$rAF, $sniffer) {
  var isWebkit = $sniffer.vendorPrefix.toLowerCase().indexOf('webkit') !==- 1;
  var TRANSFORM_PROPERTY = isWebkit ? 'webkitTransform' : 'transform';

  return {
    restrict: 'E',
    controller: angular.noop,
    link: function(scope, element, attr) {

      if (angular.isDefined(attr.scrollShrink)) {
        setupScrollShrink();
      }

      function setupScrollShrink() {
        //makes it take X times as long for header to dissapear
        var HEIGHT_FACTOR = 2;
        var height = element.prop('offsetHeight') * HEIGHT_FACTOR;
        // Current "y" position of scroll
        var y = 0;
        // Store the last scroll top position
        var prevScrollTop = 0;

        // Wait for $materialContentLoaded event from materialContent directive
        // If the materialContent element is a sibling of our toolbar, hook it up
        // to scroll events.
        scope.$on('$materialContentLoaded', onMaterialContentLoad);

        var contentElement;
        function onMaterialContentLoad($event, contentEl) {
          if (Util.elementIsSibling(element, contentEl)) {
            // unhook old content event listener if exists
            contentElement && contentElement.off('scroll', onScroll);
            contentEl.on('scroll', onContentScroll).css('position','relative');
            contentElement = contentEl;
          }
        }

        function onContentScroll(e) {
          shrink(e.target.scrollTop);
          prevScrollTop = e.target.scrollTop;
        }

        // Shrink the given target element based on the scrolling
        // of the scroller element.
        function shrink(scrollTop) {
          y = Math.min(height, Math.max(0, y + scrollTop - prevScrollTop));
          // If we are scrolling back "up", show the header condensed again
          // if (prevScrollTop > scrollTop && scrollTop > margin) {
          //   y = Math.max(y, margin);
          // }
          $$rAF(transform);
        }

        function transform() {
          var translate = 'translate3d(0,' + (-y / HEIGHT_FACTOR) + 'px, 0)';
          element.css(TRANSFORM_PROPERTY, translate);
          contentElement.css('margin-top', (-y / HEIGHT_FACTOR) + 'px');
        }
      }

    }
  };

}

angular.module('material.components.whiteframe', []);

angular.module('material.services.attrBind', [
])
  .factory('$attrBind', [
    '$parse',
    '$interpolate',
    MaterialAttrBind
  ]);

/**
 *  This service allows directives to easily databind attributes to private scope properties.
 *
 * @private
 */
function MaterialAttrBind($parse, $interpolate) {
  var LOCAL_REGEXP = /^\s*([@=&])(\??)\s*(\w*)\s*$/;

  return function (scope, attrs, bindDefinition, bindDefaults) {
    angular.forEach(bindDefinition || {}, function (definition, scopeName) {
      //Adapted from angular.js $compile
      var match = definition.match(LOCAL_REGEXP) || [],
        attrName = match[3] || scopeName,
        mode = match[1], // @, =, or &
        parentGet,
        unWatchFn;

      switch (mode) {
        case '@':   // One-way binding from attribute into scope

          attrs.$observe(attrName, function (value) {
            scope[scopeName] = value;
          });
          attrs.$$observers[attrName].$$scope = scope;

          if (!bypassWithDefaults(attrName, scopeName)) {
            // we trigger an interpolation to ensure
            // the value is there for use immediately
            scope[scopeName] = $interpolate(attrs[attrName])(scope);
          }
          break;

        case '=':   // Two-way binding...

          if (!bypassWithDefaults(attrName, scopeName)) {
            // Immediate evaluation
            scope[scopeName] = (attrs[attrName] === "") ? true : scope.$eval(attrs[attrName]);

            // Data-bind attribute to scope (incoming) and
            // auto-release watcher when scope is destroyed

            unWatchFn = scope.$watch(attrs[attrName], function (value) {
              scope[scopeName] = value;
            });
            scope.$on('$destroy', unWatchFn);
          }

          break;

        case '&':   // execute an attribute-defined expression in the context of the parent scope

          if (!bypassWithDefaults(attrName, scopeName, angular.noop)) {
            /* jshint -W044 */
            if (attrs[attrName] && attrs[attrName].match(RegExp(scopeName + '\(.*?\)'))) {
              throw new Error('& expression binding "' + scopeName + '" looks like it will recursively call "' +
                attrs[attrName] + '" and cause a stack overflow! Please choose a different scopeName.');
            }

            parentGet = $parse(attrs[attrName]);
            scope[scopeName] = function (locals) {
              return parentGet(scope, locals);
            };
          }

          break;
      }
    });

    /**
     * Optional fallback value if attribute is not specified on element
     * @param scopeName
     */
    function bypassWithDefaults(attrName, scopeName, defaultVal) {
      if (!angular.isDefined(attrs[attrName])) {
        var hasDefault = bindDefaults && bindDefaults.hasOwnProperty(scopeName);
        scope[scopeName] = hasDefault ? bindDefaults[scopeName] : defaultVal;
        return true;
      }
      return false;
    }

  };
}

angular.module('material.services.compiler', [
])
  .service('$materialCompiler', [
    '$q',
    '$http',
    '$injector',
    '$compile',
    '$controller',
    '$templateCache',
    materialCompilerService
  ]);

function materialCompilerService($q, $http, $injector, $compile, $controller, $templateCache) {

  /**
   * @ngdoc service
   * @name $materialCompiler
   * @module material.services.compiler
   *
   * @description
   * The $materialCompiler service is an abstraction of angular's compiler, that allows the developer
   * to easily compile an element with a templateUrl, controller, and locals.
   */

   /**
    * @ngdoc method
    * @name $materialCompiler#compile
    * @param {object} options An options object, with the following properties:
    *
    *    - `controller` Ã¢â‚¬â€œ `{(string=|function()=}` Ã¢â‚¬â€œ Controller fn that should be associated with
    *      newly created scope or the name of a {@link angular.Module#controller registered
    *      controller} if passed as a string.
    *    - `controllerAs` Ã¢â‚¬â€œ `{string=}` Ã¢â‚¬â€œ A controller alias name. If present the controller will be
    *      published to scope under the `controllerAs` name.
    *    - `template` Ã¢â‚¬â€œ `{string=}` Ã¢â‚¬â€œ html template as a string or a function that
    *      returns an html template as a string which should be used by {@link
    *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
    *      This property takes precedence over `templateUrl`.
    *
    *    - `templateUrl` Ã¢â‚¬â€œ `{string=}` Ã¢â‚¬â€œ path or function that returns a path to an html
    *      template that should be used by {@link ngRoute.directive:ngView ngView}.
    *
    *    - `transformTemplate` Ã¢â‚¬â€œ `{function=} Ã¢â‚¬â€œ a function which can be used to transform
    *      the templateUrl or template provided after it is fetched.  It will be given one
    *      parameter, the template, and should return a transformed template.
    *
    *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
    *      be injected into the controller. If any of these dependencies are promises, the compiler
    *      will wait for them all to be resolved or one to be rejected before the controller is
    *      instantiated.
    *
    *      - `key` Ã¢â‚¬â€œ `{string}`: a name of a dependency to be injected into the controller.
    *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
    *        Otherwise if function, then it is {@link api/AUTO.$injector#invoke injected}
    *        and the return value is treated as the dependency. If the result is a promise, it is
    *        resolved before its value is injected into the controller.
    *
    * @returns {object=} promise A promsie which will be resolved with a `compileData` object,
    * with the following properties:
    *
    *   - `{element}` Ã¢â‚¬â€œ `element` Ã¢â‚¬â€œ an uncompiled angular element compiled using the provided template.
    *
    *   - `{function(scope)}`  Ã¢â‚¬â€œ `link` Ã¢â‚¬â€œ A link function, which, when called, will compile
    *     the elmeent and instantiate options.controller.
    *
    *   - `{object}` Ã¢â‚¬â€œ `locals` Ã¢â‚¬â€œ The locals which will be passed into the controller once `link` is
    *     called.
    *
    * @usage
    * $materialCompiler.compile({
    *   templateUrl: 'modal.html',
    *   controller: 'ModalCtrl',
    *   locals: {
    *     modal: myModalInstance;
    *   }
    * }).then(function(compileData) {
    *   compileData.element; // modal.html's template in an element
    *   compileData.link(myScope); //attach controller & scope to element
    * });
    */
  this.compile = function(options) {
    var templateUrl = options.templateUrl;
    var template = options.template || '';
    var controller = options.controller;
    var controllerAs = options.controllerAs;
    var resolve = options.resolve || {};
    var locals = options.locals || {};
    var transformTemplate = options.transformTemplate || angular.identity;

    // Take resolve values and invoke them.
    // Resolves can either be a string (value: 'MyRegisteredAngularConst'),
    // or an invokable 'factory' of sorts: (value: function ValueGetter($dependency) {})
    angular.forEach(resolve, function(value, key) {
      if (angular.isString(value)) {
        resolve[key] = $injector.get(value);
      } else {
        resolve[key] = $injector.invoke(value);
      }
    });
    //Add the locals, which are just straight values to inject
    //eg locals: { three: 3 }, will inject three into the controller
    angular.extend(resolve, locals);

    if (templateUrl) {
      resolve.$template = $http.get(templateUrl, {cache: $templateCache})
        .then(function(response) {
          return response.data;
        });
    } else {
      resolve.$template = $q.when(template);
    }

    // Wait for all the resolves to finish if they are promises
    return $q.all(resolve).then(function(locals) {

      var template = transformTemplate(locals.$template);
      var element = angular.element('<div>').html(template).contents();
      var linkFn = $compile(element);

      //Return a linking function that can be used later when the element is ready
      return {
        locals: locals,
        element: element,
        link: function link(scope) {
          locals.$scope = scope;

          //Instantiate controller if it exists, because we have scope
          if (controller) {
            var ctrl = $controller(controller, locals);
            //See angular-route source for this logic
            element.data('$ngControllerController', ctrl);
            element.children().data('$ngControllerController', ctrl);

            if (controllerAs) {
              scope[controllerAs] = ctrl;
            }
          }

          return linkFn(scope);
        }
      };
    });
  };
}

/**
 * Adapted from ui.bootstrap.position
 * https://github.com/angular-ui/bootstrap/blob/master/src/position/position.js
 * https://github.com/angular-ui/bootstrap/blob/master/LICENSE
 */

angular.module('material.services.position', [])
  .factory('$position', [
    '$document',
    '$window',
    MaterialPositionService
  ]);

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
function MaterialPositionService($document, $window) {
  function getStyle(el, cssprop) {
    if (el.currentStyle) { //IE
      return el.currentStyle[cssprop];
    } else if ($window.getComputedStyle) {
      return $window.getComputedStyle(el)[cssprop];
    }
    // finally try and get inline style
    return el.style[cssprop];
  }

  /**
   * Checks if a given element is statically positioned
   * @param element - raw DOM element
   */
  function isStaticPositioned(element) {
    return (getStyle(element, 'position') || 'static' ) === 'static';
  }

  /**
   * returns the closest, non-statically positioned parentOffset of a given element
   * @param element
   */
  var parentOffsetEl = function (element) {
    var docDomEl = $document[0];
    var offsetParent = element.offsetParent || docDomEl;
    while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
      offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || docDomEl;
  };

  return {
    /**
     * Provides read-only equivalent of jQuery's position function:
     * http://api.jquery.com/position/
     */
    position: function (element) {
      var elBCR = this.offset(element);
      var offsetParentBCR = { top: 0, left: 0 };
      var offsetParentEl = parentOffsetEl(element[0]);
      if (offsetParentEl != $document[0]) {
        offsetParentBCR = this.offset(angular.element(offsetParentEl));
        offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
        offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
      }

      var boundingClientRect = element[0].getBoundingClientRect();
      return {
        width: boundingClientRect.width || element.prop('offsetWidth'),
        height: boundingClientRect.height || element.prop('offsetHeight'),
        top: elBCR.top - offsetParentBCR.top,
        left: elBCR.left - offsetParentBCR.left
      };
    },

    /**
     * Provides read-only equivalent of jQuery's offset function:
     * http://api.jquery.com/offset/
     */
    offset: function (element) {
      var boundingClientRect = element[0].getBoundingClientRect();
      return {
        width: boundingClientRect.width || element.prop('offsetWidth'),
        height: boundingClientRect.height || element.prop('offsetHeight'),
        top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
        left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
      };
    },

    /**
     * Provides coordinates for the targetEl in relation to hostEl
     */
    positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

      var positionStrParts = positionStr.split('-');
      var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

      var hostElPos,
      targetElWidth,
      targetElHeight,
      targetElPos;

      hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

      targetElWidth = targetEl.prop('offsetWidth');
      targetElHeight = targetEl.prop('offsetHeight');

      var shiftWidth = {
        center: function () {
          return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
        },
        left: function () {
          return hostElPos.left;
        },
        right: function () {
          return hostElPos.left + hostElPos.width;
        }
      };

      var shiftHeight = {
        center: function () {
          return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
        },
        top: function () {
          return hostElPos.top;
        },
        bottom: function () {
          return hostElPos.top + hostElPos.height;
        }
      };

      switch (pos0) {
        case 'right':
          targetElPos = {
          top: shiftHeight[pos1](),
          left: shiftWidth[pos0]()
        };
        break;
        case 'left':
          targetElPos = {
          top: shiftHeight[pos1](),
          left: hostElPos.left - targetElWidth
        };
        break;
        case 'bottom':
          targetElPos = {
          top: shiftHeight[pos0](),
          left: shiftWidth[pos1]()
        };
        break;
        default:
          targetElPos = {
          top: shiftHeight[pos0](),
          left: shiftWidth[pos1]()
        };
        break;
      }

      return targetElPos;
    }
  };
}

/**
 * @ngdoc overview
 * @name material.services.registry
 *
 * @description
 * A component registry system for accessing various component instances in an app.
 */
angular.module('material.services.registry', [
])
  .factory('$materialComponentRegistry', [
    '$log',
    materialComponentRegistry
  ]);

/**
 * @ngdoc service
 * @name material.services.registry.service:$materialComponentRegistry
 *
 * @description
 * $materialComponentRegistry enables the user to interact with multiple instances of
 * certain complex components in a running app.
 */
function materialComponentRegistry($log) {
  var instances = [];

  return {
    /**
     * Used to print an error when an instance for a handle isn't found.
     */
    notFoundError: function(handle) {
      $log.error('No instance found for handle', handle);
    },
    /**
     * Return all registered instances as an array.
     */
    getInstances: function() {
      return instances;
    },

    /**
     * Get a registered instance.
     * @param handle the String handle to look up for a registered instance.
     */
    get: function(handle) {
      var i, j, instance;
      for(i = 0, j = instances.length; i < j; i++) {
        instance = instances[i];
        if(instance.$$materialHandle === handle) {
          return instance;
        }
      }
      return null;
    },

    /**
     * Register an instance.
     * @param instance the instance to register
     * @param handle the handle to identify the instance under.
     */
    register: function(instance, handle) {
      instance.$$materialHandle = handle;
      instances.push(instance);

      return function deregister() {
        var index = instances.indexOf(instance);
        if (index !== -1) {
          instances.splice(index, 1);
        }
      };
    },
  }
}


angular.module('material.services.throttle', [ ])
  .factory('$throttle', [
    '$timeout',
    '$$q',
    '$log',
    MaterialThrottleService
  ]);
  /**
   *   var ripple, watchMouse,
   *       parent = element.parent(),
   *       makeRipple = $throttle({
   *         start : function() {
   *           ripple = ripple || $materialEffects.inkRipple( element[0], options );
   *           watchMouse = watchMouse || buildMouseWatcher(parent, makeRipple);
   *           // Ripples start with mouseDow (or taps)
   *           parent.on('mousedown', makeRipple);
   *         },
   *         throttle : function(e, done) {
   *           if ( effectAllowed() )
   *           {
   *             switch(e.type)
   *             {
   *               case 'mousedown' :
   *                 watchMouse(true);
   *                 ripple.createAt( options.forceToCenter ? null : localToCanvas(e) );
   *                 break;
   *               default:
   *                 watchMouse(false);
   *                 ripple.draw( localToCanvas(e) );
   *                 break;
   *             }
   *           } else {
   *             done();
   *           }
   *         },
   *         end : function() {
   *           watchMouse(false);
   *         }
   *       });
   *
   *   makeRipple();
   *
   */
function MaterialThrottleService($timeout, $$q, $log) {

  var STATE_READY= 0, STATE_START=1, STATE_THROTTLE=2, STATE_END=3;

  return function( config ){
    return function( done, otherwise ){
      return buildInstance( angular.extend({}, config), done || angular.noop, otherwise || angular.noop );
    };
  };

  function buildInstance( phases, done, otherwise ) {
    var pendingActions = [ ],
        cancel = angular.noop,
        state = STATE_READY;

    // Defer the call to the start function ... so `throttle` reference can be returned...
    $timeout(function(){
      start().then(function(){
         if ( !phases.throttle ) {
           end();
         }
      });
    },0,false);

    return throttle;

    /**
     * Facade function that validates throttler
     * state BEFORE processing the `throttle` request.
     */
    function throttle( data, done ) {

      if ( state != STATE_THROTTLE ) {
          cacheRquest();
      }

      switch( state )
      {
        case STATE_READY :
          start();
          break;

        case STATE_START:
          break;

        // Proxy throttle call to custom, user-defined throttle handler
        case STATE_THROTTLE:
          invokeThrottleHandler(data, done);
          break;

        case STATE_END :
          restart();
          break;
      }

      // **********************************************************
      // Internal Methods
      // **********************************************************

      /**
       *  Cache for later submission to 'throttle()'
       */
      function cacheRquest() {
        pendingActions.push({ data:data, done:done });
      }

      /**
       * Delegate to the custom throttle function...
       * When CTF reports complete, then proceed to the `end` state
       *
       * @param data  Data to be delegated to the throttle function
       * @param done  Callback when all throttle actions have completed
       */
      function invokeThrottleHandler(data, done) {

        if ( angular.isFunction(phases.throttle) ) {
          done = done || angular.noop;

          try {

            phases.throttle.apply( null, [data, function(response) {
              done.apply( null, [response] );
              end();
            }]);

          } catch( error ) {
            // Report error... and end()

            otherwise(error);
            end();
          }

        } else {
          end();
        }
      }
    }


    /**
     * Initiate the async `start` phase of the Throttler
     * @returns {*} promise
     */
    function start() {
      return gotoState.apply(null, [ STATE_START, phases.start ] )
                      .then( feedPendingActions, otherwise );

      /**
       * Process all pending actions (if any)
       */
      function feedPendingActions( response ) {
        logResponse(response);

        state = STATE_THROTTLE;

        angular.forEach(pendingActions, function (it) {
          throttle( it.data, function(response) {
            logResponse(response);

            if ( angular.isFunction(it.done) ) {
              it.done(response);
            }
          });
        });

        pendingActions = [ ];
      }
    }

    /**
     * Initiate the async `end` phase of the Throttler
     * @returns {*} promise
     */
    function end() {

      return gotoState.apply(null,[ STATE_END, phases.end ])
                      .then( finish, otherwise );

      /**
       * Mark throttle as ready to start... and announce completion
       * of the current activity cycle
       */
      function finish( response ) {
        logResponse(response);

        if ( state == STATE_END ){
          state = STATE_READY;
          done();
        }
      }

    }

    /**
     * Cancel any `end` process and restart state machine processes
     */
    function restart() {
      try {

        if ( !angular.isFunction(cancel) ) {
          cancel = angular.noop;
        }

        cancel();
        state = STATE_READY;

      } finally {

        start();
      }
    }

    /**
     * Change to next state and call the state function associated with that state...
     * @param nextState
     * @param targetFn
     * @returns {*}
     */
    function gotoState( nextState , targetFn  )
    {

      var dfd = $$q.defer(),
          hasFn = angular.isFunction(targetFn),
          goNext = hasFn && (targetFn.length < 1),
          fn = hasFn ? targetFn : resolved;

      try {

        state = nextState;

        cancel = fn.apply( null, [
          goNext ? resolved(dfd) :
          hasFn ? callbackToResolve(dfd) : dfd
        ]);

      } catch( error ) {
        dfd.reject( error );
      }

      return dfd.promise;
    }

  }

  // **********************************************************
  // Internal Methods
  // **********************************************************

  /**
   * Create callback function that will resolve the specified deferred.
   * @param dfd
   * @returns {Function}
   */
  function callbackToResolve( dfd )
  {
    return function(response){
      dfd.resolve.apply(null, [response ]);
    };
  }

  /**
   * Prepare fallback promise for start, end, throttle phases of the Throttler
   * @param dfd
   * @returns {*}
   */
  function resolved(dfd)
  {
    dfd = dfd || $$q.defer();
    dfd.resolve.apply(null, arguments.length > 1 ? [].slice.call(arguments,1) : [ ]);

    return dfd.promise;
  }

  function logResponse(response)
  {
    if ( angular.isDefined(response) ) {
      $log.debug(response);
    }
  }
}

})();
var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute', 'angularytics'])

.config([
  'COMPONENTS',
  '$routeProvider',
function(COMPONENTS, $routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'template/home.tmpl.html'
    })
    .when('/layout/:tmpl', {
      templateUrl: function(params){
        return 'template/layout-' + params.tmpl + '.tmpl.html';
      }
    });

  angular.forEach(COMPONENTS, function(component) {

    angular.forEach(component.docs, function(doc) {
      $routeProvider.when(doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });

  });

  $routeProvider.otherwise('/');

}])

.config(['AngularyticsProvider',
function(AngularyticsProvider) {
  AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run([
  'Angularytics',
  '$rootScope',
function(Angularytics, $rootScope) {
  Angularytics.init();
}])

.factory('menu', [
  'COMPONENTS',
  '$location',
  '$rootScope',
function(COMPONENTS, $location, $rootScope) {
  var componentDocs = [];
  var demoDocs = [];
  COMPONENTS.forEach(function(component) {
    component.docs.forEach(function(doc) {
      if (doc.docType === 'readme') {
        demoDocs.push(doc);
      } else {
        componentDocs.push(doc);
      }
    });
  });
  var sections = [{
    name: 'Demos',
    pages: demoDocs
  }, {
    name: 'Layout',
    pages: [{
      name: 'Container Elements',
      id: 'layoutContainers',
      url: '/layout/container'
    },{
      name: 'Grid System',
      id: 'layoutGrid',
      url: '/layout/grid'
    },{
      name: 'Child Alignment',
      id: 'layoutAlign',
      url: '/layout/alignment'
    },{
      name: 'Options',
      id: 'layoutOptions',
      url: '/layout/options'
    }]
  }, {
    name: 'API',
    pages: componentDocs
  }];
  var self;

  $rootScope.$on('$locationChangeSuccess', onLocationChange);

  return self = {
    sections: sections,

    selectSection: function(section) {
      self.openedSection = section;
    },
    toggleSelectSection: function(section) {
      self.openedSection = (self.openedSection === section ? null : section);
    },
    isSectionSelected: function(section) {
      return self.openedSection === section;
    },

    selectPage: function(section, page) {
      page && page.url && $location.path(page.url);
      self.currentSection = section;
      self.currentPage = page;
    },
    isPageSelected: function(section, page) {
      return self.currentPage === page;
    }
  };

  function onLocationChange() {
    var activated = false;
    var path = $location.path();
    sections.forEach(function(section) {
      section.pages.forEach(function(page) {
        if (path === page.url) {
          self.selectSection(section);
          self.selectPage(section, page);
          activated = true;
        }
      });
    });
    if (!activated) {
      self.selectSection(sections[2]);
    }
  }
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  '$materialSidenav',
  '$timeout',
  '$materialDialog',
  'menu',
  '$location',
function($scope, COMPONENTS, $materialSidenav, $timeout, $materialDialog, menu, $location) {
  $scope.goToUrl = function(p) {
    window.location = p;
  };

  $scope.COMPONENTS = COMPONENTS;

  $scope.menu = menu;

  $scope.toggleMenu = function() {
    $timeout(function() {
      $materialSidenav('left').toggle();
    });
  };

  $scope.goHome = function($event) {
    menu.selectPage(null, null);
    $location.path( '/' );
  };

  $scope.viewSource = function(demo, $event) {
    $materialDialog({
      targetEvent: $event,
      controller: 'ViewSourceCtrl',
      locals: {
        demo: demo
      },
      templateUrl: 'template/view-source.tmpl.html'
    });
  };


  COMPONENTS.forEach(function(component) {
    component.demos && component.demos.forEach(function(demo) {
      demo.$files = [demo.indexFile].concat(
        demo.files.sort(sortByJs)
      );
      demo.$selectedFile = demo.indexFile;
    });
  });

  function sortByJs(file) {
    return file.fileType == 'js' ? -1 : 1;
  }
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
function($scope, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])

.controller('LayoutCtrl', [
  '$scope',
  '$attrs',
  '$location',
  '$rootScope',
function($scope, $attrs, $location, $rootScope) {
  $rootScope.currentComponent = $rootScope.currentDoc = null;
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
function($scope, doc, component, $rootScope) {
  $rootScope.currentComponent = component;
  $rootScope.currentDoc = doc;
}])
;

DocsApp
.constant('COMPONENTS', [
  {
    "id": "material.components.button",
    "name": "Buttons",
    "docs": [
      {
        "content": "Buttons, created with the `<material-button>` directive.\n",
        "componentId": "material.components.button",
        "componentName": "Buttons",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/buttons/README.md",
        "humanName": "Buttons",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/buttons/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/buttons/README.md#Lundefined",
        "url": "/material.components.button/readme/overview",
        "outputPath": "generated/material.components.button/readme/overview/index.html",
        "readmeUrl": "/material.components.button/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Buttons, created with the <code>&lt;material-button&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "`<material-button>` is a button directive with optional ink ripples (default enabled).",
        "content": "@ngdoc directive\n@name materialButton\n@order 0\n\n@restrict E\n\n@description\n`<material-button>` is a button directive with optional ink ripples (default enabled).\n\n@param {boolean=} noink Flag indicates use of ripple ink effects\n@param {boolean=} disabled Flag indicates if the tab is disabled: not selectable with no ink effects\n@param {string=} type Optional attribute to specific button types (useful for forms); such as 'submit', etc.\n@param {string=} ng-ref Optional attribute to support both ARIA and link navigation\n@param {string=} href Optional attribute to support both ARIA and link navigation\n\n@usage\n<hljs lang=\"html\">\n <material-button>Button</material-button>\n <br/>\n <material-button noink class=\"material-button-colored\">\n   Button (noInk)\n </material-button>\n <br/>\n <material-button disabled class=\"material-button-colored\">\n   Colored (disabled)\n </material-button>\n</hljs>",
        "componentId": "material.components.button",
        "componentName": "Buttons",
        "docType": "directive",
        "name": "materialButton",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates use of ripple ink effects",
            "startingLine": 25,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "noink"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates if the tab is disabled: not selectable with no ink effects",
            "startingLine": 26,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "disabled"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Optional attribute to specific button types (useful for forms); such as 'submit', etc.",
            "startingLine": 27,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "type"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Optional attribute to support both ARIA and link navigation",
            "startingLine": 28,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "ng-ref"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Optional attribute to support both ARIA and link navigation",
            "startingLine": 29,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "href"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n <material-button>Button</material-button>\n <br/>\n <material-button noink class=\"material-button-colored\">\n   Button (noInk)\n </material-button>\n <br/>\n <material-button disabled class=\"material-button-colored\">\n   Colored (disabled)\n </material-button>\n</hljs>",
        "order": "0",
        "dependencies": [
          "material.animations",
          ""
        ],
        "file": "src/components/buttons/buttons.js",
        "startingLine": 16,
        "humanName": "material-button",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/buttons/buttons.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/buttons/buttons.js#L16",
        "url": "/material.components.button/directive/materialButton",
        "outputPath": "generated/material.components.button/directive/materialButton/index.html",
        "readmeUrl": "/material.components.button/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p><code>&lt;material-button&gt;</code> is a button directive with optional ink ripples (default enabled).</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n <material-button>Button</material-button>\n <br/>\n <material-button noink class=\"material-button-colored\">\n   Button (noInk)\n </material-button>\n <br/>\n <material-button disabled class=\"material-button-colored\">\n   Colored (disabled)\n </material-button>\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      noink\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates use of ripple ink effects</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      disabled\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates if the tab is disabled: not selectable with no ink effects</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      type\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Optional attribute to specific button types (useful for forms); such as &#39;submit&#39;, etc.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ng-ref\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Optional attribute to support both ARIA and link navigation</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      href\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Optional attribute to support both ARIA and link navigation</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.button",
    "demos": [
      {
        "id": "demo1",
        "name": "Basic Buttons",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/buttons/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});\n",
            "componentId": "material.components.button",
            "componentName": "Buttons",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Basic Buttons",
            "fileName": "script",
            "relativePath": "script.js/src/components/buttons/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.button/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/buttons/demo1/style.css",
            "content": "\n/** From vulcanized demo **/\n\nsection {\n  background: #f7f7f7;\n  border-radius: 3px;\n  text-align: center;\n  margin: 1em;\n  position: relative !important;\n  padding-bottom: 10px;\n}\nmaterial-content {\n  margin-right: 7px;\n}\nsection material-button,\nsection .material-button {\n  display: block;\n  width: 10em;\n  margin: 1em;\n  line-height: 25px;\n}\n.label {\n  position: absolute;\n  bottom: 5px;\n  left: 7px;\n  color: #ccc;\n  font-size: 14px;\n}\n\n",
            "componentId": "material.components.button",
            "componentName": "Buttons",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Basic Buttons",
            "fileName": "style",
            "relativePath": "style.css/src/components/buttons/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.button/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\n/** From vulcanized demo **/\n\nsection {\n  background: #f7f7f7;\n  border-radius: 3px;\n  text-align: center;\n  margin: 1em;\n  position: relative !important;\n  padding-bottom: 10px;\n}\nmaterial-content {\n  margin-right: 7px;\n}\nsection material-button,\nsection .material-button {\n  display: block;\n  width: 10em;\n  margin: 1em;\n  line-height: 25px;\n}\n.label {\n  position: absolute;\n  bottom: 5px;\n  left: 7px;\n  color: #ccc;\n  font-size: 14px;\n}\n\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/buttons/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n  <material-content >\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button>Button</material-button>\n      <material-button noink class=\"material-button-colored\">Button (noink)</material-button>\n      <material-button disabled class=\"material-button-colored\">Disabled</material-button>\n      <div class=\"label\">flat</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-button-raised\">Button</material-button>\n      <material-button class=\"material-button-raised material-button-colored\">Colored</material-button>\n      <material-button disabled class=\"material-button-raised material-button-colored\">Disabled</material-button>\n      <div class=\"label\">raised</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button>Button</material-button>\n      <material-button class=\"material-button-colored\">Colored</material-button>\n      <div class=\"label\">flat + hover state</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-button-raised\">Button</material-button>\n      <material-button class=\"material-button-raised material-button-colored\">Colored</material-button>\n      <div class=\"label\">raised + hover state</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button>Button</material-button>\n      <material-button class=\"material-button-colored\">Colored</material-button>\n      <div class=\"label\">flat + focused</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-button-raised\">Button</material-button>\n      <material-button class=\"material-button-raised material-button-colored\">Colored</material-button>\n      <div class=\"label\">raised + focused</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\" style=\"height: 92px;margin-top: 0px;\">\n\n        <material-button class=\"material-button-fab\">\n            <material-icon icon=\"/img/icons/ic_access_time_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n        </material-button>\n\n      <material-button class=\"material-button-fab\">\n        <material-icon icon=\"/img/icons/ic_insert_drive_file_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n      </material-button>\n\n        <material-button class=\"material-button-fab\" disabled>\n            <material-icon icon=\"/img/icons/ic_comment_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n        </material-button>\n\n        <material-button class=\"material-button-fab material-theme-light-blue\">\n            <material-icon icon=\"/img/icons/ic_people_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n        </material-button>\n\n\n      <div class=\"label\">FAB</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <div class=\"material-button-group\">\n        <material-button class=\"\">Reset</material-button>\n        <material-button class=\"\">RSVP</material-button>\n      </div>\n      <div class=\"label\">Button Group</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-theme-green\">Button</material-button>\n      <material-button class=\"material-theme-red\">Button</material-button>\n      <material-button class=\"material-theme-light-blue\">Button</material-button>\n      <material-button class=\"material-theme-yellow\">Button</material-button>\n      <div class=\"label\">Themed</div>\n    </section>\n\n  </material-content>\n</div>\n",
          "componentId": "material.components.button",
          "componentName": "Buttons",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Basic Buttons",
          "fileName": "index",
          "relativePath": "index.html/src/components/buttons/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.button/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/buttons/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});\n",
              "componentId": "material.components.button",
              "componentName": "Buttons",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Basic Buttons",
              "fileName": "script",
              "relativePath": "script.js/src/components/buttons/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.button/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/buttons/demo1/style.css",
              "content": "\n/** From vulcanized demo **/\n\nsection {\n  background: #f7f7f7;\n  border-radius: 3px;\n  text-align: center;\n  margin: 1em;\n  position: relative !important;\n  padding-bottom: 10px;\n}\nmaterial-content {\n  margin-right: 7px;\n}\nsection material-button,\nsection .material-button {\n  display: block;\n  width: 10em;\n  margin: 1em;\n  line-height: 25px;\n}\n.label {\n  position: absolute;\n  bottom: 5px;\n  left: 7px;\n  color: #ccc;\n  font-size: 14px;\n}\n\n",
              "componentId": "material.components.button",
              "componentName": "Buttons",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Basic Buttons",
              "fileName": "style",
              "relativePath": "style.css/src/components/buttons/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.button/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\n/** From vulcanized demo **/\n\nsection {\n  background: #f7f7f7;\n  border-radius: 3px;\n  text-align: center;\n  margin: 1em;\n  position: relative !important;\n  padding-bottom: 10px;\n}\nmaterial-content {\n  margin-right: 7px;\n}\nsection material-button,\nsection .material-button {\n  display: block;\n  width: 10em;\n  margin: 1em;\n  line-height: 25px;\n}\n.label {\n  position: absolute;\n  bottom: 5px;\n  left: 7px;\n  color: #ccc;\n  font-size: 14px;\n}\n\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n  <material-content >\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button>Button</material-button>\n      <material-button noink class=\"material-button-colored\">Button (noink)</material-button>\n      <material-button disabled class=\"material-button-colored\">Disabled</material-button>\n      <div class=\"label\">flat</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-button-raised\">Button</material-button>\n      <material-button class=\"material-button-raised material-button-colored\">Colored</material-button>\n      <material-button disabled class=\"material-button-raised material-button-colored\">Disabled</material-button>\n      <div class=\"label\">raised</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button>Button</material-button>\n      <material-button class=\"material-button-colored\">Colored</material-button>\n      <div class=\"label\">flat + hover state</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-button-raised\">Button</material-button>\n      <material-button class=\"material-button-raised material-button-colored\">Colored</material-button>\n      <div class=\"label\">raised + hover state</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button>Button</material-button>\n      <material-button class=\"material-button-colored\">Colored</material-button>\n      <div class=\"label\">flat + focused</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-button-raised\">Button</material-button>\n      <material-button class=\"material-button-raised material-button-colored\">Colored</material-button>\n      <div class=\"label\">raised + focused</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\" style=\"height: 92px;margin-top: 0px;\">\n\n        <material-button class=\"material-button-fab\">\n            <material-icon icon=\"/img/icons/ic_access_time_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n        </material-button>\n\n      <material-button class=\"material-button-fab\">\n        <material-icon icon=\"/img/icons/ic_insert_drive_file_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n      </material-button>\n\n        <material-button class=\"material-button-fab\" disabled>\n            <material-icon icon=\"/img/icons/ic_comment_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n        </material-button>\n\n        <material-button class=\"material-button-fab material-theme-light-blue\">\n            <material-icon icon=\"/img/icons/ic_people_24px.svg\" style=\"width: 24px; height: 24px;\"></material-icon>\n        </material-button>\n\n\n      <div class=\"label\">FAB</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <div class=\"material-button-group\">\n        <material-button class=\"\">Reset</material-button>\n        <material-button class=\"\">RSVP</material-button>\n      </div>\n      <div class=\"label\">Button Group</div>\n    </section>\n\n    <section layout=\"vertical\" layout-sm=\"horizontal\" layout-align=\"center center\">\n      <material-button class=\"material-theme-green\">Button</material-button>\n      <material-button class=\"material-theme-red\">Button</material-button>\n      <material-button class=\"material-theme-light-blue\">Button</material-button>\n      <material-button class=\"material-theme-yellow\">Button</material-button>\n      <div class=\"label\">Themed</div>\n    </section>\n\n  </material-content>\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.button/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.card",
    "name": "Card",
    "docs": [
      {
        "content": "Cards, created with the `<material-card>` directive.\n",
        "componentId": "material.components.card",
        "componentName": "Card",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/card/README.md",
        "humanName": "Card",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/card/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/card/README.md#Lundefined",
        "url": "/material.components.card/readme/overview",
        "outputPath": "generated/material.components.card/readme/overview/index.html",
        "readmeUrl": "/material.components.card/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Cards, created with the <code>&lt;material-card&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The `<material-card>` directive is a container element used within `<material-content>` containers.",
        "content": "@ngdoc directive\n@name materialCard\n@module material.components.card\n\n@restrict E\n\n@description\nThe `<material-card>` directive is a container element used within `<material-content>` containers.\n\n@usage\n<hljs lang=\"html\">\n <material-card>\n   <img src=\"/img/washedout.png\" class=\"material-card-image\">\n   <h2>Paracosm</h2>\n   <p>\n     The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n     two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n   </p>\n </material-card>\n</hljs>",
        "componentId": "material.components.card",
        "componentName": "Card",
        "docType": "directive",
        "name": "materialCard",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n <material-card>\n   <img src=\"/img/washedout.png\" class=\"material-card-image\">\n   <h2>Paracosm</h2>\n   <p>\n     The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n     two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n   </p>\n </material-card>\n</hljs>",
        "file": "src/components/card/card.js",
        "startingLine": 14,
        "humanName": "material-card",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/card/card.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/card/card.js#L14",
        "url": "/material.components.card/directive/materialCard",
        "outputPath": "generated/material.components.card/directive/materialCard/index.html",
        "readmeUrl": "/material.components.card/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-card&gt;</code> directive is a container element used within <code>&lt;material-content&gt;</code> containers.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n <material-card>\n   <img src=\"/img/washedout.png\" class=\"material-card-image\">\n   <h2>Paracosm</h2>\n   <p>\n     The titles of Washed Out&#39;s breakthrough song and the first single from Paracosm share the\n     two most important words in Ernest Greene&#39;s musical language: feel it. It&#39;s a simple request, as well...\n   </p>\n </material-card>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.card",
    "demos": [
      {
        "id": "demo1",
        "name": "Card Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/card/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});",
            "componentId": "material.components.card",
            "componentName": "Card",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Card Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/card/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.card/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});\n"
          },
          {
            "fileType": "css",
            "file": "src/components/card/demo1/style.css",
            "content": "\nmaterial-card {\n  min-height: 150px;\n}",
            "componentId": "material.components.card",
            "componentName": "Card",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Card Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/card/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.card/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\nmaterial-card {\n  min-height: 150px;\n}\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/card/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-content>\n\n    <material-card>\n      <img src=\"/img/washedout.png\" class=\"material-card-image\">\n      <h2>Paracosm</h2>\n      <p>\n        The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n        two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n      </p>\n    </material-card>\n\n    <material-card>\n      <img src=\"/img/washedout.png\" class=\"material-card-image\">\n      <h2>Paracosm</h2>\n      <p>\n        The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n        two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n      </p>\n    </material-card>\n\n    <material-card>\n      <img src=\"/img/washedout.png\" class=\"material-card-image\">\n      <h2>Paracosm</h2>\n      <p>\n        The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n        two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n      </p>\n    </material-card>\n\n  </material-content>\n</div>\n",
          "componentId": "material.components.card",
          "componentName": "Card",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Card Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/card/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.card/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/card/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});",
              "componentId": "material.components.card",
              "componentName": "Card",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Card Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/card/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.card/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n});\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/card/demo1/style.css",
              "content": "\nmaterial-card {\n  min-height: 150px;\n}",
              "componentId": "material.components.card",
              "componentName": "Card",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Card Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/card/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.card/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\nmaterial-card {\n  min-height: 150px;\n}\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-content>\n\n    <material-card>\n      <img src=\"/img/washedout.png\" class=\"material-card-image\">\n      <h2>Paracosm</h2>\n      <p>\n        The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n        two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n      </p>\n    </material-card>\n\n    <material-card>\n      <img src=\"/img/washedout.png\" class=\"material-card-image\">\n      <h2>Paracosm</h2>\n      <p>\n        The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n        two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n      </p>\n    </material-card>\n\n    <material-card>\n      <img src=\"/img/washedout.png\" class=\"material-card-image\">\n      <h2>Paracosm</h2>\n      <p>\n        The titles of Washed Out's breakthrough song and the first single from Paracosm share the\n        two most important words in Ernest Greene's musical language: feel it. It's a simple request, as well...\n      </p>\n    </material-card>\n\n  </material-content>\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.card/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.checkbox",
    "name": "Checkbox",
    "docs": [
      {
        "content": "Checkboxes, created with the `<material-checkbox>` directive.\n",
        "componentId": "material.components.checkbox",
        "componentName": "Checkbox",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/checkbox/README.md",
        "humanName": "Checkbox",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/checkbox/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/checkbox/README.md#Lundefined",
        "url": "/material.components.checkbox/readme/overview",
        "outputPath": "generated/material.components.checkbox/readme/overview/index.html",
        "readmeUrl": "/material.components.checkbox/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Checkboxes, created with the <code>&lt;material-checkbox&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D)",
        "content": "@ngdoc directive\n@name materialCheckbox\n@module material.components.checkbox\n@restrict E\n\n@description\nThe checkbox directive is used like the normal [angular checkbox](https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D)\n\n@param {string} ngModel Assignable angular expression to data-bind to.\n@param {string=} name Property name of the form under which the control is published.\n@param {expression=} ngTrueValue The value to which the expression should be set when selected.\n@param {expression=} ngFalseValue The value to which the expression should be set when not selected.\n@param {string=} ngChange Angular expression to be executed when input changes due to user interaction with the input element.\n@param {boolean=} noink Use of attribute indicates use of ripple ink effects\n@param {boolean=} disabled Use of attribute indicates the tab is disabled: no ink effects and not selectable\n\n@usage\n<hljs lang=\"html\">\n<material-checkbox ng-model=\"isChecked\">\n  Finished ?\n</material-checkbox>\n\n<material-checkbox noink ng-model=\"hasInk\">\n  No Ink Effects\n</material-checkbox>\n\n<material-checkbox disabled ng-model=\"isDisabled\">\n  Disabled\n</material-checkbox>\n\n</hljs>",
        "componentId": "material.components.checkbox",
        "componentName": "Checkbox",
        "docType": "directive",
        "name": "materialCheckbox",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Assignable angular expression to data-bind to.",
            "startingLine": 22,
            "typeExpression": "string",
            "type": {
              "type": "NameExpression",
              "name": "string"
            },
            "typeList": [
              "string"
            ],
            "name": "ngModel"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Property name of the form under which the control is published.",
            "startingLine": 23,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "name"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The value to which the expression should be set when selected.",
            "startingLine": 24,
            "typeExpression": "expression=",
            "type": {
              "type": "NameExpression",
              "name": "expression",
              "optional": true
            },
            "typeList": [
              "expression"
            ],
            "optional": true,
            "name": "ngTrueValue"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The value to which the expression should be set when not selected.",
            "startingLine": 25,
            "typeExpression": "expression=",
            "type": {
              "type": "NameExpression",
              "name": "expression",
              "optional": true
            },
            "typeList": [
              "expression"
            ],
            "optional": true,
            "name": "ngFalseValue"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Angular expression to be executed when input changes due to user interaction with the input element.",
            "startingLine": 26,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "ngChange"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Use of attribute indicates use of ripple ink effects",
            "startingLine": 27,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "noink"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Use of attribute indicates the tab is disabled: no ink effects and not selectable",
            "startingLine": 28,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "disabled"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-checkbox ng-model=\"isChecked\">\n  Finished ?\n</material-checkbox>\n\n<material-checkbox noink ng-model=\"hasInk\">\n  No Ink Effects\n</material-checkbox>\n\n<material-checkbox disabled ng-model=\"isDisabled\">\n  Disabled\n</material-checkbox>\n\n</hljs>",
        "dependencies": [
          "material.animations"
        ],
        "file": "src/components/checkbox/checkbox.js",
        "startingLine": 14,
        "humanName": "material-checkbox",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/checkbox/checkbox.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/checkbox/checkbox.js#L14",
        "url": "/material.components.checkbox/directive/materialCheckbox",
        "outputPath": "generated/material.components.checkbox/directive/materialCheckbox/index.html",
        "readmeUrl": "/material.components.checkbox/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The checkbox directive is used like the normal <a href=\"https://docs.angularjs.org/api/ng/input/input%5Bcheckbox%5D\">angular checkbox</a></p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-checkbox ng-model=\"isChecked\">\n  Finished ?\n</material-checkbox>\n\n<material-checkbox noink ng-model=\"hasInk\">\n  No Ink Effects\n</material-checkbox>\n\n<material-checkbox disabled ng-model=\"isDisabled\">\n  Disabled\n</material-checkbox>\n\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngModel\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      \n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Assignable angular expression to data-bind to.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      name\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Property name of the form under which the control is published.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngTrueValue\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The value to which the expression should be set when selected.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngFalseValue\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The value to which the expression should be set when not selected.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngChange\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Angular expression to be executed when input changes due to user interaction with the input element.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      noink\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Use of attribute indicates use of ripple ink effects</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      disabled\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Use of attribute indicates the tab is disabled: no ink effects and not selectable</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.checkbox",
    "demos": [
      {
        "id": "demo1",
        "name": "Checkbox Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/checkbox/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {};\n  $scope.data.cb1 = true;\n  $scope.data.cb2 = false;\n\n});",
            "componentId": "material.components.checkbox",
            "componentName": "Checkbox",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Checkbox Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/checkbox/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.checkbox/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {};\n  $scope.data.cb1 = true;\n  $scope.data.cb2 = false;\n\n});\n"
          },
          {
            "fileType": "css",
            "file": "src/components/checkbox/demo1/style.css",
            "content": "\nbody {\n  padding: 20px;\n}\n",
            "componentId": "material.components.checkbox",
            "componentName": "Checkbox",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Checkbox Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/checkbox/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.checkbox/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\nbody {\n  padding: 20px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/checkbox/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-checkbox ng-model=\"data.cb1\">\n    Checkbox 1: {{ data.cb1 }}\n  </material-checkbox>\n\n  <material-checkbox ng-model=\"data.cb2\" ng-true-value=\"yup\" ng-false-value=\"nope\">\n    Checkbox 2: {{ data.cb2 }}\n  </material-checkbox>\n\n  <material-checkbox disabled>\n    Checkbox (Disabled)\n  </material-checkbox>\n\n  <material-checkbox noink>\n    Checkbox (No Ink)\n  </material-checkbox>\n\n</div>\n",
          "componentId": "material.components.checkbox",
          "componentName": "Checkbox",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Checkbox Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/checkbox/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.checkbox/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/checkbox/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {};\n  $scope.data.cb1 = true;\n  $scope.data.cb2 = false;\n\n});",
              "componentId": "material.components.checkbox",
              "componentName": "Checkbox",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Checkbox Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/checkbox/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.checkbox/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {};\n  $scope.data.cb1 = true;\n  $scope.data.cb2 = false;\n\n});\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/checkbox/demo1/style.css",
              "content": "\nbody {\n  padding: 20px;\n}\n",
              "componentId": "material.components.checkbox",
              "componentName": "Checkbox",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Checkbox Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/checkbox/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.checkbox/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\nbody {\n  padding: 20px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-checkbox ng-model=\"data.cb1\">\n    Checkbox 1: {{ data.cb1 }}\n  </material-checkbox>\n\n  <material-checkbox ng-model=\"data.cb2\" ng-true-value=\"yup\" ng-false-value=\"nope\">\n    Checkbox 2: {{ data.cb2 }}\n  </material-checkbox>\n\n  <material-checkbox disabled>\n    Checkbox (Disabled)\n  </material-checkbox>\n\n  <material-checkbox noink>\n    Checkbox (No Ink)\n  </material-checkbox>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.checkbox/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.content",
    "name": "Content",
    "docs": [
      {
        "content": "A simple container for scrollable content, using the `<material-content>` directive.\n",
        "componentId": "material.components.content",
        "componentName": "Content",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/content/README.md",
        "humanName": "Content",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/content/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/content/README.md#Lundefined",
        "url": "/material.components.content/readme/overview",
        "outputPath": "generated/material.components.content/readme/overview/index.html",
        "readmeUrl": "/material.components.content/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>A simple container for scrollable content, using the <code>&lt;material-content&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The `<material-content>` directive is a container element useful for scrollable content",
        "content": "@ngdoc directive\n@name materialContent\n@module material.components.content\n\n@restrict E\n\n@description\nThe `<material-content>` directive is a container element useful for scrollable content\n\n@usage\n<hljs lang=\"html\">\n <material-content class=\"material-content-padding\">\n     Lorem ipsum dolor sit amet, ne quod novum mei.\n </material-content>\n</hljs>",
        "componentId": "material.components.content",
        "componentName": "Content",
        "docType": "directive",
        "name": "materialContent",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n <material-content class=\"material-content-padding\">\n     Lorem ipsum dolor sit amet, ne quod novum mei.\n </material-content>\n</hljs>",
        "dependencies": [
          "material.services.registry"
        ],
        "file": "src/components/content/content.js",
        "startingLine": 15,
        "humanName": "material-content",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/content/content.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/content/content.js#L15",
        "url": "/material.components.content/directive/materialContent",
        "outputPath": "generated/material.components.content/directive/materialContent/index.html",
        "readmeUrl": "/material.components.content/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-content&gt;</code> directive is a container element useful for scrollable content</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n <material-content class=\"material-content-padding\">\n     Lorem ipsum dolor sit amet, ne quod novum mei.\n </material-content>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.content",
    "demos": [
      {
        "id": "demo1",
        "name": "Content Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/content/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n",
            "componentId": "material.components.content",
            "componentName": "Content",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Content Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/content/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.content/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/content/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" layout=\"vertical\">\n  <material-toolbar class=\"material-theme-dark\">\n    <div class=\"material-toolbar-tools\">\n      <span class=\"material-flex\">Toolbar: dark-theme</span>\n    </div>\n  </material-toolbar>\n\n  <material-content class=\"material-content-padding\">\n    Lorem ipsum dolor sit amet, ne quod novum mei. Sea omnium invenire mediocrem at, in lobortis conclusionemque nam. Ne deleniti appetere reprimique pro, inani labitur disputationi te sed. At vix sale omnesque, id pro labitur reformidans accommodare, cum labores honestatis eu. Nec quem lucilius in, eam praesent reformidans no. Sed laudem aliquam ne.\n\n    <p>\nFacete delenit argumentum cum at. Pro rebum nostrum contentiones ad. Mel exerci tritani maiorum at, mea te audire phaedrum, mel et nibh aliquam. Malis causae equidem vel eu. Noster melius vis ea, duis alterum oporteat ea sea. Per cu vide munere fierent.\n\n    <p>\nAd sea dolor accusata consequuntur. Sit facete convenire reprehendunt et. Usu cu nonumy dissentiet, mei choro omnes fuisset ad. Te qui docendi accusam efficiantur, doming noster prodesset eam ei. In vel posse movet, ut convenire referrentur eum, ceteros singulis intellegam eu sit.\n    <p>\n\nSit saepe quaestio reprimique id, duo no congue nominati, cum id nobis facilisi. No est laoreet dissentias, idque consectetuer eam id. Clita possim assueverit cu his, solum virtute recteque et cum. Vel cu luptatum signiferumque, mel eu brute nostro senserit. Blandit euripidis consequat ex mei, atqui torquatos id cum, meliore luptatum ut usu. Cu zril perpetua gubergren pri. Accusamus rationibus instructior ei pro, eu nullam principes qui, reque justo omnes et quo.\n    <p>\n\nSint unum eam id. At sit fastidii theophrastus, mutat senserit repudiare et has. Atqui appareat repudiare ad nam, et ius alii incorrupte. Alii nullam libris his ei, meis aeterno at eum. Ne aeque tincidunt duo. In audire malorum mel, tamquam efficiantur has te.\n    <p>\n\nQui utamur tacimates quaestio ad, quod graece omnium ius ut. Pri ut vero debitis interpretaris, qui cu mentitum adipiscing disputationi. Voluptatum mediocritatem quo ut. Fabulas dolorem ei has, quem molestie persequeris et sit.\n    <p>\n\nEst in vivendum comprehensam conclusionemque, alia cetero iriure no usu, te cibo deterruisset pro. Ludus epicurei quo id, ex cum iudicabit intellegebat. Ex modo deseruisse quo, mel noster menandri sententiae ea, duo et tritani malorum recteque. Nullam suscipit partiendo nec id, indoctum vulputate per ex. Et has enim habemus tibique. Cu latine electram cum, ridens propriae intellegat eu mea.\n    <p>\n\nDuo at aliquid mnesarchum, nec ne impetus hendrerit. Ius id aeterno debitis atomorum, et sed feugait voluptua, brute tibique no vix. Eos modo esse ex, ei omittam imperdiet pro. Vel assum albucius incorrupte no. Vim viris prompta repudiare ne, vel ut viderer scripserit, dicant appetere argumentum mel ea. Eripuit feugait tincidunt pri ne, cu facilisi molestiae usu.\n    <p>\n\nSolet propriae duo in, ne suas molestiae reprehendunt nam. Assum nobis id est, eam vituperata definitiones ex. Te quem admodum voluptua eos, ex affert voluptatibus ius, ad paulo oblique has. Ea quodsi disputando sit, vel ex adhuc simul, quot graeci constituam an eos. Vidit explicari forensibus eu sit, ei mel meliore prodesset. Clita ubique eu sit, errem voluptatibus usu ut, libris nominavi ei mei. Est prima disputando no, te liber possit laoreet vel, pri ut tota consul populo.\n    <p>\n\nEu everti nominati usu. No sea dicunt suscipit intellegebat, ea eum movet putent maiorum. Mei admodum periculis at, inani essent his eu. Cum cu altera dictas, sit ei novum appetere. Ne viris melius eos, eu illud velit decore vix, eos recteque disputationi et.\n    <p>\n\nMea tritani commune id, habeo audiam at per. Vim no duis aliquip deleniti. Iuvaret menandri definiebas ne est. Te platonem adolescens duo, mentitum recteque referrentur est ne, pri viris aeterno accusata ea. Erat aeque ancillae mei et, eu qui dicit latine probatus, eum in sint docendi alienum.\n    <p>\n\nEx dicit malorum maiestatis quo, corpora scriptorem ea vel. Per choro eripuit repudiare cu, eum summo elitr postulant ex. Per ut veri maiestatis, eruditi propriae contentiones ei est, pri in option eleifend. Duo hinc temporibus ut, fugit dolor pri an. Exerci postea volumus his ex.\n    <p>\n\nVis decore mandamus interpretaris ad, ferri mandamus consequuntur nec id. Habeo solet voluptatibus nec an. Dico vocibus has at, pro possim nonumes forensibus ut. Ubique docendi neglegentur an eum, omnium commodo eu his. Eam eligendi dissentiunt at, ne eam commodo interesset.\n    <p>\n\nEt vocibus repudiandae eum. Id eripuit incorrupte dissentiet cum, cu has tractatos intellegat scribentur. Probo ipsum ea vim, ei eos eros utamur, sea eu dolore populo praesent. Vis magna vituperata et, vide dictas labores vis cu.\n    <p>\n\nSummo tractatos eu has, et his ipsum erant explicari. Ne vim causae facilisis laboramus, pro an soleat semper consectetuer, posse dicant usu cu. Populo oporteat ut vix, nam simul offendit gloriatur at. Delicata salutandi facilisis no mel, ius lorem nusquam ea. Et mea simul labores, in persius debitis cum.\n    <p>\n\nEum et cibo iuvaret nostrum. Cu nec altera definiebas. Mei quod novum movet an, mel ad meis graece. Iriure graecis nominavi id vel. Qui falli everti cotidieque cu, zril evertitur quo no. Sed tollit invenire id. Nisl meliore tacimates cu vix, hinc consequat nec ex, usu lorem latine an.\n    <p>\n\nNam splendide consectetuer no, laudem perfecto eum at. His pericula vulputate ei, commune intellegebat at mei. Ad tation fierent liberavisse mel, ut his denique accommodare contentiones, sea at consequat sententiae. Alia insolens vituperata ex nec, quo virtute delicatissimi ex, saperet accusata ut nec. Quis ancillae eu sed. Sea eu prompta verterem expetendis, et nam etiam vivendo disputationi, no has soleat eirmod.\n    <p>\n\nFastidii efficiendi no vis, autem aeterno malorum an quo. Per et meis necessitatibus, ex eam option bonorum dissentiet. Usu ei nobis partem constituto, sensibus mediocrem in est. Eu illum efficiantur his. Ex tota erant aperiri vis, altera nominati an sea, sed et tota nostro.\n    <p>\n\nId utinam nullam voluptaria cum, meis novum doming no eum, mei ex nusquam eligendi offendit. Eu sit movet praesent persequeris, dolores lobortis ullamcorper eu vel, ea vis possit feugiat. Quo ut dictas suscipit contentiones, an quis quodsi sanctus qui. Duis iudicabit an est, te quot nonumy putant mei. Quo insolens interpretaris et, per ex illud albucius mentitum.\n    <p>\n\nEu labores invidunt eloquentiam vis. Usu vitae fastidii expetendis id. Modus soleat prompta eos ad, ea mea dolore ubique definitiones, pri no lorem audire. Vivendo lucilius pro ut, at sumo quidam legimus cum. Mentitum incorrupte ex vis.\n  </material-content>\n\n</div>\n",
          "componentId": "material.components.content",
          "componentName": "Content",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Content Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/content/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.content/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/content/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n",
              "componentId": "material.components.content",
              "componentName": "Content",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Content Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/content/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.content/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n\n"
            }
          ],
          "css": [],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" layout=\"vertical\">\n  <material-toolbar class=\"material-theme-dark\">\n    <div class=\"material-toolbar-tools\">\n      <span class=\"material-flex\">Toolbar: dark-theme</span>\n    </div>\n  </material-toolbar>\n\n  <material-content class=\"material-content-padding\">\n    Lorem ipsum dolor sit amet, ne quod novum mei. Sea omnium invenire mediocrem at, in lobortis conclusionemque nam. Ne deleniti appetere reprimique pro, inani labitur disputationi te sed. At vix sale omnesque, id pro labitur reformidans accommodare, cum labores honestatis eu. Nec quem lucilius in, eam praesent reformidans no. Sed laudem aliquam ne.\n\n    <p>\nFacete delenit argumentum cum at. Pro rebum nostrum contentiones ad. Mel exerci tritani maiorum at, mea te audire phaedrum, mel et nibh aliquam. Malis causae equidem vel eu. Noster melius vis ea, duis alterum oporteat ea sea. Per cu vide munere fierent.\n\n    <p>\nAd sea dolor accusata consequuntur. Sit facete convenire reprehendunt et. Usu cu nonumy dissentiet, mei choro omnes fuisset ad. Te qui docendi accusam efficiantur, doming noster prodesset eam ei. In vel posse movet, ut convenire referrentur eum, ceteros singulis intellegam eu sit.\n    <p>\n\nSit saepe quaestio reprimique id, duo no congue nominati, cum id nobis facilisi. No est laoreet dissentias, idque consectetuer eam id. Clita possim assueverit cu his, solum virtute recteque et cum. Vel cu luptatum signiferumque, mel eu brute nostro senserit. Blandit euripidis consequat ex mei, atqui torquatos id cum, meliore luptatum ut usu. Cu zril perpetua gubergren pri. Accusamus rationibus instructior ei pro, eu nullam principes qui, reque justo omnes et quo.\n    <p>\n\nSint unum eam id. At sit fastidii theophrastus, mutat senserit repudiare et has. Atqui appareat repudiare ad nam, et ius alii incorrupte. Alii nullam libris his ei, meis aeterno at eum. Ne aeque tincidunt duo. In audire malorum mel, tamquam efficiantur has te.\n    <p>\n\nQui utamur tacimates quaestio ad, quod graece omnium ius ut. Pri ut vero debitis interpretaris, qui cu mentitum adipiscing disputationi. Voluptatum mediocritatem quo ut. Fabulas dolorem ei has, quem molestie persequeris et sit.\n    <p>\n\nEst in vivendum comprehensam conclusionemque, alia cetero iriure no usu, te cibo deterruisset pro. Ludus epicurei quo id, ex cum iudicabit intellegebat. Ex modo deseruisse quo, mel noster menandri sententiae ea, duo et tritani malorum recteque. Nullam suscipit partiendo nec id, indoctum vulputate per ex. Et has enim habemus tibique. Cu latine electram cum, ridens propriae intellegat eu mea.\n    <p>\n\nDuo at aliquid mnesarchum, nec ne impetus hendrerit. Ius id aeterno debitis atomorum, et sed feugait voluptua, brute tibique no vix. Eos modo esse ex, ei omittam imperdiet pro. Vel assum albucius incorrupte no. Vim viris prompta repudiare ne, vel ut viderer scripserit, dicant appetere argumentum mel ea. Eripuit feugait tincidunt pri ne, cu facilisi molestiae usu.\n    <p>\n\nSolet propriae duo in, ne suas molestiae reprehendunt nam. Assum nobis id est, eam vituperata definitiones ex. Te quem admodum voluptua eos, ex affert voluptatibus ius, ad paulo oblique has. Ea quodsi disputando sit, vel ex adhuc simul, quot graeci constituam an eos. Vidit explicari forensibus eu sit, ei mel meliore prodesset. Clita ubique eu sit, errem voluptatibus usu ut, libris nominavi ei mei. Est prima disputando no, te liber possit laoreet vel, pri ut tota consul populo.\n    <p>\n\nEu everti nominati usu. No sea dicunt suscipit intellegebat, ea eum movet putent maiorum. Mei admodum periculis at, inani essent his eu. Cum cu altera dictas, sit ei novum appetere. Ne viris melius eos, eu illud velit decore vix, eos recteque disputationi et.\n    <p>\n\nMea tritani commune id, habeo audiam at per. Vim no duis aliquip deleniti. Iuvaret menandri definiebas ne est. Te platonem adolescens duo, mentitum recteque referrentur est ne, pri viris aeterno accusata ea. Erat aeque ancillae mei et, eu qui dicit latine probatus, eum in sint docendi alienum.\n    <p>\n\nEx dicit malorum maiestatis quo, corpora scriptorem ea vel. Per choro eripuit repudiare cu, eum summo elitr postulant ex. Per ut veri maiestatis, eruditi propriae contentiones ei est, pri in option eleifend. Duo hinc temporibus ut, fugit dolor pri an. Exerci postea volumus his ex.\n    <p>\n\nVis decore mandamus interpretaris ad, ferri mandamus consequuntur nec id. Habeo solet voluptatibus nec an. Dico vocibus has at, pro possim nonumes forensibus ut. Ubique docendi neglegentur an eum, omnium commodo eu his. Eam eligendi dissentiunt at, ne eam commodo interesset.\n    <p>\n\nEt vocibus repudiandae eum. Id eripuit incorrupte dissentiet cum, cu has tractatos intellegat scribentur. Probo ipsum ea vim, ei eos eros utamur, sea eu dolore populo praesent. Vis magna vituperata et, vide dictas labores vis cu.\n    <p>\n\nSummo tractatos eu has, et his ipsum erant explicari. Ne vim causae facilisis laboramus, pro an soleat semper consectetuer, posse dicant usu cu. Populo oporteat ut vix, nam simul offendit gloriatur at. Delicata salutandi facilisis no mel, ius lorem nusquam ea. Et mea simul labores, in persius debitis cum.\n    <p>\n\nEum et cibo iuvaret nostrum. Cu nec altera definiebas. Mei quod novum movet an, mel ad meis graece. Iriure graecis nominavi id vel. Qui falli everti cotidieque cu, zril evertitur quo no. Sed tollit invenire id. Nisl meliore tacimates cu vix, hinc consequat nec ex, usu lorem latine an.\n    <p>\n\nNam splendide consectetuer no, laudem perfecto eum at. His pericula vulputate ei, commune intellegebat at mei. Ad tation fierent liberavisse mel, ut his denique accommodare contentiones, sea at consequat sententiae. Alia insolens vituperata ex nec, quo virtute delicatissimi ex, saperet accusata ut nec. Quis ancillae eu sed. Sea eu prompta verterem expetendis, et nam etiam vivendo disputationi, no has soleat eirmod.\n    <p>\n\nFastidii efficiendi no vis, autem aeterno malorum an quo. Per et meis necessitatibus, ex eam option bonorum dissentiet. Usu ei nobis partem constituto, sensibus mediocrem in est. Eu illum efficiantur his. Ex tota erant aperiri vis, altera nominati an sea, sed et tota nostro.\n    <p>\n\nId utinam nullam voluptaria cum, meis novum doming no eum, mei ex nusquam eligendi offendit. Eu sit movet praesent persequeris, dolores lobortis ullamcorper eu vel, ea vis possit feugiat. Quo ut dictas suscipit contentiones, an quis quodsi sanctus qui. Duis iudicabit an est, te quot nonumy putant mei. Quo insolens interpretaris et, per ex illud albucius mentitum.\n    <p>\n\nEu labores invidunt eloquentiam vis. Usu vitae fastidii expetendis id. Modus soleat prompta eos ad, ea mea dolore ubique definitiones, pri no lorem audire. Vivendo lucilius pro ut, at sumo quidam legimus cum. Mentitum incorrupte ex vis.\n  </material-content>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.content/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.dialog",
    "name": "Dialog",
    "docs": [
      {
        "content": "Provides a dialog overlay, opened using the `$materialDialog` service.\n",
        "componentId": "material.components.dialog",
        "componentName": "Dialog",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/dialog/README.md",
        "humanName": "Dialog",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/dialog/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/dialog/README.md#Lundefined",
        "url": "/material.components.dialog/readme/overview",
        "outputPath": "generated/material.components.dialog/readme/overview/index.html",
        "readmeUrl": "/material.components.dialog/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Provides a dialog overlay, opened using the <code>$materialDialog</code> service.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The $materialDialog service opens a dialog over top of the app. \n\nSee the overview page for an example.\n\nThe `$materialDialog` service can be used as a function, which when called will open a\ndialog. Note: the dialog is always given an isolate scope.\n\nIt takes one argument, `options`, which is defined below.",
        "content": "@ngdoc service\n@name $materialDialog\n@module material.components.dialog\n\n@description\n\nThe $materialDialog service opens a dialog over top of the app. \n\nSee the overview page for an example.\n\nThe `$materialDialog` service can be used as a function, which when called will open a\ndialog. Note: the dialog is always given an isolate scope.\n\nIt takes one argument, `options`, which is defined below.\n\n@usage\n<hljs lang=\"html\">\n<div ng-controller=\"MyController\">\n  <material-button ng-click=\"openDialog($event)\">\n    Open a Dialog from this button!\n  </material-dialog>\n</div>\n</hljs>\n<hljs lang=\"js\">\nvar app = angular.module('app', ['ngMaterial']);\napp.controller('MyController', function($scope, $materialDialog) {\n  $scope.openDialog = function($event) {\n    var hideDialog = $materialDialog({\n      template: '<material-dialog>Hello!</material-dialog>',\n      targetEvent: $event\n    });\n  };\n});\n</hljs>\n\n@returns {function} `hideDialog` - A function that hides the dialog.\n\n@paramType Options\n@param {string=} templateUrl The url of a template that will be used as the content\nof the dialog. Restrictions: the template must have an outer `material-dialog` element. \nInside, use an element with class `dialog-content` for the dialog's content, and use\nan element with class `dialog-actions` for the dialog's actions.\n@param {string=} template Same as templateUrl, except this is an actual template string.\n@param {DOMClickEvent=} targetEvent A click's event object. When passed in as an option, \nthe location of the click will be used as the starting point for the opening animation\nof the the dialog.\n@param {boolean=} hasBackdrop Whether there should be an opaque backdrop behind the dialog.\n  Default true.\n@param {boolean=} clickOutsideToClose Whether the user can click outside the dialog to\n  close it. Default true.\n@param {boolean=} escapeToClose Whether the user can press escape to close the dialog.\n  Default true.\n@param {string=} controller The controller to associate with the dialog. The controller\nwill be injected with the local `$hideDialog`, which is a function used to hide the dialog.\n@param {object=} locals An object containing key/value pairs. The keys will be used as names\nof values to inject into the controller. For example, `locals: {three: 3}` would inject\n`three` into the controller, with the value 3.\n@param {object=} resolve Similar to locals, except it takes promises as values, and the\ntoast will not open until all of the promises resolve.\n@param {string=} controllerAs An alias to assign the controller to on the scope.\n@param {element=} appendTo The element to append the dialog to. Defaults to appending\n  to the root element of the application.",
        "componentId": "material.components.dialog",
        "componentName": "Dialog",
        "docType": "service",
        "name": "$materialDialog",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The url of a template that will be used as the content\nof the dialog. Restrictions: the template must have an outer `material-dialog` element. \nInside, use an element with class `dialog-content` for the dialog's content, and use\nan element with class `dialog-actions` for the dialog's actions.",
            "startingLine": 66,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "templateUrl"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Same as templateUrl, except this is an actual template string.",
            "startingLine": 70,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "template"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "A click's event object. When passed in as an option, \nthe location of the click will be used as the starting point for the opening animation\nof the the dialog.",
            "startingLine": 71,
            "typeExpression": "DOMClickEvent=",
            "type": {
              "type": "NameExpression",
              "name": "DOMClickEvent",
              "optional": true
            },
            "typeList": [
              "DOMClickEvent"
            ],
            "optional": true,
            "name": "targetEvent"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Whether there should be an opaque backdrop behind the dialog.\n  Default true.",
            "startingLine": 74,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "hasBackdrop"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Whether the user can click outside the dialog to\n  close it. Default true.",
            "startingLine": 76,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "clickOutsideToClose"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Whether the user can press escape to close the dialog.\n  Default true.",
            "startingLine": 78,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "escapeToClose"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The controller to associate with the dialog. The controller\nwill be injected with the local `$hideDialog`, which is a function used to hide the dialog.",
            "startingLine": 80,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "controller"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "An object containing key/value pairs. The keys will be used as names\nof values to inject into the controller. For example, `locals: {three: 3}` would inject\n`three` into the controller, with the value 3.",
            "startingLine": 82,
            "typeExpression": "object=",
            "type": {
              "type": "NameExpression",
              "name": "object",
              "optional": true
            },
            "typeList": [
              "object"
            ],
            "optional": true,
            "name": "locals"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Similar to locals, except it takes promises as values, and the\ntoast will not open until all of the promises resolve.",
            "startingLine": 85,
            "typeExpression": "object=",
            "type": {
              "type": "NameExpression",
              "name": "object",
              "optional": true
            },
            "typeList": [
              "object"
            ],
            "optional": true,
            "name": "resolve"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "An alias to assign the controller to on the scope.",
            "startingLine": 87,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "controllerAs"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The element to append the dialog to. Defaults to appending\n  to the root element of the application.",
            "startingLine": 88,
            "typeExpression": "element=",
            "type": {
              "type": "NameExpression",
              "name": "element",
              "optional": true
            },
            "typeList": [
              "element"
            ],
            "optional": true,
            "name": "appendTo"
          }
        ],
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<div ng-controller=\"MyController\">\n  <material-button ng-click=\"openDialog($event)\">\n    Open a Dialog from this button!\n  </material-dialog>\n</div>\n</hljs>\n<hljs lang=\"js\">\nvar app = angular.module('app', ['ngMaterial']);\napp.controller('MyController', function($scope, $materialDialog) {\n  $scope.openDialog = function($event) {\n    var hideDialog = $materialDialog({\n      template: '<material-dialog>Hello!</material-dialog>',\n      targetEvent: $event\n    });\n  };\n});\n</hljs>",
        "returns": {
          "tagDef": {
            "name": "returns",
            "aliases": [
              "return"
            ],
            "transforms": [
              null,
              null
            ]
          },
          "tagName": "returns",
          "description": "`hideDialog` - A function that hides the dialog.",
          "startingLine": 63,
          "typeExpression": "function",
          "type": {
            "type": "FunctionType",
            "params": []
          },
          "typeList": [
            "function"
          ]
        },
        "dependencies": [
          "material.animations",
          "material.services.compiler"
        ],
        "file": "src/components/dialog/dialog.js",
        "startingLine": 28,
        "paramType": "Options",
        "humanName": "$materialDialog",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/dialog/dialog.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/dialog/dialog.js#L28",
        "url": "/material.components.dialog/service/$materialDialog",
        "outputPath": "generated/material.components.dialog/service/$materialDialog/index.html",
        "readmeUrl": "/material.components.dialog/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n  \n\n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The $materialDialog service opens a dialog over top of the app. </p>\n<p>See the overview page for an example.</p>\n<p>The <code>$materialDialog</code> service can be used as a function, which when called will open a\ndialog. Note: the dialog is always given an isolate scope.</p>\n<p>It takes one argument, <code>options</code>, which is defined below.</p>\n\n</div>\n\n\n<div>\n  \n\n    \n\n  <h3 id=\"Usage\">Usage</h3>\n    \n      <hljs lang=\"html\">\n<div ng-controller=\"MyController\">\n  <material-button ng-click=\"openDialog($event)\">\n    Open a Dialog from this button!\n  </material-dialog>\n</div>\n</hljs>\n<hljs lang=\"js\">\nvar app = angular.module(&#39;app&#39;, [&#39;ngMaterial&#39;]);\napp.controller(&#39;MyController&#39;, function($scope, $materialDialog) {\n  $scope.openDialog = function($event) {\n    var hideDialog = $materialDialog({\n      template: &#39;<material-dialog>Hello!</material-dialog>&#39;,\n      targetEvent: $event\n    });\n  };\n});\n</hljs>\n    \n\n    \n<section class=\"api-section\">\n  <h3>\n    \n      Options\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      templateUrl\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The url of a template that will be used as the content\nof the dialog. Restrictions: the template must have an outer <code>material-dialog</code> element. \nInside, use an element with class <code>dialog-content</code> for the dialog&#39;s content, and use\nan element with class <code>dialog-actions</code> for the dialog&#39;s actions.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      template\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Same as templateUrl, except this is an actual template string.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      targetEvent\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-domclickevent\">DOMClickEvent</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-domclickevent\">DOMClickEvent</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>A click&#39;s event object. When passed in as an option, \nthe location of the click will be used as the starting point for the opening animation\nof the the dialog.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      hasBackdrop\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Whether there should be an opaque backdrop behind the dialog.\n  Default true.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      clickOutsideToClose\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Whether the user can click outside the dialog to\n  close it. Default true.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      escapeToClose\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Whether the user can press escape to close the dialog.\n  Default true.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      controller\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The controller to associate with the dialog. The controller\nwill be injected with the local <code>$hideDialog</code>, which is a function used to hide the dialog.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      locals\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-object\">object</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-object\">object</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>An object containing key/value pairs. The keys will be used as names\nof values to inject into the controller. For example, <code>locals: {three: 3}</code> would inject\n<code>three</code> into the controller, with the value 3.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      resolve\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-object\">object</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-object\">object</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Similar to locals, except it takes promises as values, and the\ntoast will not open until all of the promises resolve.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      controllerAs\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>An alias to assign the controller to on the scope.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      appendTo\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-element\">element</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-element\">element</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The element to append the dialog to. Defaults to appending\n  to the root element of the application.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n    \n    <h3>Returns</h3>\n<material-list>\n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      \n<code class=\"api-type label type-hint type-hint-function\">function</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><code>hideDialog</code> - A function that hides the dialog.</p>\n\n    </div>\n  </material-item>\n</material-list>\n\n  \n  \n  \n\n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.dialog",
    "demos": [
      {
        "id": "demo1",
        "name": "Dialog Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "html",
            "file": "src/components/dialog/demo1/my-dialog.tmpl.html",
            "content": "<material-dialog>\n  <div class=\"dialog-content\">\n    <p>A banana is an edible fruit produced by several kinds of large herbaceous flowering plants in the genus Musa. (In some countries, bananas used for cooking may be called plantains.) The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in starch covered with a rind which may be green, yellow, red, purple, or brown when ripe. The fruits grow in clusters hanging from the top of the plant. Almost all modern edible parthenocarpic (seedless) bananas come from two wild species - acuminata and Musa balbisiana. The scientific names of most cultivated bananas are Musa acuminata + Musa balbisiana, and Musa + paradisiaca for the hybrid Musa acuminata balbisiana, depending on their genomic constitution. The old scientific name Musa sapientum is no longer used.\n\n      <p>Musa species are native to tropical Indomalaya and Australia, and are likely to have been first domesticated in Papua New Guinea. They are grown in at least 107 countries, primarily for their fruit, and to a lesser extent to make fiber, banana wine and banana beer and as ornamental plants.</p>\n  </div>\n  <div class=\"dialog-actions\" layout=\"horizontal\" layout-align=\"end\">\n    <material-button ng-click=\"close()\">\n      Okay\n    </material-button>\n  </div>\n</material-dialog>\n",
            "componentId": "material.components.dialog",
            "componentName": "Dialog",
            "basePath": "my-dialog.tmpl.html",
            "docType": "demo",
            "id": "demo1",
            "name": "Dialog Basic Usage",
            "fileName": "my-dialog.tmpl",
            "relativePath": "my-dialog.tmpl.html/src/components/dialog/demo1/my-dialog.tmpl.html",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.dialog/demo/demo1/my-dialog.tmpl.html",
            "viewType": "Template",
            "renderedContent": "<material-dialog>\n  <div class=\"dialog-content\">\n    <p>A banana is an edible fruit produced by several kinds of large herbaceous flowering plants in the genus Musa. (In some countries, bananas used for cooking may be called plantains.) The fruit is variable in size, color and firmness, but is usually elongated and curved, with soft flesh rich in starch covered with a rind which may be green, yellow, red, purple, or brown when ripe. The fruits grow in clusters hanging from the top of the plant. Almost all modern edible parthenocarpic (seedless) bananas come from two wild species - acuminata and Musa balbisiana. The scientific names of most cultivated bananas are Musa acuminata + Musa balbisiana, and Musa + paradisiaca for the hybrid Musa acuminata balbisiana, depending on their genomic constitution. The old scientific name Musa sapientum is no longer used.\n\n      <p>Musa species are native to tropical Indomalaya and Australia, and are likely to have been first domesticated in Papua New Guinea. They are grown in at least 107 countries, primarily for their fruit, and to a lesser extent to make fiber, banana wine and banana beer and as ornamental plants.</p>\n  </div>\n  <div class=\"dialog-actions\" layout=\"horizontal\" layout-align=\"end\">\n    <material-button ng-click=\"close()\">\n      Okay\n    </material-button>\n  </div>\n</material-dialog>\n\n"
          },
          {
            "fileType": "js",
            "file": "src/components/dialog/demo1/script.js",
            "content": "angular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialDialog) {\n\n  $scope.dialog = function(e) {\n    $materialDialog({\n      templateUrl: 'my-dialog.tmpl.html',\n      targetEvent: e,\n      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {\n        $scope.close = function() {\n          $hideDialog();\n        };\n      }]\n    });\n  };\n\n});\n",
            "componentId": "material.components.dialog",
            "componentName": "Dialog",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Dialog Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/dialog/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.dialog/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "angular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialDialog) {\n\n  $scope.dialog = function(e) {\n    $materialDialog({\n      templateUrl: 'my-dialog.tmpl.html',\n      targetEvent: e,\n      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {\n        $scope.close = function() {\n          $hideDialog();\n        };\n      }]\n    });\n  };\n\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/dialog/demo1/style.css",
            "content": ".full {\n  width: 100%;\n  height: 100%;\n}\n",
            "componentId": "material.components.dialog",
            "componentName": "Dialog",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Dialog Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/dialog/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.dialog/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": ".full {\n  width: 100%;\n  height: 100%;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/dialog/demo1/index.html",
          "content": "<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"inset full\">\n  <material-button class=\"material-button-colored\" ng-click=\"dialog($event)\">\n    Open a Dialog\n  </material-button>\n</div>\n",
          "componentId": "material.components.dialog",
          "componentName": "Dialog",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Dialog Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/dialog/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.dialog/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/dialog/demo1/script.js",
              "content": "angular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialDialog) {\n\n  $scope.dialog = function(e) {\n    $materialDialog({\n      templateUrl: 'my-dialog.tmpl.html',\n      targetEvent: e,\n      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {\n        $scope.close = function() {\n          $hideDialog();\n        };\n      }]\n    });\n  };\n\n});\n",
              "componentId": "material.components.dialog",
              "componentName": "Dialog",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Dialog Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/dialog/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.dialog/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "angular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialDialog) {\n\n  $scope.dialog = function(e) {\n    $materialDialog({\n      templateUrl: 'my-dialog.tmpl.html',\n      targetEvent: e,\n      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {\n        $scope.close = function() {\n          $hideDialog();\n        };\n      }]\n    });\n  };\n\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/dialog/demo1/style.css",
              "content": ".full {\n  width: 100%;\n  height: 100%;\n}\n",
              "componentId": "material.components.dialog",
              "componentName": "Dialog",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Dialog Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/dialog/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.dialog/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": ".full {\n  width: 100%;\n  height: 100%;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"inset full\">\n  <material-button class=\"material-button-colored\" ng-click=\"dialog($event)\">\n    Open a Dialog\n  </material-button>\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.dialog/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.form",
    "name": "Form",
    "docs": [
      {
        "content": "\n",
        "componentId": "material.components.form",
        "componentName": "Form",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/form/README.md",
        "humanName": "Form",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/form/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/form/README.md#Lundefined",
        "url": "/material.components.form/readme/overview",
        "outputPath": "generated/material.components.form/readme/overview/index.html",
        "readmeUrl": "/material.components.form/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    \n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "Use the `<material-input-group>` directive as the grouping parent of an `<material-input>` elements",
        "content": "@ngdoc directive\n@name materialInputGroup\n@module material.components.form\n@restrict E\n@description\nUse the `<material-input-group>` directive as the grouping parent of an `<material-input>` elements\n\n@usage \n<hljs lang=\"html\">\n<material-input-group>\n  <material-input type=\"text\" ng-model=\"myText\">\n</material-input-group>\n</hljs>",
        "componentId": "material.components.form",
        "componentName": "Form",
        "docType": "directive",
        "name": "materialInputGroup",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-input-group>\n  <material-input type=\"text\" ng-model=\"myText\">\n</material-input-group>\n</hljs>",
        "file": "src/components/form/form.js",
        "startingLine": 15,
        "humanName": "material-input-group",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/form/form.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/form/form.js#L15",
        "url": "/material.components.form/directive/materialInputGroup",
        "outputPath": "generated/material.components.form/directive/materialInputGroup/index.html",
        "readmeUrl": "/material.components.form/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>Use the <code>&lt;material-input-group&gt;</code> directive as the grouping parent of an <code>&lt;material-input&gt;</code> elements</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-input-group>\n  <material-input type=\"text\" ng-model=\"myText\">\n</material-input-group>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      },
      {
        "description": "Use the `<material-input>` directive as elements within a `<material-input-group>` container",
        "content": "@ngdoc directive\n@name materialInput\n@module material.components.form\n\n@restrict E\n\n@description\nUse the `<material-input>` directive as elements within a `<material-input-group>` container\n\n@usage\n<hljs lang=\"html\">\n<material-input-group>\n  <material-input type=\"text\" ng-model=\"user.fullName\">\n  <material-input type=\"text\" ng-model=\"user.email\">\n</material-input-group>\n</hljs>",
        "componentId": "material.components.form",
        "componentName": "Form",
        "docType": "directive",
        "name": "materialInput",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-input-group>\n  <material-input type=\"text\" ng-model=\"user.fullName\">\n  <material-input type=\"text\" ng-model=\"user.email\">\n</material-input-group>\n</hljs>",
        "file": "src/components/form/form.js",
        "startingLine": 44,
        "humanName": "material-input",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/form/form.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/form/form.js#L44",
        "url": "/material.components.form/directive/materialInput",
        "outputPath": "generated/material.components.form/directive/materialInput/index.html",
        "readmeUrl": "/material.components.form/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>Use the <code>&lt;material-input&gt;</code> directive as elements within a <code>&lt;material-input-group&gt;</code> container</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-input-group>\n  <material-input type=\"text\" ng-model=\"user.fullName\">\n  <material-input type=\"text\" ng-model=\"user.email\">\n</material-input-group>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.form",
    "demos": [
      {
        "id": "demo1",
        "name": "Form Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/form/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n  $scope.data = {};\n})\n\n.directive('ig', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    scope: {\n      fid: '@'\n    },\n    template: \n      '<material-input-group>' +\n        '<label for=\"{{fid}}\">Description</label>' +\n        '<material-input id=\"{{fid}}\" type=\"text\" ng-model=\"data.description\">' +\n      '</material-input-group>'\n  };\n});\n",
            "componentId": "material.components.form",
            "componentName": "Form",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Form Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/form/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.form/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n  $scope.data = {};\n})\n\n.directive('ig', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    scope: {\n      fid: '@'\n    },\n    template: \n      '<material-input-group>' +\n        '<label for=\"{{fid}}\">Description</label>' +\n        '<material-input id=\"{{fid}}\" type=\"text\" ng-model=\"data.description\">' +\n      '</material-input-group>'\n  };\n});\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/form/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" layout=\"vertical\">\n\n  <material-toolbar class=\"material-theme-dark material-tall\">\n    <div class=\"material-toolbar-tools\">\n      <ig fid=\"t1\" class=\"material-input-group-theme-light material-input-group-inverted\"></ig>\n      <ig fid=\"t2\" class=\"material-input-group-theme-light-blue material-input-group-inverted\"></ig>\n    </div>\n  </material-toolbar>\n\n  <material-content>\n    <form style=\"padding-left: 20px;\">\n      <ig fid=\"i1\" class=\"material-input-group-theme-light\"></ig>\n      <ig fid=\"i2\" class=\"material-input-group-theme-light-blue\"></ig>\n      <ig fid=\"i3\" class=\"material-input-group-theme-dark\"></ig>\n      <ig fid=\"i4\" class=\"material-input-group-theme-green\"></ig>\n      <ig fid=\"i5\" class=\"material-input-group-theme-yellow\"></ig>\n      <ig fid=\"i6\" class=\"material-input-group-theme-orange\"></ig>\n      <ig fid=\"i7\" class=\"material-input-group-theme-purple\"></ig>\n      <ig fid=\"i8\" class=\"material-input-group-theme-red\"></ig>\n    </form>\n  </material-content>\n\n</div>\n",
          "componentId": "material.components.form",
          "componentName": "Form",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Form Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/form/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.form/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/form/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n  $scope.data = {};\n})\n\n.directive('ig', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    scope: {\n      fid: '@'\n    },\n    template: \n      '<material-input-group>' +\n        '<label for=\"{{fid}}\">Description</label>' +\n        '<material-input id=\"{{fid}}\" type=\"text\" ng-model=\"data.description\">' +\n      '</material-input-group>'\n  };\n});\n",
              "componentId": "material.components.form",
              "componentName": "Form",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Form Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/form/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.form/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n  $scope.data = {};\n})\n\n.directive('ig', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    scope: {\n      fid: '@'\n    },\n    template: \n      '<material-input-group>' +\n        '<label for=\"{{fid}}\">Description</label>' +\n        '<material-input id=\"{{fid}}\" type=\"text\" ng-model=\"data.description\">' +\n      '</material-input-group>'\n  };\n});\n\n"
            }
          ],
          "css": [],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" layout=\"vertical\">\n\n  <material-toolbar class=\"material-theme-dark material-tall\">\n    <div class=\"material-toolbar-tools\">\n      <ig fid=\"t1\" class=\"material-input-group-theme-light material-input-group-inverted\"></ig>\n      <ig fid=\"t2\" class=\"material-input-group-theme-light-blue material-input-group-inverted\"></ig>\n    </div>\n  </material-toolbar>\n\n  <material-content>\n    <form style=\"padding-left: 20px;\">\n      <ig fid=\"i1\" class=\"material-input-group-theme-light\"></ig>\n      <ig fid=\"i2\" class=\"material-input-group-theme-light-blue\"></ig>\n      <ig fid=\"i3\" class=\"material-input-group-theme-dark\"></ig>\n      <ig fid=\"i4\" class=\"material-input-group-theme-green\"></ig>\n      <ig fid=\"i5\" class=\"material-input-group-theme-yellow\"></ig>\n      <ig fid=\"i6\" class=\"material-input-group-theme-orange\"></ig>\n      <ig fid=\"i7\" class=\"material-input-group-theme-purple\"></ig>\n      <ig fid=\"i8\" class=\"material-input-group-theme-red\"></ig>\n    </form>\n  </material-content>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.form/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.list",
    "name": "Lists",
    "docs": [
      {
        "content": "Lists, created using the `<material-list>` parent with `<material-item>` children.\n",
        "componentId": "material.components.list",
        "componentName": "Lists",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/list/README.md",
        "humanName": "Lists",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/list/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/list/README.md#Lundefined",
        "url": "/material.components.list/readme/overview",
        "outputPath": "generated/material.components.list/readme/overview/index.html",
        "readmeUrl": "/material.components.list/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Lists, created using the <code>&lt;material-list&gt;</code> parent with <code>&lt;material-item&gt;</code> children.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The `<material-list>` directive is a list container for 1..n `<material-item>` tags.",
        "content": "@ngdoc directive\n@name materialList\n@module material.components.list\n\n@restrict E\n\n@description\nThe `<material-list>` directive is a list container for 1..n `<material-item>` tags.\n\n@usage\n<hljs lang=\"html\">\n<material-list>\n <material-item ng-repeat=\"item in todos\">\n\n   <div class=\"material-tile-content\">\n     <h2>{{item.what}}</h2>\n     <h3>{{item.who}}</h3>\n     <p>\n       {{item.notes}}\n     </p>\n   </div>\n\n </material-item>\n</material-list>\n</hljs>",
        "componentId": "material.components.list",
        "componentName": "Lists",
        "docType": "directive",
        "name": "materialList",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-list>\n <material-item ng-repeat=\"item in todos\">\n\n   <div class=\"material-tile-content\">\n     <h2>{{item.what}}</h2>\n     <h3>{{item.who}}</h3>\n     <p>\n       {{item.notes}}\n     </p>\n   </div>\n\n </material-item>\n</material-list>\n</hljs>",
        "file": "src/components/list/list.js",
        "startingLine": 16,
        "humanName": "material-list",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/list/list.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/list/list.js#L16",
        "url": "/material.components.list/directive/materialList",
        "outputPath": "generated/material.components.list/directive/materialList/index.html",
        "readmeUrl": "/material.components.list/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-list&gt;</code> directive is a list container for 1..n <code>&lt;material-item&gt;</code> tags.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-list>\n <material-item ng-repeat=\"item in todos\">\n\n   <div class=\"material-tile-content\">\n     <h2>{{item.what}}</h2>\n     <h3>{{item.who}}</h3>\n     <p>\n       {{item.notes}}\n     </p>\n   </div>\n\n </material-item>\n</material-list>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      },
      {
        "description": "The `<material-item>` directive is a container intended for row items in a `<material-list>` container.",
        "content": "@ngdoc directive\n@name materialItem\n@module material.components.list\n\n@restrict E\n\n@description\nThe `<material-item>` directive is a container intended for row items in a `<material-list>` container.\n\n@usage\n<hljs lang=\"html\">\n <material-list>\n   <material-item>\n           Item content in list\n   </material-item>\n </material-list>\n</hljs>",
        "componentId": "material.components.list",
        "componentName": "Lists",
        "docType": "directive",
        "name": "materialItem",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n <material-list>\n   <material-item>\n           Item content in list\n   </material-item>\n </material-list>\n</hljs>",
        "file": "src/components/list/list.js",
        "startingLine": 52,
        "humanName": "material-item",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/list/list.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/list/list.js#L52",
        "url": "/material.components.list/directive/materialItem",
        "outputPath": "generated/material.components.list/directive/materialItem/index.html",
        "readmeUrl": "/material.components.list/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-item&gt;</code> directive is a container intended for row items in a <code>&lt;material-list&gt;</code> container.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n <material-list>\n   <material-item>\n           Item content in list\n   </material-item>\n </material-list>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.list",
    "demos": [
      {
        "id": "demo1",
        "name": "List Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/list/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n    $scope.todos = [\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n    ]\n\n});\n\n",
            "componentId": "material.components.list",
            "componentName": "Lists",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "List Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/list/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.list/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n    $scope.todos = [\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n    ]\n\n});\n\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/list/demo1/style.css",
            "content": "\n.face {\n  border-radius: 30px;\n  border: 1px solid #ddd;\n  width: 48px;\n  margin: 16px;\n}\n",
            "componentId": "material.components.list",
            "componentName": "Lists",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "List Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/list/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.list/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\n.face {\n  border-radius: 30px;\n  border: 1px solid #ddd;\n  width: 48px;\n  margin: 16px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/list/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n  <material-content>\n\n    <material-list>\n\n      <material-item ng-repeat=\"item in todos\">\n        <div class=\"material-tile-left\">\n            <img ng-src=\"{{item.face}}\" class=\"face\">\n        </div>\n        <div class=\"material-tile-content\">\n          <h2>{{item.what}}</h2>\n          <h3>{{item.who}}</h3>\n          <p>\n            {{item.notes}}\n          </p>\n        </div>\n      </material-item>\n\n    </material-list>\n\n  </material-content>\n</div>\n",
          "componentId": "material.components.list",
          "componentName": "Lists",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "List Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/list/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.list/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/list/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n    $scope.todos = [\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n    ]\n\n});\n\n",
              "componentId": "material.components.list",
              "componentName": "Lists",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "List Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/list/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.list/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n    $scope.todos = [\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n      {\n        face : '/img/list/60.jpeg',\n        what: 'Brunch this weekend?',\n        who: 'Min Li Chan',\n        when: '3:08PM',\n        notes: \" I'll be in your neighborhood doing errands\"\n      },\n    ]\n\n});\n\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/list/demo1/style.css",
              "content": "\n.face {\n  border-radius: 30px;\n  border: 1px solid #ddd;\n  width: 48px;\n  margin: 16px;\n}\n",
              "componentId": "material.components.list",
              "componentName": "Lists",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "List Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/list/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.list/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\n.face {\n  border-radius: 30px;\n  border: 1px solid #ddd;\n  width: 48px;\n  margin: 16px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n  <material-content>\n\n    <material-list>\n\n      <material-item ng-repeat=\"item in todos\">\n        <div class=\"material-tile-left\">\n            <img ng-src=\"{{item.face}}\" class=\"face\">\n        </div>\n        <div class=\"material-tile-content\">\n          <h2>{{item.what}}</h2>\n          <h3>{{item.who}}</h3>\n          <p>\n            {{item.notes}}\n          </p>\n        </div>\n      </material-item>\n\n    </material-list>\n\n  </material-content>\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.list/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.radioButton",
    "name": "Radio Button",
    "docs": [
      {
        "content": "Radio buttons, created using the `<material-radio-group>` parent with `<material-radio-button>` children.\n",
        "componentId": "material.components.radioButton",
        "componentName": "Radio Button",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/radioButton/README.md",
        "humanName": "Radio Button",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/radioButton/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/radioButton/README.md#Lundefined",
        "url": "/material.components.radioButton/readme/overview",
        "outputPath": "generated/material.components.radioButton/readme/overview/index.html",
        "readmeUrl": "/material.components.radioButton/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Radio buttons, created using the <code>&lt;material-radio-group&gt;</code> parent with <code>&lt;material-radio-button&gt;</code> children.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The `<material-radio-group>` directive identifies a grouping\ncontainer for the 1..n grouped material radio buttons; specified using nested\n`<material-radio-button>` tags.",
        "content": "@ngdoc directive\n@module material.components.radioButton\n@name materialRadioGroup\n\n@order 0\n@restrict E\n\n@description\nThe `<material-radio-group>` directive identifies a grouping\ncontainer for the 1..n grouped material radio buttons; specified using nested\n`<material-radio-button>` tags.\n\n@param {string} ngModel Assignable angular expression to data-bind to.\n@param {boolean=} noink Use of attribute indicates flag to disable ink ripple effects.\n\n@usage\n<hljs lang=\"html\">\n<material-radio-group ng-model=\"selected\">\n\n  <material-radio-button\n       ng-repeat=\"d in colorOptions\"\n       ng-value=\"d.value\">\n\n         {{ d.label }}\n\n  </material-radio-button>\n\n</material-radio-group>\n</hljs>",
        "componentId": "material.components.radioButton",
        "componentName": "Radio Button",
        "docType": "directive",
        "name": "materialRadioGroup",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Assignable angular expression to data-bind to.",
            "startingLine": 29,
            "typeExpression": "string",
            "type": {
              "type": "NameExpression",
              "name": "string"
            },
            "typeList": [
              "string"
            ],
            "name": "ngModel"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Use of attribute indicates flag to disable ink ripple effects.",
            "startingLine": 30,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "noink"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-radio-group ng-model=\"selected\">\n\n  <material-radio-button\n       ng-repeat=\"d in colorOptions\"\n       ng-value=\"d.value\">\n\n         {{ d.label }}\n\n  </material-radio-button>\n\n</material-radio-group>\n</hljs>",
        "order": "0",
        "dependencies": [
          "material.animations"
        ],
        "file": "src/components/radioButton/radioButton.js",
        "startingLine": 17,
        "humanName": "material-radio-group",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/radioButton/radioButton.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/radioButton/radioButton.js#L17",
        "url": "/material.components.radioButton/directive/materialRadioGroup",
        "outputPath": "generated/material.components.radioButton/directive/materialRadioGroup/index.html",
        "readmeUrl": "/material.components.radioButton/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-radio-group&gt;</code> directive identifies a grouping\ncontainer for the 1..n grouped material radio buttons; specified using nested\n<code>&lt;material-radio-button&gt;</code> tags.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-radio-group ng-model=\"selected\">\n\n  <material-radio-button\n       ng-repeat=\"d in colorOptions\"\n       ng-value=\"d.value\">\n\n         {{ d.label }}\n\n  </material-radio-button>\n\n</material-radio-group>\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngModel\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      \n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Assignable angular expression to data-bind to.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      noink\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Use of attribute indicates flag to disable ink ripple effects.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      },
      {
        "description": "The `<material-radio-button>`directive is the child directive required to be used within `<material-radioo-group>` elements.\n\nWhile similar to the `<input type=\"radio\" ng-model=\"\" value=\"\">` directive,\nthe `<material-radio-button>` directive provides material ink effects, ARIA support, and\nsupports use within named radio groups.",
        "content": "@ngdoc directive\n@module material.components.radioButton\n@name materialRadioButton\n\n@order 1\n@restrict E\n\n@description\nThe `<material-radio-button>`directive is the child directive required to be used within `<material-radioo-group>` elements.\n\nWhile similar to the `<input type=\"radio\" ng-model=\"\" value=\"\">` directive,\nthe `<material-radio-button>` directive provides material ink effects, ARIA support, and\nsupports use within named radio groups.\n\n@param {string} ngModel Assignable angular expression to data-bind to.\n@param {string=} ngChange Angular expression to be executed when input changes due to user\n   interaction with the input element.\n@param {string} ngValue Angular expression which sets the value to which the expression should\n   be set when selected.*\n@param {string} value The value to which the expression should be set when selected.\n@param {string=} name Property name of the form under which the control is published.\n\n@usage\n<hljs lang=\"html\">\n\n<material-radio-button value=\"1\">\n  Label 1\n</material-radio-button>\n\n<material-radio-button ng-model=\"color\" ng-value=\"specialValue\">\n  Green\n</material-radio-button>\n\n</hljs>",
        "componentId": "material.components.radioButton",
        "componentName": "Radio Button",
        "docType": "directive",
        "name": "materialRadioButton",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Assignable angular expression to data-bind to.",
            "startingLine": 117,
            "typeExpression": "string",
            "type": {
              "type": "NameExpression",
              "name": "string"
            },
            "typeList": [
              "string"
            ],
            "name": "ngModel"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Angular expression to be executed when input changes due to user\n   interaction with the input element.",
            "startingLine": 118,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "ngChange"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Angular expression which sets the value to which the expression should\n   be set when selected.*",
            "startingLine": 120,
            "typeExpression": "string",
            "type": {
              "type": "NameExpression",
              "name": "string"
            },
            "typeList": [
              "string"
            ],
            "name": "ngValue"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The value to which the expression should be set when selected.",
            "startingLine": 122,
            "typeExpression": "string",
            "type": {
              "type": "NameExpression",
              "name": "string"
            },
            "typeList": [
              "string"
            ],
            "name": "value"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Property name of the form under which the control is published.",
            "startingLine": 123,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "name"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n\n<material-radio-button value=\"1\">\n  Label 1\n</material-radio-button>\n\n<material-radio-button ng-model=\"color\" ng-value=\"specialValue\">\n  Green\n</material-radio-button>\n\n</hljs>",
        "order": "1",
        "dependencies": [
          "material.animations"
        ],
        "file": "src/components/radioButton/radioButton.js",
        "startingLine": 103,
        "humanName": "material-radio-button",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/radioButton/radioButton.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/radioButton/radioButton.js#L103",
        "url": "/material.components.radioButton/directive/materialRadioButton",
        "outputPath": "generated/material.components.radioButton/directive/materialRadioButton/index.html",
        "readmeUrl": "/material.components.radioButton/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-radio-button&gt;</code>directive is the child directive required to be used within <code>&lt;material-radioo-group&gt;</code> elements.</p>\n<p>While similar to the <code>&lt;input type=&quot;radio&quot; ng-model=&quot;&quot; value=&quot;&quot;&gt;</code> directive,\nthe <code>&lt;material-radio-button&gt;</code> directive provides material ink effects, ARIA support, and\nsupports use within named radio groups.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n\n<material-radio-button value=\"1\">\n  Label 1\n</material-radio-button>\n\n<material-radio-button ng-model=\"color\" ng-value=\"specialValue\">\n  Green\n</material-radio-button>\n\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngModel\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      \n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Assignable angular expression to data-bind to.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngChange\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Angular expression to be executed when input changes due to user\n   interaction with the input element.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngValue\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      \n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Angular expression which sets the value to which the expression should\n   be set when selected.*</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      value\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      \n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The value to which the expression should be set when selected.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      name\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Property name of the form under which the control is published.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.radioButton",
    "demos": [
      {
        "id": "demo1",
        "name": "Radio Button Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/radioButton/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    group1 : '2',\n    group2 : '6'\n  };\n\n  $scope.radioData = [\n    { label: 'Label 4', value: '4' },\n    { label: 'Label 5', value: '5' },\n    { label: 'Label 6', value: '6' }\n  ];\n\n  $scope.addItem = function() {\n    var r = Math.ceil(Math.random() * 1000);\n    $scope.radioData.push({ label: 'Label ' + r, value: r });\n  };\n\n  $scope.removeItem = function() {\n    $scope.radioData.pop();\n  };\n\n});\n",
            "componentId": "material.components.radioButton",
            "componentName": "Radio Button",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Radio Button Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/radioButton/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.radioButton/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    group1 : '2',\n    group2 : '6'\n  };\n\n  $scope.radioData = [\n    { label: 'Label 4', value: '4' },\n    { label: 'Label 5', value: '5' },\n    { label: 'Label 6', value: '6' }\n  ];\n\n  $scope.addItem = function() {\n    var r = Math.ceil(Math.random() * 1000);\n    $scope.radioData.push({ label: 'Label ' + r, value: r });\n  };\n\n  $scope.removeItem = function() {\n    $scope.radioData.pop();\n  };\n\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/radioButton/demo1/style.css",
            "content": "\nbody {\n  padding: 20px;\n}\n",
            "componentId": "material.components.radioButton",
            "componentName": "Radio Button",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Radio Button Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/radioButton/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.radioButton/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\nbody {\n  padding: 20px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/radioButton/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <p>\n    <material-button ng-click=\"addItem()\">Add</material-button>\n    <material-button ng-click=\"removeItem()\">Remove</material-button>\n  </p>\n\n  <material-radio-group ng-model=\"data.group1\">\n\n    <material-radio-button value=\"1\">\n      Label 1\n    </material-radio-button>\n\n    <material-radio-button value=\"2\" noink>\n      Label 2\n    </material-radio-button>\n\n    <material-radio-button value=\"3\">\n      Label 3\n    </material-radio-button>\n\n  </material-radio-group>\n\n  <p>Group 1 Selected: {{ data.group1 }}</p>\n\n    <material-radio-group ng-model=\"data.group2\">\n\n        <material-radio-button ng-repeat=\"d in radioData\" ng-value=\"d.value\">\n            {{ d.label }}\n        </material-radio-button>\n\n    </material-radio-group>\n\n    <p style=\"margin-bottom:50px\">Group 2 Selected: {{ data.group2 }}</p>\n\n\n\n</div>\n",
          "componentId": "material.components.radioButton",
          "componentName": "Radio Button",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Radio Button Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/radioButton/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.radioButton/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/radioButton/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    group1 : '2',\n    group2 : '6'\n  };\n\n  $scope.radioData = [\n    { label: 'Label 4', value: '4' },\n    { label: 'Label 5', value: '5' },\n    { label: 'Label 6', value: '6' }\n  ];\n\n  $scope.addItem = function() {\n    var r = Math.ceil(Math.random() * 1000);\n    $scope.radioData.push({ label: 'Label ' + r, value: r });\n  };\n\n  $scope.removeItem = function() {\n    $scope.radioData.pop();\n  };\n\n});\n",
              "componentId": "material.components.radioButton",
              "componentName": "Radio Button",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Radio Button Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/radioButton/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.radioButton/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    group1 : '2',\n    group2 : '6'\n  };\n\n  $scope.radioData = [\n    { label: 'Label 4', value: '4' },\n    { label: 'Label 5', value: '5' },\n    { label: 'Label 6', value: '6' }\n  ];\n\n  $scope.addItem = function() {\n    var r = Math.ceil(Math.random() * 1000);\n    $scope.radioData.push({ label: 'Label ' + r, value: r });\n  };\n\n  $scope.removeItem = function() {\n    $scope.radioData.pop();\n  };\n\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/radioButton/demo1/style.css",
              "content": "\nbody {\n  padding: 20px;\n}\n",
              "componentId": "material.components.radioButton",
              "componentName": "Radio Button",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Radio Button Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/radioButton/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.radioButton/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\nbody {\n  padding: 20px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <p>\n    <material-button ng-click=\"addItem()\">Add</material-button>\n    <material-button ng-click=\"removeItem()\">Remove</material-button>\n  </p>\n\n  <material-radio-group ng-model=\"data.group1\">\n\n    <material-radio-button value=\"1\">\n      Label 1\n    </material-radio-button>\n\n    <material-radio-button value=\"2\" noink>\n      Label 2\n    </material-radio-button>\n\n    <material-radio-button value=\"3\">\n      Label 3\n    </material-radio-button>\n\n  </material-radio-group>\n\n  <p>Group 1 Selected: {{ data.group1 }}</p>\n\n    <material-radio-group ng-model=\"data.group2\">\n\n        <material-radio-button ng-repeat=\"d in radioData\" ng-value=\"d.value\">\n            {{ d.label }}\n        </material-radio-button>\n\n    </material-radio-group>\n\n    <p style=\"margin-bottom:50px\">Group 2 Selected: {{ data.group2 }}</p>\n\n\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.radioButton/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.sidenav",
    "name": "Side Navigation",
    "docs": [
      {
        "content": "Left and right side navigation, created using the `<material-sidenav>` directive.\n",
        "componentId": "material.components.sidenav",
        "componentName": "Side Navigation",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/sidenav/README.md",
        "humanName": "Side Navigation",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/sidenav/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/sidenav/README.md#Lundefined",
        "url": "/material.components.sidenav/readme/overview",
        "outputPath": "generated/material.components.sidenav/readme/overview/index.html",
        "readmeUrl": "/material.components.sidenav/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Left and right side navigation, created using the <code>&lt;material-sidenav&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "A Sidenav component that can be opened and closed programatically.\n\nWhen used properly with a layout, it will seamleslly stay open on medium\nand larger screens, while being hidden by default on mobile devices.",
        "content": "@ngdoc directive\n@name materialSidenav\n@module material.components.sidenav\n@restrict E\n\n@description\n\nA Sidenav component that can be opened and closed programatically.\n\nWhen used properly with a layout, it will seamleslly stay open on medium\nand larger screens, while being hidden by default on mobile devices.\n\n@usage\n<hljs lang=\"html\">\n<div layout=\"horizontal\" ng-controller=\"MyController\">\n  <material-sidenav class=\"material-sidenav-left\">\n    Left Nav!\n  </material-sidenav>\n\n  <material-content>\n    Center Content\n    <material-button ng-click=\"openLeftMenu()\">\n      Open Left Menu\n    </material-button>\n  </material-content>\n\n  <material-sidenav class=\"material-sidenav-right\">\n    Right Nav!\n  </material-sidenav>\n</div>\n</hljs>\n\n<hljs lang=\"js\">\nvar app = angular.module('myApp', ['ngMaterial']);\napp.controller('MainController', function($scope, $materialSidenav) {\n  $scope.openLeftMenu = function() {\n    $materialSidenav('left').toggle();\n  };\n});\n</hljs>",
        "componentId": "material.components.sidenav",
        "componentName": "Side Navigation",
        "docType": "directive",
        "name": "materialSidenav",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<div layout=\"horizontal\" ng-controller=\"MyController\">\n  <material-sidenav class=\"material-sidenav-left\">\n    Left Nav!\n  </material-sidenav>\n\n  <material-content>\n    Center Content\n    <material-button ng-click=\"openLeftMenu()\">\n      Open Left Menu\n    </material-button>\n  </material-content>\n\n  <material-sidenav class=\"material-sidenav-right\">\n    Right Nav!\n  </material-sidenav>\n</div>\n</hljs>\n\n<hljs lang=\"js\">\nvar app = angular.module('myApp', ['ngMaterial']);\napp.controller('MainController', function($scope, $materialSidenav) {\n  $scope.openLeftMenu = function() {\n    $materialSidenav('left').toggle();\n  };\n});\n</hljs>",
        "dependencies": [
          "material.services.registry"
        ],
        "file": "src/components/sidenav/sidenav.js",
        "startingLine": 131,
        "humanName": "material-sidenav",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/sidenav/sidenav.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/sidenav/sidenav.js#L131",
        "url": "/material.components.sidenav/directive/materialSidenav",
        "outputPath": "generated/material.components.sidenav/directive/materialSidenav/index.html",
        "readmeUrl": "/material.components.sidenav/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>A Sidenav component that can be opened and closed programatically.</p>\n<p>When used properly with a layout, it will seamleslly stay open on medium\nand larger screens, while being hidden by default on mobile devices.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<div layout=\"horizontal\" ng-controller=\"MyController\">\n  <material-sidenav class=\"material-sidenav-left\">\n    Left Nav!\n  </material-sidenav>\n\n  <material-content>\n    Center Content\n    <material-button ng-click=\"openLeftMenu()\">\n      Open Left Menu\n    </material-button>\n  </material-content>\n\n  <material-sidenav class=\"material-sidenav-right\">\n    Right Nav!\n  </material-sidenav>\n</div>\n</hljs>\n\n<hljs lang=\"js\">\nvar app = angular.module(&#39;myApp&#39;, [&#39;ngMaterial&#39;]);\napp.controller(&#39;MainController&#39;, function($scope, $materialSidenav) {\n  $scope.openLeftMenu = function() {\n    $materialSidenav(&#39;left&#39;).toggle();\n  };\n});\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.sidenav",
    "demos": [
      {
        "id": "demo1",
        "name": "Side Navigation Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/sidenav/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.toggleLeft = function() {\n    $materialSidenav('left').toggle();\n  };\n  $scope.toggleRight = function() {\n    $materialSidenav('right').toggle();\n  };\n})\n\n.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('left').close();\n  };\n})\n\n.controller('RightCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('right').close();\n  };\n});\n",
            "componentId": "material.components.sidenav",
            "componentName": "Side Navigation",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Side Navigation Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/sidenav/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.sidenav/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.toggleLeft = function() {\n    $materialSidenav('left').toggle();\n  };\n  $scope.toggleRight = function() {\n    $materialSidenav('right').toggle();\n  };\n})\n\n.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('left').close();\n  };\n})\n\n.controller('RightCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('right').close();\n  };\n});\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/sidenav/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" layout=\"vertical\" layout-fill>\n\n  <!-- <material-toolbar class=\"material-theme-green\"> -->\n  <!--   <h1 class=\"material-toolbar-tools\"> -->\n  <!--     <span>Toolbar</span> -->\n  <!--   </h1> -->\n  <!-- </material-toolbar> -->\n\n  <section layout=\"horizontal\" layout-fill>\n\n    <material-sidenav class=\"material-sidenav-left material-whiteframe-z2\" component-id=\"left\">\n\n      <material-toolbar class=\"material-theme-indigo\">\n        <h1 class=\"material-toolbar-tools\">Sidenav Left</h1>\n      </material-toolbar>\n      <material-content class=\"material-content-padding\" ng-controller=\"LeftCtrl\">\n        <material-button ng-click=\"close()\" class=\"material-button-colored\" hide-md>\n          Close Sidenav Left\n        </material-button>\n      </material-content>\n\n    </material-sidenav>\n\n    <material-content flex class=\"material-content-padding\">\n\n      <div layout=\"vertical\" layout-fill layout-align=\"center center\">\n        <p>\n          On smaller devices, material-sidenav will be hidden by default. \n        </p>\n        <p>\n          On larger, it will be shown by default.\n        </p>\n\n        <div>\n          <material-button ng-click=\"toggleLeft()\"\n            class=\"material-button-colored\" hide-md>\n            Toggle left\n          </material-button>\n        </div>\n\n        <div>\n          <material-button ng-click=\"toggleRight()\"\n            class=\"material-button-colored\" hide-md>\n            Toggle right\n          </material-button>\n        </div>\n      </div>\n\n    </material-content>\n\n    <material-sidenav class=\"material-sidenav-right material-whiteframe-z2\" component-id=\"right\">\n\n      <material-toolbar class=\"material-theme-light\">\n        <h1 class=\"material-toolbar-tools\">Sidenav Right</h1>\n      </material-toolbar>\n      <material-content ng-controller=\"RightCtrl\" class=\"material-content-padding\">\n        <material-button ng-click=\"close()\" class=\"material-button-colored\" hide-md>\n          Close Sidenav Right\n        </material-button>\n      </material-content>\n\n    </material-sidenav>\n\n  </section>\n\n</div>\n<style>\np { text-align: center; }\n</style>\n",
          "componentId": "material.components.sidenav",
          "componentName": "Side Navigation",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Side Navigation Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/sidenav/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.sidenav/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/sidenav/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.toggleLeft = function() {\n    $materialSidenav('left').toggle();\n  };\n  $scope.toggleRight = function() {\n    $materialSidenav('right').toggle();\n  };\n})\n\n.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('left').close();\n  };\n})\n\n.controller('RightCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('right').close();\n  };\n});\n",
              "componentId": "material.components.sidenav",
              "componentName": "Side Navigation",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Side Navigation Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/sidenav/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.sidenav/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.toggleLeft = function() {\n    $materialSidenav('left').toggle();\n  };\n  $scope.toggleRight = function() {\n    $materialSidenav('right').toggle();\n  };\n})\n\n.controller('LeftCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('left').close();\n  };\n})\n\n.controller('RightCtrl', function($scope, $timeout, $materialSidenav) {\n  $scope.close = function() {\n    $materialSidenav('right').close();\n  };\n});\n\n"
            }
          ],
          "css": [],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" layout=\"vertical\" layout-fill>\n\n  <!-- <material-toolbar class=\"material-theme-green\"> -->\n  <!--   <h1 class=\"material-toolbar-tools\"> -->\n  <!--     <span>Toolbar</span> -->\n  <!--   </h1> -->\n  <!-- </material-toolbar> -->\n\n  <section layout=\"horizontal\" layout-fill>\n\n    <material-sidenav class=\"material-sidenav-left material-whiteframe-z2\" component-id=\"left\">\n\n      <material-toolbar class=\"material-theme-indigo\">\n        <h1 class=\"material-toolbar-tools\">Sidenav Left</h1>\n      </material-toolbar>\n      <material-content class=\"material-content-padding\" ng-controller=\"LeftCtrl\">\n        <material-button ng-click=\"close()\" class=\"material-button-colored\" hide-md>\n          Close Sidenav Left\n        </material-button>\n      </material-content>\n\n    </material-sidenav>\n\n    <material-content flex class=\"material-content-padding\">\n\n      <div layout=\"vertical\" layout-fill layout-align=\"center center\">\n        <p>\n          On smaller devices, material-sidenav will be hidden by default. \n        </p>\n        <p>\n          On larger, it will be shown by default.\n        </p>\n\n        <div>\n          <material-button ng-click=\"toggleLeft()\"\n            class=\"material-button-colored\" hide-md>\n            Toggle left\n          </material-button>\n        </div>\n\n        <div>\n          <material-button ng-click=\"toggleRight()\"\n            class=\"material-button-colored\" hide-md>\n            Toggle right\n          </material-button>\n        </div>\n      </div>\n\n    </material-content>\n\n    <material-sidenav class=\"material-sidenav-right material-whiteframe-z2\" component-id=\"right\">\n\n      <material-toolbar class=\"material-theme-light\">\n        <h1 class=\"material-toolbar-tools\">Sidenav Right</h1>\n      </material-toolbar>\n      <material-content ng-controller=\"RightCtrl\" class=\"material-content-padding\">\n        <material-button ng-click=\"close()\" class=\"material-button-colored\" hide-md>\n          Close Sidenav Right\n        </material-button>\n      </material-content>\n\n    </material-sidenav>\n\n  </section>\n\n</div>\n<style>\np { text-align: center; }\n</style>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.sidenav/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.slider",
    "name": "Slider",
    "docs": [
      {
        "content": "Simple range sliders, created using the `<material-slider>` directive.\n",
        "componentId": "material.components.slider",
        "componentName": "Slider",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/slider/README.md",
        "humanName": "Slider",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/slider/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/slider/README.md#Lundefined",
        "url": "/material.components.slider/readme/overview",
        "outputPath": "generated/material.components.slider/readme/overview/index.html",
        "readmeUrl": "/material.components.slider/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Simple range sliders, created using the <code>&lt;material-slider&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The `material-slider` directive creates a slider bar that you can use.\n\nSimply put a native `<input type=\"range\">` element inside of a\n`<material-slider>` container.\n\nOn the range input, all HTML5 range attributes are supported.",
        "content": "@ngdoc directive\n@name materialSlider\n@module material.components.slider\n@restrict E\n\n@description\nThe `material-slider` directive creates a slider bar that you can use.\n\nSimply put a native `<input type=\"range\">` element inside of a\n`<material-slider>` container.\n\nOn the range input, all HTML5 range attributes are supported.\n\n@usage\n<hljs lang=\"html\">\n<material-slider>\n  <input type=\"range\" ng-model=\"slideValue\" min=\"0\" max=\"100\">\n</material-slider>\n</hljs>",
        "componentId": "material.components.slider",
        "componentName": "Slider",
        "docType": "directive",
        "name": "materialSlider",
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-slider>\n  <input type=\"range\" ng-model=\"slideValue\" min=\"0\" max=\"100\">\n</material-slider>\n</hljs>",
        "file": "src/components/slider/slider.js",
        "startingLine": 12,
        "humanName": "material-slider",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/slider/slider.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/slider/slider.js#L12",
        "url": "/material.components.slider/directive/materialSlider",
        "outputPath": "generated/material.components.slider/directive/materialSlider/index.html",
        "readmeUrl": "/material.components.slider/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>material-slider</code> directive creates a slider bar that you can use.</p>\n<p>Simply put a native <code>&lt;input type=&quot;range&quot;&gt;</code> element inside of a\n<code>&lt;material-slider&gt;</code> container.</p>\n<p>On the range input, all HTML5 range attributes are supported.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-slider>\n  <input type=\"range\" ng-model=\"slideValue\" min=\"0\" max=\"100\">\n</material-slider>\n</hljs>\n  \n  </div>\n  \n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.slider",
    "demos": [
      {
        "id": "demo1",
        "name": "Slider Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/slider/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    slider1: 0,\n    slider2: 50,\n    slider3: 8,\n  }\n\n});\n",
            "componentId": "material.components.slider",
            "componentName": "Slider",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Slider Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/slider/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.slider/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    slider1: 0,\n    slider2: 50,\n    slider3: 8,\n  }\n\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/slider/demo1/style.css",
            "content": "\nbody {\n  padding: 20px;\n}\n",
            "componentId": "material.components.slider",
            "componentName": "Slider",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Slider Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/slider/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.slider/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\nbody {\n  padding: 20px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/slider/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-slider>\n    <input type=\"range\" ng-model=\"data.slider1\">\n  </material-slider>\n\n  <material-slider>\n    <input type=\"range\" ng-model=\"data.slider2\" min=\"33\" max=\"67\">\n  </material-slider>\n\n  <material-slider>\n    <input type=\"range\" ng-model=\"data.slider3\" min=\"-10\" max=\"10\" step=\"2\">\n  </material-slider>\n\n  <p>Slider 1: {{ data.slider1 }}</p>\n  <p>Slider 2: {{ data.slider2 }}</p>\n  <p>Slider 3: {{ data.slider3 }}</p>\n\n</div>\n",
          "componentId": "material.components.slider",
          "componentName": "Slider",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Slider Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/slider/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.slider/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/slider/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    slider1: 0,\n    slider2: 50,\n    slider3: 8,\n  }\n\n});\n",
              "componentId": "material.components.slider",
              "componentName": "Slider",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Slider Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/slider/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.slider/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n  $scope.data = {\n    slider1: 0,\n    slider2: 50,\n    slider3: 8,\n  }\n\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/slider/demo1/style.css",
              "content": "\nbody {\n  padding: 20px;\n}\n",
              "componentId": "material.components.slider",
              "componentName": "Slider",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Slider Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/slider/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.slider/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\nbody {\n  padding: 20px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-slider>\n    <input type=\"range\" ng-model=\"data.slider1\">\n  </material-slider>\n\n  <material-slider>\n    <input type=\"range\" ng-model=\"data.slider2\" min=\"33\" max=\"67\">\n  </material-slider>\n\n  <material-slider>\n    <input type=\"range\" ng-model=\"data.slider3\" min=\"-10\" max=\"10\" step=\"2\">\n  </material-slider>\n\n  <p>Slider 1: {{ data.slider1 }}</p>\n  <p>Slider 2: {{ data.slider2 }}</p>\n  <p>Slider 3: {{ data.slider3 }}</p>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.slider/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.tabs",
    "name": "Tabs",
    "docs": [
      {
        "content": "Tabs, created with the `<material-tabs>` directive provide *tabbed* navigation with different styles.\n\nThe Tabs component consists of clickable tabs that are aligned horizontally side-by-side. Features include for supports static or dynamic tab creation, a programmatic Tab API, responsive designs, and dynamic transitions through different tab contents.\n\n",
        "componentId": "material.components.tabs",
        "componentName": "Tabs",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/tabs/README.md",
        "humanName": "Tabs",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/tabs/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/tabs/README.md#Lundefined",
        "url": "/material.components.tabs/readme/overview",
        "outputPath": "generated/material.components.tabs/readme/overview/index.html",
        "readmeUrl": "/material.components.tabs/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Tabs, created with the <code>&lt;material-tabs&gt;</code> directive provide <em>tabbed</em> navigation with different styles.</p>\n<p>The Tabs component consists of clickable tabs that are aligned horizontally side-by-side. Features include for supports static or dynamic tab creation, a programmatic Tab API, responsive designs, and dynamic transitions through different tab contents.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "The `<material-tabs>` directive serves as the container for 1..n `<material-tab>` child directives to produces a Tabs components.\nIn turn, the nested `<material-tab>` directive is used to specify a tab label for the **header button** and a [optional] tab view\ncontent that will be associated with each tab button.\n\nBelow is the markup for its simplest usage:\n\n <hljs lang=\"html\">\n <material-tabs>\n   <material-tab label=\"Tab #1\"></material-tab>\n   <material-tab label=\"Tab #2\"></material-tab>\n   <material-tab label=\"Tab #3\"></material-tab>\n <material-tabs>\n </hljs>\n\nTabs supports three (3) usage scenarios:\n\n 1. Tabs (buttons only)\n 2. Tabs with internal view content\n 3. Tabs with external view content\n\n**Tab-only** support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views.\n**Tabs with internal views** are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.\n**Tabs with external view content** is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.\n\n> As a performance bonus, if the tab content is managed internally then the non-active (non-visible) tab contents are temporarily disconnected from the `$scope.$digest()` processes; which restricts and optimizes DOM updates to only the currently active tab.\n\nAdditional features also include:\n\n*  Content can include any markup.\n*  If a tab is disabled while active/selected, then the next tab will be auto-selected.\n*  If the currently active tab is the last tab, then next() action will select the first tab.\n*  Any markup (other than **`<material-tab>`** tags) will be transcluded into the tab header area BEFORE the tab buttons.",
        "content": "@ngdoc directive\n@name materialTabs\n@module material.components.tabs\n@order 0\n\n@restrict E\n\n@description\nThe `<material-tabs>` directive serves as the container for 1..n `<material-tab>` child directives to produces a Tabs components.\nIn turn, the nested `<material-tab>` directive is used to specify a tab label for the **header button** and a [optional] tab view\ncontent that will be associated with each tab button.\n\nBelow is the markup for its simplest usage:\n\n <hljs lang=\"html\">\n <material-tabs>\n   <material-tab label=\"Tab #1\"></material-tab>\n   <material-tab label=\"Tab #2\"></material-tab>\n   <material-tab label=\"Tab #3\"></material-tab>\n <material-tabs>\n </hljs>\n\nTabs supports three (3) usage scenarios:\n\n 1. Tabs (buttons only)\n 2. Tabs with internal view content\n 3. Tabs with external view content\n\n**Tab-only** support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views.\n**Tabs with internal views** are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.\n**Tabs with external view content** is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.\n\n> As a performance bonus, if the tab content is managed internally then the non-active (non-visible) tab contents are temporarily disconnected from the `$scope.$digest()` processes; which restricts and optimizes DOM updates to only the currently active tab.\n\nAdditional features also include:\n\n*  Content can include any markup.\n*  If a tab is disabled while active/selected, then the next tab will be auto-selected.\n*  If the currently active tab is the last tab, then next() action will select the first tab.\n*  Any markup (other than **`<material-tab>`** tags) will be transcluded into the tab header area BEFORE the tab buttons.\n\n@param {integer=} selected Index of the active/selected tab\n@param {boolean=} noink Flag indicates use of ripple ink effects\n@param {boolean=} nobar Flag indicates use of ink bar effects\n@param {boolean=} nostretch Flag indicates use of elastic animation for inkBar width and position changes\n@param {string=}  align-tabs Attribute to indicate position of tab buttons: bottom or top; default is `top`\n\n@usage\n<hljs lang=\"html\">\n<material-tabs selected=\"selectedIndex\" >\n  <img ng-src=\"/img/angular.png\" class=\"centered\">\n\n  <material-tab\n     ng-repeat=\"tab in tabs | orderBy:predicate:reversed\"\n     on-select=\"onTabSelected(tab)\"\n     on-deselect=\"announceDeselected(tab)\"\n     disabled=\"tab.disabled\" >\n\n      <material-tab-label>\n          {{tab.title}}\n          <img src=\"/img/removeTab.png\"\n               ng-click=\"removeTab(tab)\"\n               class=\"delete\" >\n      </material-tab-label>\n\n      {{tab.content}}\n\n  </material-tab>\n\n</material-tabs>\n</hljs>",
        "componentId": "material.components.tabs",
        "componentName": "Tabs",
        "docType": "directive",
        "name": "materialTabs",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Index of the active/selected tab",
            "startingLine": 73,
            "typeExpression": "integer=",
            "type": {
              "type": "NameExpression",
              "name": "integer",
              "optional": true
            },
            "typeList": [
              "integer"
            ],
            "optional": true,
            "name": "selected"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates use of ripple ink effects",
            "startingLine": 74,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "noink"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates use of ink bar effects",
            "startingLine": 75,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "nobar"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates use of elastic animation for inkBar width and position changes",
            "startingLine": 76,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "nostretch"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Attribute to indicate position of tab buttons: bottom or top; default is `top`",
            "startingLine": 77,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "align-tabs"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-tabs selected=\"selectedIndex\" >\n  <img ng-src=\"/img/angular.png\" class=\"centered\">\n\n  <material-tab\n     ng-repeat=\"tab in tabs | orderBy:predicate:reversed\"\n     on-select=\"onTabSelected(tab)\"\n     on-deselect=\"announceDeselected(tab)\"\n     disabled=\"tab.disabled\" >\n\n      <material-tab-label>\n          {{tab.title}}\n          <img src=\"/img/removeTab.png\"\n               ng-click=\"removeTab(tab)\"\n               class=\"delete\" >\n      </material-tab-label>\n\n      {{tab.content}}\n\n  </material-tab>\n\n</material-tabs>\n</hljs>",
        "order": "0",
        "dependencies": [
          "material.animations",
          "material.services.attrBind",
          "material.services.registry"
        ],
        "file": "src/components/tabs/tabs.js",
        "startingLine": 32,
        "humanName": "material-tabs",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/tabs/tabs.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/tabs/tabs.js#L32",
        "url": "/material.components.tabs/directive/materialTabs",
        "outputPath": "generated/material.components.tabs/directive/materialTabs/index.html",
        "readmeUrl": "/material.components.tabs/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>The <code>&lt;material-tabs&gt;</code> directive serves as the container for 1..n <code>&lt;material-tab&gt;</code> child directives to produces a Tabs components.\nIn turn, the nested <code>&lt;material-tab&gt;</code> directive is used to specify a tab label for the <strong>header button</strong> and a [optional] tab view\ncontent that will be associated with each tab button.</p>\n<p>Below is the markup for its simplest usage:</p>\n <hljs lang=\"html\">\n <material-tabs>\n   <material-tab label=\"Tab #1\"></material-tab>\n   <material-tab label=\"Tab #2\"></material-tab>\n   <material-tab label=\"Tab #3\"></material-tab>\n <material-tabs>\n </hljs>\n\n<p>Tabs supports three (3) usage scenarios:</p>\n<ol>\n<li>Tabs (buttons only)</li>\n<li>Tabs with internal view content</li>\n<li>Tabs with external view content</li>\n</ol>\n<p><strong>Tab-only</strong> support is useful when tab buttons are used for custom navigation regardless of any other components, content, or views.\n<strong>Tabs with internal views</strong> are the traditional usages where each tab has associated view content and the view switching is managed internally by the Tabs component.\n<strong>Tabs with external view content</strong> is often useful when content associated with each tab is independently managed and data-binding notifications announce tab selection changes.</p>\n<blockquote>\n<p>As a performance bonus, if the tab content is managed internally then the non-active (non-visible) tab contents are temporarily disconnected from the <code>$scope.$digest()</code> processes; which restricts and optimizes DOM updates to only the currently active tab.</p>\n</blockquote>\n<p>Additional features also include:</p>\n<ul>\n<li>Content can include any markup.</li>\n<li>If a tab is disabled while active/selected, then the next tab will be auto-selected.</li>\n<li>If the currently active tab is the last tab, then next() action will select the first tab.</li>\n<li>Any markup (other than <strong><code>&lt;material-tab&gt;</code></strong> tags) will be transcluded into the tab header area BEFORE the tab buttons.</li>\n</ul>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-tabs selected=\"selectedIndex\" >\n  <img ng-src=\"/img/angular.png\" class=\"centered\">\n\n  <material-tab\n     ng-repeat=\"tab in tabs | orderBy:predicate:reversed\"\n     on-select=\"onTabSelected(tab)\"\n     on-deselect=\"announceDeselected(tab)\"\n     disabled=\"tab.disabled\" >\n\n      <material-tab-label>\n          {{tab.title}}\n          <img src=\"/img/removeTab.png\"\n               ng-click=\"removeTab(tab)\"\n               class=\"delete\" >\n      </material-tab-label>\n\n      {{tab.content}}\n\n  </material-tab>\n\n</material-tabs>\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      selected\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-integer\">integer</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-integer\">integer</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Index of the active/selected tab</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      noink\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates use of ripple ink effects</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      nobar\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates use of ink bar effects</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      nostretch\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates use of elastic animation for inkBar width and position changes</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      align-tabs\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Attribute to indicate position of tab buttons: bottom or top; default is <code>top</code></p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      },
      {
        "description": "`<material-tab>` is the nested directive used [within `<material-tabs>`] to specify each tab with a **label** and optional *view content*\n\nIf the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more\ncomplex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested\nmarkup of the `<material-tab>` is used as the tab header markup.\n\nIf a tab **label** has been identified, then any **non-**`<material-tab-label>` markup\nwill be considered tab content and will be transcluded to the internal `<div class=\"tabs-content\">` container.\n\nThis container is used by the TabsController to show/hide the active tab's content view. This synchronization is\nautomatically managed by the internal TabsController whenever the tab selection changes. Selection changes can\nbe initiated via data binding changes, programmatic invocation, or user gestures.",
        "content": "@ngdoc directive\n@name materialTab\n@module material.components.tabs\n@order 1\n\n@restrict E\n\n@description\n`<material-tab>` is the nested directive used [within `<material-tabs>`] to specify each tab with a **label** and optional *view content*\n\nIf the `label` attribute is not specified, then an optional `<material-tab-label>` tag can be used to specified more\ncomplex tab header markup. If neither the **label** nor the **material-tab-label** are specified, then the nested\nmarkup of the `<material-tab>` is used as the tab header markup.\n\nIf a tab **label** has been identified, then any **non-**`<material-tab-label>` markup\nwill be considered tab content and will be transcluded to the internal `<div class=\"tabs-content\">` container.\n\nThis container is used by the TabsController to show/hide the active tab's content view. This synchronization is\nautomatically managed by the internal TabsController whenever the tab selection changes. Selection changes can\nbe initiated via data binding changes, programmatic invocation, or user gestures.\n\n@param {string=} label Optional attribute to specify a simple string as the tab label\n@param {boolean=} active Flag indicates if the tab is currently selected; normally the `<material-tabs selected=\"\">`; attribute is used instead.\n@param {boolean=} ngDisabled Flag indicates if the tab is disabled: not selectable with no ink effects\n@param {expression=} deselected Expression to be evaluated after the tab has been de-selected.\n@param {expression=} selected Expression to be evaluated after the tab has been selected.\n\n\n@usage\n\n<hljs lang=\"html\">\n<material-tab label=\"\" disabled=\"\" selected=\"\" deselected=\"\" >\n  <h3>My Tab content</h3>\n</material-tab>\n\n<material-tab >\n  <material-tab-label>\n    <h3>My Tab content</h3>\n  </material-tab-label>\n  <p>\n    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,\n    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae\n    dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,\n    sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n  </p>\n</material-tab>\n</hljs>",
        "componentId": "material.components.tabs",
        "componentName": "Tabs",
        "docType": "directive",
        "name": "materialTab",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Optional attribute to specify a simple string as the tab label",
            "startingLine": 481,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "label"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates if the tab is currently selected; normally the `<material-tabs selected=\"\">`; attribute is used instead.",
            "startingLine": 482,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "active"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Flag indicates if the tab is disabled: not selectable with no ink effects",
            "startingLine": 483,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "ngDisabled"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Expression to be evaluated after the tab has been de-selected.",
            "startingLine": 484,
            "typeExpression": "expression=",
            "type": {
              "type": "NameExpression",
              "name": "expression",
              "optional": true
            },
            "typeList": [
              "expression"
            ],
            "optional": true,
            "name": "deselected"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Expression to be evaluated after the tab has been selected.",
            "startingLine": 485,
            "typeExpression": "expression=",
            "type": {
              "type": "NameExpression",
              "name": "expression",
              "optional": true
            },
            "typeList": [
              "expression"
            ],
            "optional": true,
            "name": "selected"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<material-tab label=\"\" disabled=\"\" selected=\"\" deselected=\"\" >\n  <h3>My Tab content</h3>\n</material-tab>\n\n<material-tab >\n  <material-tab-label>\n    <h3>My Tab content</h3>\n  </material-tab-label>\n  <p>\n    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,\n    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae\n    dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,\n    sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n  </p>\n</material-tab>\n</hljs>",
        "order": "1",
        "dependencies": [
          "material.animations",
          "material.services.attrBind",
          "material.services.registry"
        ],
        "file": "src/components/tabs/tabs.js",
        "startingLine": 460,
        "humanName": "material-tab",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/tabs/tabs.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/tabs/tabs.js#L460",
        "url": "/material.components.tabs/directive/materialTab",
        "outputPath": "generated/material.components.tabs/directive/materialTab/index.html",
        "readmeUrl": "/material.components.tabs/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p><code>&lt;material-tab&gt;</code> is the nested directive used [within <code>&lt;material-tabs&gt;</code>] to specify each tab with a <strong>label</strong> and optional <em>view content</em></p>\n<p>If the <code>label</code> attribute is not specified, then an optional <code>&lt;material-tab-label&gt;</code> tag can be used to specified more\ncomplex tab header markup. If neither the <strong>label</strong> nor the <strong>material-tab-label</strong> are specified, then the nested\nmarkup of the <code>&lt;material-tab&gt;</code> is used as the tab header markup.</p>\n<p>If a tab <strong>label</strong> has been identified, then any <strong>non-</strong><code>&lt;material-tab-label&gt;</code> markup\nwill be considered tab content and will be transcluded to the internal <code>&lt;div class=&quot;tabs-content&quot;&gt;</code> container.</p>\n<p>This container is used by the TabsController to show/hide the active tab&#39;s content view. This synchronization is\nautomatically managed by the internal TabsController whenever the tab selection changes. Selection changes can\nbe initiated via data binding changes, programmatic invocation, or user gestures.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<material-tab label=\"\" disabled=\"\" selected=\"\" deselected=\"\" >\n  <h3>My Tab content</h3>\n</material-tab>\n\n<material-tab >\n  <material-tab-label>\n    <h3>My Tab content</h3>\n  </material-tab-label>\n  <p>\n    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,\n    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae\n    dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,\n    sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n  </p>\n</material-tab>\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      label\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Optional attribute to specify a simple string as the tab label</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      active\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates if the tab is currently selected; normally the <code>&lt;material-tabs selected=&quot;&quot;&gt;</code>; attribute is used instead.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      ngDisabled\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Flag indicates if the tab is disabled: not selectable with no ink effects</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      deselected\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Expression to be evaluated after the tab has been de-selected.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      selected\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-expression\">expression</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Expression to be evaluated after the tab has been selected.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.tabs",
    "demos": [
      {
        "id": "demo1",
        "name": "Testimonials (tabs on bottom):",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/tabs/demos/demo1/script.js",
            "content": "angular.module( 'app', [ 'ngMaterial' ] )\n\n.controller('AppCtrl', function( $scope, $timeout ) {\n  var scrollID;\n\n  $scope.selected = 0;\n  $scope.enableAutoScroll = suspendAutoScroll;\n\n  autoScrollTabs();\n\n  /**\n   * Auto select next tab every 4 secs...\n   */\n  function autoScrollTabs() {\n    scrollID = $timeout(function(){\n      $scope.selected = ($scope.selected + 1)%3;\n      autoScrollTabs();\n    },4000);\n  }\n\n  /**\n   * Suspend auto scrolling while mouse is over the footer\n   * area.\n   */\n  function suspendAutoScroll(enabled) {\n    if ( !enabled ) {\n      $timeout.cancel( scrollID );\n    } else {\n      autoScrollTabs();\n    }\n  }\n\n});\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Testimonials (tabs on bottom):",
            "fileName": "script",
            "relativePath": "script.js/src/components/tabs/demos/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "angular.module( 'app', [ 'ngMaterial' ] )\n\n.controller('AppCtrl', function( $scope, $timeout ) {\n  var scrollID;\n\n  $scope.selected = 0;\n  $scope.enableAutoScroll = suspendAutoScroll;\n\n  autoScrollTabs();\n\n  /**\n   * Auto select next tab every 4 secs...\n   */\n  function autoScrollTabs() {\n    scrollID = $timeout(function(){\n      $scope.selected = ($scope.selected + 1)%3;\n      autoScrollTabs();\n    },4000);\n  }\n\n  /**\n   * Suspend auto scrolling while mouse is over the footer\n   * area.\n   */\n  function suspendAutoScroll(enabled) {\n    if ( !enabled ) {\n      $timeout.cancel( scrollID );\n    } else {\n      autoScrollTabs();\n    }\n  }\n\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/tabs/demos/demo1/style.css",
            "content": "\n\n\n/* @license\n * MyFonts Webfont Build ID 2656303, 2013-10-02T11:03:28-0400\n *\n * The fonts listed in this notice are subject to the End User License\n * Agreement(s) entered into by the website owner. All other parties are\n * explicitly restricted from using the Licensed Webfonts(s).\n *\n * You may obtain a valid license at the URLs below.\n *\n * Webfont: Avenir Next Pro Regular by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-regular/\n *\n * Webfont: Avenir Next Pro Medium by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-medium/\n *\n *\n * License: http://www.myfonts.com/viewlicense?type=web&buildid=2656303\n * Licensed pageviews: 250,000\n * Webfonts copyright: Copyright &#x00A9; 2004 - 2007 Linotype GmbH, www.linotype.com. All rights reserved. This font software may not be reproduced, modified, disclosed or transferred without the express written approval of Linotype GmbH. Avenir is a trademark of Linotype GmbH\n *\n * Â© 2013 MyFonts Inc\n*/\n/* @import must be at top of file, otherwise CSS will not work\n@import url(\"//hello.myfonts.net/count/28882f\");*/\n/* Avenir Next Pro */\n@font-face {\n    font-family: 'AvenirNextLTPro-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-Medium';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-UltLt';\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.ttf') format('truetype'); }\n\n/* Frieght Text Pro */\n@font-face {\n    font-family: 'FreightTextProBook-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'FreightTextProMedium-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.ttf') format('truetype'); }\n\n\n/*!\n * Bootstrap v3.0.0\n *\n * Copyright 2013 Twitter, Inc\n * Licensed under the Apache License v2.0\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Designed and built with all the love in the world by @mdo and @fat.\n */\n/*! normalize.css v2.1.0 | MIT License | git.io/normalize */\n\n*, *:before, *:after {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\nhtml {\n    font-size: 62.5%;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n\nbody {\n    font-family: \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\n    font-size: 15px;\n    line-height: 1.42857;\n    color: #333;\n    background-color: #fff;\n}\n\na {\n    color: #4F8EF7;\n    text-decoration: none;\n}\n\na:hover, a:focus {\n    color: #0b62ef;\n    text-decoration: underline;\n}\n\na:focus {\n    outline: none;\n}\n\nimg {\n    vertical-align: middle;\n}\n\np {\n    margin: 0 0 10.5px;\n}\n\nmaterial-tabs {\n    margin-left: 32px;\n}\n\nmaterial-tab {\n    padding: 10.5px 21px;\n    margin: 0 0 21px;\n    border-left: 5px solid #eeeeee;\n}\n\nmaterial-tab p {\n    font-weight: 300;\n    font-size: 16px;\n    line-height: 1.15;\n}\n\nmaterial-tab p:last-child {\n    margin-bottom: 0;\n}\n\nmaterial-tab small {\n    display: block;\n    line-height: 1.42857;\n    color: #999999;\n}\n\nmaterial-tab small:before {\n    content: '\\2014 \\00A0';\n}\n\n.testimonials material-tab {\n    margin: 0;\n    padding: 0;\n    border: none;\n}\n\n.testimonials .material-view p {\n    position: absolute;\n    display: block;\n    margin: 30px 0 0 20px;\n    padding: 5px 10px 15px 30px;\n    background: url('/img/testimonials/quote.png') no-repeat;\n    background-size: 25px 25px;\n    color: #888;\n    opacity: 0.0;\n}\n\n.material-view p.active {\n    -webkit-transition: opacity 0.9s;\n    transition: opacity 0.9s;\n    opacity: 1;\n}\n\n.testimonials footer {\n    background-size: 44px 40px;\n    background-repeat: no-repeat;\n    -webkit-transition: opacity 0.3s;\n    transition: opacity 0.3s;\n    margin-top:10px;\n    text-transform: none !important;\n}\n\n.testimonials footer div {\n    font-size:10px;\n}\n\n.testimonials material-tabs {\n    position: relative;\n    margin: 0 auto;\n    padding: 0 5px 0px 5px;\n    max-width: 1050px;\n}\n\n.testimonials .tabs-header {\n    position: absolute;\n    top: 100px;\n}\n\n\nmaterial-tabs, material-tabs .tabs-header .tabs-header-items {\n    background-color: #ffffff;\n}\n\nmaterial-tab {\n    text-align: inherit;\n    height: 50px;\n    color: #333;\n}\n\nmaterial-tab-label {\n    text-align: inherit;\n    margin-left: 30px;\n}\n\nmaterial-tab footer {\n    color: #333;\n    padding-left: 50px;\n    background-color: rgb(0,0,0,0);\n}\n\n\ncanvas.material-ink-ripple {\n    color: #d9d9d9;\n    border-radius: 8px;\n}\n\n\n\n@media (min-width: 568px) {\n    .testimonials {\n        position: relative;\n        height: 365px;\n        padding-top: 40px;\n    }\n\n\n    .material-view p {\n        position: absolute;\n        display: block;\n        margin: 20px 0 0 20px;\n        padding: 10px 80px 0 60px;\n        min-height: 150px;\n        background-size: 50px 50px;\n        color: #888;\n        text-align: center;\n        font-weight: normal;\n        font-size: 18px;\n        font-family: Georgia, serif;\n        line-height: 1.65;\n        -webkit-font-smoothing: antialiased;\n        opacity: 0.0;\n        -webkit-transition: opacity 0.4s;\n        transition: opacity 0.4s;\n    }\n\n    .material-view p.active {\n        display: block;\n        -webkit-transition: opacity 0.9s;\n        transition: opacity 0.9s;\n        opacity: 1;\n        font-size: 1.1em;\n    }\n\n    .testimonials footer {\n        margin-top:5px;\n        padding-top: 5px;\n        max-width: 230px;\n        width: 230px;\n        height: 65px;\n        background-size: 44px 40px;\n        font-size: 13px;\n        opacity: 0.4;\n        cursor: pointer;\n        padding-left: 45px;\n    }\n\n    .testimonials footer div {\n        font-size:11px;\n        margin-top:-20px;\n    }\n\n    .testimonials .active footer, .testimonials footer:hover {\n        opacity: 1;\n    }\n\n    .testimonials .active footer {\n        border-bottom: 2px solid #4F8EF7;\n    }\n\n    .testimonials cite {\n        color: #4F8EF7;\n        font-weight: 400;\n        font-size: 15px;\n        display:block;\n        margin-top:-12px;\n    }\n\n\n    .testimonial-content {\n        padding: 10px 10px 0 10px;\n    }\n\n    .testimonials material-tab {\n        height: 60px;\n    }\n\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 150px;\n    }\n}\n\n@media (min-width: 790px) {\n    .testimonials {\n        height: 380px;\n        padding-top: 40px;\n    }\n\n    .testimonials .material-view p {\n        font-size: 20px;\n        line-height: 38px;\n    }\n\n    .testimonials footer {\n        max-width: 265px;\n        width: 265px;\n        height: 94px;\n        background-size: 88px 80px;\n        padding-left: 90px;\n        margin-top:5px;\n    }\n\n    .testimonials footer div {\n        font-size:13px;\n        margin-top:-15px;\n    }\n\n    .testimonials cite {\n        font-size: 15px;\n        display:block;\n        margin-top:10px;\n    }\n\n    .testimonials material-tab {\n        height: 100px;\n    }\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 190px;\n    }\n}\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Testimonials (tabs on bottom):",
            "fileName": "style",
            "relativePath": "style.css/src/components/tabs/demos/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "\n\n\n/* @license\n * MyFonts Webfont Build ID 2656303, 2013-10-02T11:03:28-0400\n *\n * The fonts listed in this notice are subject to the End User License\n * Agreement(s) entered into by the website owner. All other parties are\n * explicitly restricted from using the Licensed Webfonts(s).\n *\n * You may obtain a valid license at the URLs below.\n *\n * Webfont: Avenir Next Pro Regular by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-regular/\n *\n * Webfont: Avenir Next Pro Medium by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-medium/\n *\n *\n * License: http://www.myfonts.com/viewlicense?type=web&buildid=2656303\n * Licensed pageviews: 250,000\n * Webfonts copyright: Copyright &#x00A9; 2004 - 2007 Linotype GmbH, www.linotype.com. All rights reserved. This font software may not be reproduced, modified, disclosed or transferred without the express written approval of Linotype GmbH. Avenir is a trademark of Linotype GmbH\n *\n * Â© 2013 MyFonts Inc\n*/\n/* @import must be at top of file, otherwise CSS will not work\n@import url(\"//hello.myfonts.net/count/28882f\");*/\n/* Avenir Next Pro */\n@font-face {\n    font-family: 'AvenirNextLTPro-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-Medium';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-UltLt';\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.ttf') format('truetype'); }\n\n/* Frieght Text Pro */\n@font-face {\n    font-family: 'FreightTextProBook-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'FreightTextProMedium-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.ttf') format('truetype'); }\n\n\n/*!\n * Bootstrap v3.0.0\n *\n * Copyright 2013 Twitter, Inc\n * Licensed under the Apache License v2.0\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Designed and built with all the love in the world by @mdo and @fat.\n */\n/*! normalize.css v2.1.0 | MIT License | git.io/normalize */\n\n*, *:before, *:after {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\nhtml {\n    font-size: 62.5%;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n\nbody {\n    font-family: \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\n    font-size: 15px;\n    line-height: 1.42857;\n    color: #333;\n    background-color: #fff;\n}\n\na {\n    color: #4F8EF7;\n    text-decoration: none;\n}\n\na:hover, a:focus {\n    color: #0b62ef;\n    text-decoration: underline;\n}\n\na:focus {\n    outline: none;\n}\n\nimg {\n    vertical-align: middle;\n}\n\np {\n    margin: 0 0 10.5px;\n}\n\nmaterial-tabs {\n    margin-left: 32px;\n}\n\nmaterial-tab {\n    padding: 10.5px 21px;\n    margin: 0 0 21px;\n    border-left: 5px solid #eeeeee;\n}\n\nmaterial-tab p {\n    font-weight: 300;\n    font-size: 16px;\n    line-height: 1.15;\n}\n\nmaterial-tab p:last-child {\n    margin-bottom: 0;\n}\n\nmaterial-tab small {\n    display: block;\n    line-height: 1.42857;\n    color: #999999;\n}\n\nmaterial-tab small:before {\n    content: '\\2014 \\00A0';\n}\n\n.testimonials material-tab {\n    margin: 0;\n    padding: 0;\n    border: none;\n}\n\n.testimonials .material-view p {\n    position: absolute;\n    display: block;\n    margin: 30px 0 0 20px;\n    padding: 5px 10px 15px 30px;\n    background: url('/img/testimonials/quote.png') no-repeat;\n    background-size: 25px 25px;\n    color: #888;\n    opacity: 0.0;\n}\n\n.material-view p.active {\n    -webkit-transition: opacity 0.9s;\n    transition: opacity 0.9s;\n    opacity: 1;\n}\n\n.testimonials footer {\n    background-size: 44px 40px;\n    background-repeat: no-repeat;\n    -webkit-transition: opacity 0.3s;\n    transition: opacity 0.3s;\n    margin-top:10px;\n    text-transform: none !important;\n}\n\n.testimonials footer div {\n    font-size:10px;\n}\n\n.testimonials material-tabs {\n    position: relative;\n    margin: 0 auto;\n    padding: 0 5px 0px 5px;\n    max-width: 1050px;\n}\n\n.testimonials .tabs-header {\n    position: absolute;\n    top: 100px;\n}\n\n\nmaterial-tabs, material-tabs .tabs-header .tabs-header-items {\n    background-color: #ffffff;\n}\n\nmaterial-tab {\n    text-align: inherit;\n    height: 50px;\n    color: #333;\n}\n\nmaterial-tab-label {\n    text-align: inherit;\n    margin-left: 30px;\n}\n\nmaterial-tab footer {\n    color: #333;\n    padding-left: 50px;\n    background-color: rgb(0,0,0,0);\n}\n\n\ncanvas.material-ink-ripple {\n    color: #d9d9d9;\n    border-radius: 8px;\n}\n\n\n\n@media (min-width: 568px) {\n    .testimonials {\n        position: relative;\n        height: 365px;\n        padding-top: 40px;\n    }\n\n\n    .material-view p {\n        position: absolute;\n        display: block;\n        margin: 20px 0 0 20px;\n        padding: 10px 80px 0 60px;\n        min-height: 150px;\n        background-size: 50px 50px;\n        color: #888;\n        text-align: center;\n        font-weight: normal;\n        font-size: 18px;\n        font-family: Georgia, serif;\n        line-height: 1.65;\n        -webkit-font-smoothing: antialiased;\n        opacity: 0.0;\n        -webkit-transition: opacity 0.4s;\n        transition: opacity 0.4s;\n    }\n\n    .material-view p.active {\n        display: block;\n        -webkit-transition: opacity 0.9s;\n        transition: opacity 0.9s;\n        opacity: 1;\n        font-size: 1.1em;\n    }\n\n    .testimonials footer {\n        margin-top:5px;\n        padding-top: 5px;\n        max-width: 230px;\n        width: 230px;\n        height: 65px;\n        background-size: 44px 40px;\n        font-size: 13px;\n        opacity: 0.4;\n        cursor: pointer;\n        padding-left: 45px;\n    }\n\n    .testimonials footer div {\n        font-size:11px;\n        margin-top:-20px;\n    }\n\n    .testimonials .active footer, .testimonials footer:hover {\n        opacity: 1;\n    }\n\n    .testimonials .active footer {\n        border-bottom: 2px solid #4F8EF7;\n    }\n\n    .testimonials cite {\n        color: #4F8EF7;\n        font-weight: 400;\n        font-size: 15px;\n        display:block;\n        margin-top:-12px;\n    }\n\n\n    .testimonial-content {\n        padding: 10px 10px 0 10px;\n    }\n\n    .testimonials material-tab {\n        height: 60px;\n    }\n\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 150px;\n    }\n}\n\n@media (min-width: 790px) {\n    .testimonials {\n        height: 380px;\n        padding-top: 40px;\n    }\n\n    .testimonials .material-view p {\n        font-size: 20px;\n        line-height: 38px;\n    }\n\n    .testimonials footer {\n        max-width: 265px;\n        width: 265px;\n        height: 94px;\n        background-size: 88px 80px;\n        padding-left: 90px;\n        margin-top:5px;\n    }\n\n    .testimonials footer div {\n        font-size:13px;\n        margin-top:-15px;\n    }\n\n    .testimonials cite {\n        font-size: 15px;\n        display:block;\n        margin-top:10px;\n    }\n\n    .testimonials material-tab {\n        height: 100px;\n    }\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 190px;\n    }\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/tabs/demos/demo1/index.html",
          "content": "<div class=\"testimonials\" ng-app=\"app\" ng-controller=\"AppCtrl\" >\n    <material-tabs selected=\"selected\" nobar tabs-align=\"bottom\" >\n\n        <material-tab>\n            <p ng-class=\"{active:selected==0}\">\n                I'm thrilled by the depth of thought behind Material Design's\n                specification for responsive application development.\n                Drifty's implementation for AngularJS makes it instantly\n                usable in your existing applications.\n            </p>\n            <material-tab-label>\n                <footer style=\"background-image: url(/img/testimonials/logo-bradgreen@2x.png)\"\n                        ng-mouseenter=\"enableAutoScroll(false);\"\n                        ng-mouseleave=\"enableAutoScroll(true);\" >\n                    <cite>Brad Green</cite>\n                    <div>\n                        Director, <a href=\"https://plus.google.com/+BradGreen/about\">Google</a>\n                    </div>\n                </footer>\n            </material-tab-label>\n        </material-tab>\n\n        <material-tab>\n            <p ng-class=\"{active:selected==1}\">\n                Using the Material Design specifications and lessons learned\n                from Angular & Polymer component development, our team has\n                created Angular Material. Implemented with advanced CSS and\n                Directives, Angular Material delivers an amazing UI SDK for\n                Angular SPA(s).\n            </p>\n            <material-tab-label>\n                <footer style=\"background-image: url(/img/testimonials/logo-thomasburleson@2x.png)\"\n                        ng-mouseenter=\"enableAutoScroll(false);\"\n                        ng-mouseleave=\"enableAutoScroll(true);\" >\n                    <cite>Thomas Burleson</cite>\n                    <div>\n                        i-Architect,\n                        <a href=\"http://solutionOptimist.com/\">Mindspace</a>\n                    </div>\n                </footer>\n            </material-tab-label>\n        </material-tab>\n\n        <material-tab>\n            <p ng-class=\"{active:selected==2}\">\n                I am so inspired with Angular Material. It fills a gap that's\n                missing when building for mobile and solves many complexities\n                that otherwise require multiple libraries, keeping your code\n                cleaner. Overall, it just makes mobile development fun and\n                fast, so you can build more!\n            </p>\n            <material-tab-label>\n                <footer style=\"background-image: url(/img/testimonials/logo-maxlynch@2x.png)\"\n                        ng-mouseenter=\"enableAutoScroll(false);\"\n                        ng-mouseleave=\"enableAutoScroll(true);\" >\n                    <cite>Max Lynch</cite>\n                    <div>\n                        Co-Founder,\n                        <a href=\"http://ionicframework.com/\">Drifty</a>\n                    </div>\n                </footer>\n            </material-tab-label>\n        </material-tab>\n\n\n    </material-tabs>\n</div>\n",
          "componentId": "material.components.tabs",
          "componentName": "Tabs",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Testimonials (tabs on bottom):",
          "fileName": "index",
          "relativePath": "index.html/src/components/tabs/demos/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.tabs/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/tabs/demos/demo1/script.js",
              "content": "angular.module( 'app', [ 'ngMaterial' ] )\n\n.controller('AppCtrl', function( $scope, $timeout ) {\n  var scrollID;\n\n  $scope.selected = 0;\n  $scope.enableAutoScroll = suspendAutoScroll;\n\n  autoScrollTabs();\n\n  /**\n   * Auto select next tab every 4 secs...\n   */\n  function autoScrollTabs() {\n    scrollID = $timeout(function(){\n      $scope.selected = ($scope.selected + 1)%3;\n      autoScrollTabs();\n    },4000);\n  }\n\n  /**\n   * Suspend auto scrolling while mouse is over the footer\n   * area.\n   */\n  function suspendAutoScroll(enabled) {\n    if ( !enabled ) {\n      $timeout.cancel( scrollID );\n    } else {\n      autoScrollTabs();\n    }\n  }\n\n});\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Testimonials (tabs on bottom):",
              "fileName": "script",
              "relativePath": "script.js/src/components/tabs/demos/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "angular.module( 'app', [ 'ngMaterial' ] )\n\n.controller('AppCtrl', function( $scope, $timeout ) {\n  var scrollID;\n\n  $scope.selected = 0;\n  $scope.enableAutoScroll = suspendAutoScroll;\n\n  autoScrollTabs();\n\n  /**\n   * Auto select next tab every 4 secs...\n   */\n  function autoScrollTabs() {\n    scrollID = $timeout(function(){\n      $scope.selected = ($scope.selected + 1)%3;\n      autoScrollTabs();\n    },4000);\n  }\n\n  /**\n   * Suspend auto scrolling while mouse is over the footer\n   * area.\n   */\n  function suspendAutoScroll(enabled) {\n    if ( !enabled ) {\n      $timeout.cancel( scrollID );\n    } else {\n      autoScrollTabs();\n    }\n  }\n\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/tabs/demos/demo1/style.css",
              "content": "\n\n\n/* @license\n * MyFonts Webfont Build ID 2656303, 2013-10-02T11:03:28-0400\n *\n * The fonts listed in this notice are subject to the End User License\n * Agreement(s) entered into by the website owner. All other parties are\n * explicitly restricted from using the Licensed Webfonts(s).\n *\n * You may obtain a valid license at the URLs below.\n *\n * Webfont: Avenir Next Pro Regular by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-regular/\n *\n * Webfont: Avenir Next Pro Medium by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-medium/\n *\n *\n * License: http://www.myfonts.com/viewlicense?type=web&buildid=2656303\n * Licensed pageviews: 250,000\n * Webfonts copyright: Copyright &#x00A9; 2004 - 2007 Linotype GmbH, www.linotype.com. All rights reserved. This font software may not be reproduced, modified, disclosed or transferred without the express written approval of Linotype GmbH. Avenir is a trademark of Linotype GmbH\n *\n * Â© 2013 MyFonts Inc\n*/\n/* @import must be at top of file, otherwise CSS will not work\n@import url(\"//hello.myfonts.net/count/28882f\");*/\n/* Avenir Next Pro */\n@font-face {\n    font-family: 'AvenirNextLTPro-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-Medium';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-UltLt';\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.ttf') format('truetype'); }\n\n/* Frieght Text Pro */\n@font-face {\n    font-family: 'FreightTextProBook-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'FreightTextProMedium-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.ttf') format('truetype'); }\n\n\n/*!\n * Bootstrap v3.0.0\n *\n * Copyright 2013 Twitter, Inc\n * Licensed under the Apache License v2.0\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Designed and built with all the love in the world by @mdo and @fat.\n */\n/*! normalize.css v2.1.0 | MIT License | git.io/normalize */\n\n*, *:before, *:after {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\nhtml {\n    font-size: 62.5%;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n\nbody {\n    font-family: \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\n    font-size: 15px;\n    line-height: 1.42857;\n    color: #333;\n    background-color: #fff;\n}\n\na {\n    color: #4F8EF7;\n    text-decoration: none;\n}\n\na:hover, a:focus {\n    color: #0b62ef;\n    text-decoration: underline;\n}\n\na:focus {\n    outline: none;\n}\n\nimg {\n    vertical-align: middle;\n}\n\np {\n    margin: 0 0 10.5px;\n}\n\nmaterial-tabs {\n    margin-left: 32px;\n}\n\nmaterial-tab {\n    padding: 10.5px 21px;\n    margin: 0 0 21px;\n    border-left: 5px solid #eeeeee;\n}\n\nmaterial-tab p {\n    font-weight: 300;\n    font-size: 16px;\n    line-height: 1.15;\n}\n\nmaterial-tab p:last-child {\n    margin-bottom: 0;\n}\n\nmaterial-tab small {\n    display: block;\n    line-height: 1.42857;\n    color: #999999;\n}\n\nmaterial-tab small:before {\n    content: '\\2014 \\00A0';\n}\n\n.testimonials material-tab {\n    margin: 0;\n    padding: 0;\n    border: none;\n}\n\n.testimonials .material-view p {\n    position: absolute;\n    display: block;\n    margin: 30px 0 0 20px;\n    padding: 5px 10px 15px 30px;\n    background: url('/img/testimonials/quote.png') no-repeat;\n    background-size: 25px 25px;\n    color: #888;\n    opacity: 0.0;\n}\n\n.material-view p.active {\n    -webkit-transition: opacity 0.9s;\n    transition: opacity 0.9s;\n    opacity: 1;\n}\n\n.testimonials footer {\n    background-size: 44px 40px;\n    background-repeat: no-repeat;\n    -webkit-transition: opacity 0.3s;\n    transition: opacity 0.3s;\n    margin-top:10px;\n    text-transform: none !important;\n}\n\n.testimonials footer div {\n    font-size:10px;\n}\n\n.testimonials material-tabs {\n    position: relative;\n    margin: 0 auto;\n    padding: 0 5px 0px 5px;\n    max-width: 1050px;\n}\n\n.testimonials .tabs-header {\n    position: absolute;\n    top: 100px;\n}\n\n\nmaterial-tabs, material-tabs .tabs-header .tabs-header-items {\n    background-color: #ffffff;\n}\n\nmaterial-tab {\n    text-align: inherit;\n    height: 50px;\n    color: #333;\n}\n\nmaterial-tab-label {\n    text-align: inherit;\n    margin-left: 30px;\n}\n\nmaterial-tab footer {\n    color: #333;\n    padding-left: 50px;\n    background-color: rgb(0,0,0,0);\n}\n\n\ncanvas.material-ink-ripple {\n    color: #d9d9d9;\n    border-radius: 8px;\n}\n\n\n\n@media (min-width: 568px) {\n    .testimonials {\n        position: relative;\n        height: 365px;\n        padding-top: 40px;\n    }\n\n\n    .material-view p {\n        position: absolute;\n        display: block;\n        margin: 20px 0 0 20px;\n        padding: 10px 80px 0 60px;\n        min-height: 150px;\n        background-size: 50px 50px;\n        color: #888;\n        text-align: center;\n        font-weight: normal;\n        font-size: 18px;\n        font-family: Georgia, serif;\n        line-height: 1.65;\n        -webkit-font-smoothing: antialiased;\n        opacity: 0.0;\n        -webkit-transition: opacity 0.4s;\n        transition: opacity 0.4s;\n    }\n\n    .material-view p.active {\n        display: block;\n        -webkit-transition: opacity 0.9s;\n        transition: opacity 0.9s;\n        opacity: 1;\n        font-size: 1.1em;\n    }\n\n    .testimonials footer {\n        margin-top:5px;\n        padding-top: 5px;\n        max-width: 230px;\n        width: 230px;\n        height: 65px;\n        background-size: 44px 40px;\n        font-size: 13px;\n        opacity: 0.4;\n        cursor: pointer;\n        padding-left: 45px;\n    }\n\n    .testimonials footer div {\n        font-size:11px;\n        margin-top:-20px;\n    }\n\n    .testimonials .active footer, .testimonials footer:hover {\n        opacity: 1;\n    }\n\n    .testimonials .active footer {\n        border-bottom: 2px solid #4F8EF7;\n    }\n\n    .testimonials cite {\n        color: #4F8EF7;\n        font-weight: 400;\n        font-size: 15px;\n        display:block;\n        margin-top:-12px;\n    }\n\n\n    .testimonial-content {\n        padding: 10px 10px 0 10px;\n    }\n\n    .testimonials material-tab {\n        height: 60px;\n    }\n\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 150px;\n    }\n}\n\n@media (min-width: 790px) {\n    .testimonials {\n        height: 380px;\n        padding-top: 40px;\n    }\n\n    .testimonials .material-view p {\n        font-size: 20px;\n        line-height: 38px;\n    }\n\n    .testimonials footer {\n        max-width: 265px;\n        width: 265px;\n        height: 94px;\n        background-size: 88px 80px;\n        padding-left: 90px;\n        margin-top:5px;\n    }\n\n    .testimonials footer div {\n        font-size:13px;\n        margin-top:-15px;\n    }\n\n    .testimonials cite {\n        font-size: 15px;\n        display:block;\n        margin-top:10px;\n    }\n\n    .testimonials material-tab {\n        height: 100px;\n    }\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 190px;\n    }\n}\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Testimonials (tabs on bottom):",
              "fileName": "style",
              "relativePath": "style.css/src/components/tabs/demos/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "\n\n\n/* @license\n * MyFonts Webfont Build ID 2656303, 2013-10-02T11:03:28-0400\n *\n * The fonts listed in this notice are subject to the End User License\n * Agreement(s) entered into by the website owner. All other parties are\n * explicitly restricted from using the Licensed Webfonts(s).\n *\n * You may obtain a valid license at the URLs below.\n *\n * Webfont: Avenir Next Pro Regular by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-regular/\n *\n * Webfont: Avenir Next Pro Medium by Linotype\n * URL: http://www.myfonts.com/fonts/linotype/avenir-next-pro/pro-medium/\n *\n *\n * License: http://www.myfonts.com/viewlicense?type=web&buildid=2656303\n * Licensed pageviews: 250,000\n * Webfonts copyright: Copyright &#x00A9; 2004 - 2007 Linotype GmbH, www.linotype.com. All rights reserved. This font software may not be reproduced, modified, disclosed or transferred without the express written approval of Linotype GmbH. Avenir is a trademark of Linotype GmbH\n *\n * Â© 2013 MyFonts Inc\n*/\n/* @import must be at top of file, otherwise CSS will not work\n@import url(\"//hello.myfonts.net/count/28882f\");*/\n/* Avenir Next Pro */\n@font-face {\n    font-family: 'AvenirNextLTPro-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-Medium';\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/28882F_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/28882F_1_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'AvenirNextLTPro-UltLt';\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29CC36_0_0.ttf') format('truetype'); }\n\n/* Frieght Text Pro */\n@font-face {\n    font-family: 'FreightTextProBook-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_0_0.ttf') format('truetype'); }\n\n@font-face {\n    font-family: 'FreightTextProMedium-Regular';\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot');\n    src: url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.eot?#iefix') format('embedded-opentype'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.woff') format('woff'), url('http://code.ionicframework.com/assets/fonts/29D26A_1_0.ttf') format('truetype'); }\n\n\n/*!\n * Bootstrap v3.0.0\n *\n * Copyright 2013 Twitter, Inc\n * Licensed under the Apache License v2.0\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Designed and built with all the love in the world by @mdo and @fat.\n */\n/*! normalize.css v2.1.0 | MIT License | git.io/normalize */\n\n*, *:before, *:after {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\nhtml {\n    font-size: 62.5%;\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\n\nbody {\n    font-family: \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\n    font-size: 15px;\n    line-height: 1.42857;\n    color: #333;\n    background-color: #fff;\n}\n\na {\n    color: #4F8EF7;\n    text-decoration: none;\n}\n\na:hover, a:focus {\n    color: #0b62ef;\n    text-decoration: underline;\n}\n\na:focus {\n    outline: none;\n}\n\nimg {\n    vertical-align: middle;\n}\n\np {\n    margin: 0 0 10.5px;\n}\n\nmaterial-tabs {\n    margin-left: 32px;\n}\n\nmaterial-tab {\n    padding: 10.5px 21px;\n    margin: 0 0 21px;\n    border-left: 5px solid #eeeeee;\n}\n\nmaterial-tab p {\n    font-weight: 300;\n    font-size: 16px;\n    line-height: 1.15;\n}\n\nmaterial-tab p:last-child {\n    margin-bottom: 0;\n}\n\nmaterial-tab small {\n    display: block;\n    line-height: 1.42857;\n    color: #999999;\n}\n\nmaterial-tab small:before {\n    content: '\\2014 \\00A0';\n}\n\n.testimonials material-tab {\n    margin: 0;\n    padding: 0;\n    border: none;\n}\n\n.testimonials .material-view p {\n    position: absolute;\n    display: block;\n    margin: 30px 0 0 20px;\n    padding: 5px 10px 15px 30px;\n    background: url('/img/testimonials/quote.png') no-repeat;\n    background-size: 25px 25px;\n    color: #888;\n    opacity: 0.0;\n}\n\n.material-view p.active {\n    -webkit-transition: opacity 0.9s;\n    transition: opacity 0.9s;\n    opacity: 1;\n}\n\n.testimonials footer {\n    background-size: 44px 40px;\n    background-repeat: no-repeat;\n    -webkit-transition: opacity 0.3s;\n    transition: opacity 0.3s;\n    margin-top:10px;\n    text-transform: none !important;\n}\n\n.testimonials footer div {\n    font-size:10px;\n}\n\n.testimonials material-tabs {\n    position: relative;\n    margin: 0 auto;\n    padding: 0 5px 0px 5px;\n    max-width: 1050px;\n}\n\n.testimonials .tabs-header {\n    position: absolute;\n    top: 100px;\n}\n\n\nmaterial-tabs, material-tabs .tabs-header .tabs-header-items {\n    background-color: #ffffff;\n}\n\nmaterial-tab {\n    text-align: inherit;\n    height: 50px;\n    color: #333;\n}\n\nmaterial-tab-label {\n    text-align: inherit;\n    margin-left: 30px;\n}\n\nmaterial-tab footer {\n    color: #333;\n    padding-left: 50px;\n    background-color: rgb(0,0,0,0);\n}\n\n\ncanvas.material-ink-ripple {\n    color: #d9d9d9;\n    border-radius: 8px;\n}\n\n\n\n@media (min-width: 568px) {\n    .testimonials {\n        position: relative;\n        height: 365px;\n        padding-top: 40px;\n    }\n\n\n    .material-view p {\n        position: absolute;\n        display: block;\n        margin: 20px 0 0 20px;\n        padding: 10px 80px 0 60px;\n        min-height: 150px;\n        background-size: 50px 50px;\n        color: #888;\n        text-align: center;\n        font-weight: normal;\n        font-size: 18px;\n        font-family: Georgia, serif;\n        line-height: 1.65;\n        -webkit-font-smoothing: antialiased;\n        opacity: 0.0;\n        -webkit-transition: opacity 0.4s;\n        transition: opacity 0.4s;\n    }\n\n    .material-view p.active {\n        display: block;\n        -webkit-transition: opacity 0.9s;\n        transition: opacity 0.9s;\n        opacity: 1;\n        font-size: 1.1em;\n    }\n\n    .testimonials footer {\n        margin-top:5px;\n        padding-top: 5px;\n        max-width: 230px;\n        width: 230px;\n        height: 65px;\n        background-size: 44px 40px;\n        font-size: 13px;\n        opacity: 0.4;\n        cursor: pointer;\n        padding-left: 45px;\n    }\n\n    .testimonials footer div {\n        font-size:11px;\n        margin-top:-20px;\n    }\n\n    .testimonials .active footer, .testimonials footer:hover {\n        opacity: 1;\n    }\n\n    .testimonials .active footer {\n        border-bottom: 2px solid #4F8EF7;\n    }\n\n    .testimonials cite {\n        color: #4F8EF7;\n        font-weight: 400;\n        font-size: 15px;\n        display:block;\n        margin-top:-12px;\n    }\n\n\n    .testimonial-content {\n        padding: 10px 10px 0 10px;\n    }\n\n    .testimonials material-tab {\n        height: 60px;\n    }\n\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 150px;\n    }\n}\n\n@media (min-width: 790px) {\n    .testimonials {\n        height: 380px;\n        padding-top: 40px;\n    }\n\n    .testimonials .material-view p {\n        font-size: 20px;\n        line-height: 38px;\n    }\n\n    .testimonials footer {\n        max-width: 265px;\n        width: 265px;\n        height: 94px;\n        background-size: 88px 80px;\n        padding-left: 90px;\n        margin-top:5px;\n    }\n\n    .testimonials footer div {\n        font-size:13px;\n        margin-top:-15px;\n    }\n\n    .testimonials cite {\n        font-size: 15px;\n        display:block;\n        margin-top:10px;\n    }\n\n    .testimonials material-tab {\n        height: 100px;\n    }\n\n    .testimonials .tabs-header {\n        position: absolute;\n        top: 190px;\n    }\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<div class=\"testimonials\" ng-app=\"app\" ng-controller=\"AppCtrl\" >\n    <material-tabs selected=\"selected\" nobar tabs-align=\"bottom\" >\n\n        <material-tab>\n            <p ng-class=\"{active:selected==0}\">\n                I'm thrilled by the depth of thought behind Material Design's\n                specification for responsive application development.\n                Drifty's implementation for AngularJS makes it instantly\n                usable in your existing applications.\n            </p>\n            <material-tab-label>\n                <footer style=\"background-image: url(/img/testimonials/logo-bradgreen@2x.png)\"\n                        ng-mouseenter=\"enableAutoScroll(false);\"\n                        ng-mouseleave=\"enableAutoScroll(true);\" >\n                    <cite>Brad Green</cite>\n                    <div>\n                        Director, <a href=\"https://plus.google.com/+BradGreen/about\">Google</a>\n                    </div>\n                </footer>\n            </material-tab-label>\n        </material-tab>\n\n        <material-tab>\n            <p ng-class=\"{active:selected==1}\">\n                Using the Material Design specifications and lessons learned\n                from Angular & Polymer component development, our team has\n                created Angular Material. Implemented with advanced CSS and\n                Directives, Angular Material delivers an amazing UI SDK for\n                Angular SPA(s).\n            </p>\n            <material-tab-label>\n                <footer style=\"background-image: url(/img/testimonials/logo-thomasburleson@2x.png)\"\n                        ng-mouseenter=\"enableAutoScroll(false);\"\n                        ng-mouseleave=\"enableAutoScroll(true);\" >\n                    <cite>Thomas Burleson</cite>\n                    <div>\n                        i-Architect,\n                        <a href=\"http://solutionOptimist.com/\">Mindspace</a>\n                    </div>\n                </footer>\n            </material-tab-label>\n        </material-tab>\n\n        <material-tab>\n            <p ng-class=\"{active:selected==2}\">\n                I am so inspired with Angular Material. It fills a gap that's\n                missing when building for mobile and solves many complexities\n                that otherwise require multiple libraries, keeping your code\n                cleaner. Overall, it just makes mobile development fun and\n                fast, so you can build more!\n            </p>\n            <material-tab-label>\n                <footer style=\"background-image: url(/img/testimonials/logo-maxlynch@2x.png)\"\n                        ng-mouseenter=\"enableAutoScroll(false);\"\n                        ng-mouseleave=\"enableAutoScroll(true);\" >\n                    <cite>Max Lynch</cite>\n                    <div>\n                        Co-Founder,\n                        <a href=\"http://ionicframework.com/\">Drifty</a>\n                    </div>\n                </footer>\n            </material-tab-label>\n        </material-tab>\n\n\n    </material-tabs>\n</div>\n\n</body>\n</html>\n"
        }
      },
      {
        "id": "demo2",
        "name": "Static Tabs, external content, noInk:",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/tabs/demos/demo2/script.js",
            "content": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.selectedIndex = 0;\n    $scope.twoDisabled = true;\n\n  });\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo2",
            "name": "Static Tabs, external content, noInk:",
            "fileName": "script",
            "relativePath": "script.js/src/components/tabs/demos/demo2/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo2/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.selectedIndex = 0;\n    $scope.twoDisabled = true;\n\n  });\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/tabs/demos/demo2/index.html",
          "content": "<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"sample\">\n\n    <material-tabs selected=\"selectedIndex\" noink>\n        <material-tab label=\"ITEM ONE\"></material-tab>\n        <material-tab label=\"ITEM TWO\" ng-disabled=\"twoDisabled\"></material-tab>\n        <material-tab label=\"ITEM THREE\"></material-tab>\n        <material-tab label=\"ITEM FOUR\"></material-tab>\n    </material-tabs>\n\n    <div class=\"animate-switch-container\" ng-switch on=\"selectedIndex\">\n        <div class=\"animate-switch blueArea\" ng-switch-when=\"0\">\n            View for Item #1<br/>\n            Selection index = 0\n        </div>\n        <div class=\"animate-switch redArea\" ng-switch-when=\"1\">\n            View for Item #2<br/>\n            Selection index = 1\n        </div>\n        <div class=\"animate-switch greenArea\" ng-switch-when=\"2\">\n            View for Item #3<br/>\n            Selection index = 2\n        </div>\n        <div class=\"animate-switch grayArea\" ng-switch-when=\"3\">\n            View for Item #4<br/>\n            Selection index = 3\n        </div>\n    </div>\n\n        <input type=\"number\" ng-model=\"selectedIndex\">Tab #2 is\n              <span class=\"highlight\">\n                <input type=\"checkbox\" ng-model=\"twoDisabled\">Disabled\n              </span>\n        (will auto-deselect if active)\n\n\n</div>\n",
          "componentId": "material.components.tabs",
          "componentName": "Tabs",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo2",
          "name": "Static Tabs, external content, noInk:",
          "fileName": "index",
          "relativePath": "index.html/src/components/tabs/demos/demo2/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.tabs/demo/demo2/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/tabs/demos/demo2/script.js",
              "content": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.selectedIndex = 0;\n    $scope.twoDisabled = true;\n\n  });\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo2",
              "name": "Static Tabs, external content, noInk:",
              "fileName": "script",
              "relativePath": "script.js/src/components/tabs/demos/demo2/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo2/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.selectedIndex = 0;\n    $scope.twoDisabled = true;\n\n  });\n\n"
            }
          ],
          "css": [],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  \n</head>\n<body>\n<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"sample\">\n\n    <material-tabs selected=\"selectedIndex\" noink>\n        <material-tab label=\"ITEM ONE\"></material-tab>\n        <material-tab label=\"ITEM TWO\" ng-disabled=\"twoDisabled\"></material-tab>\n        <material-tab label=\"ITEM THREE\"></material-tab>\n        <material-tab label=\"ITEM FOUR\"></material-tab>\n    </material-tabs>\n\n    <div class=\"animate-switch-container\" ng-switch on=\"selectedIndex\">\n        <div class=\"animate-switch blueArea\" ng-switch-when=\"0\">\n            View for Item #1<br/>\n            Selection index = 0\n        </div>\n        <div class=\"animate-switch redArea\" ng-switch-when=\"1\">\n            View for Item #2<br/>\n            Selection index = 1\n        </div>\n        <div class=\"animate-switch greenArea\" ng-switch-when=\"2\">\n            View for Item #3<br/>\n            Selection index = 2\n        </div>\n        <div class=\"animate-switch grayArea\" ng-switch-when=\"3\">\n            View for Item #4<br/>\n            Selection index = 3\n        </div>\n    </div>\n\n        <input type=\"number\" ng-model=\"selectedIndex\">Tab #2 is\n              <span class=\"highlight\">\n                <input type=\"checkbox\" ng-model=\"twoDisabled\">Disabled\n              </span>\n        (will auto-deselect if active)\n\n\n</div>\n\n</body>\n</html>\n"
        }
      },
      {
        "id": "demo4",
        "name": "Dynamic Tabs (with internal views):",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/tabs/demos/demo4/script.js",
            "content": "angular.module('app', ['ngMaterial'])\n  .controller('AppCtrl', function ($scope, $interpolate) {\n    var tabs = [\n      { title: 'Polymer', active: true, disabled: false, content: \"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: false, content: \"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true, content: \"AngularJS practices are the best!\" },\n      { title: 'NodeJS', active: false, disabled: false, content: \"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.tabs = tabs;\n    $scope.predicate = \"title\";\n    $scope.reversed = true;\n    $scope.selectedIndex = 2;\n    $scope.allowDisable = true;\n\n    $scope.onTabSelected = onTabSelected;\n    $scope.announceSelected = announceSelected;\n    $scope.announceDeselected = announceDeselected;\n\n    $scope.addTab = function (title, view) {\n      view = view || title + \" Content View\";\n      tabs.push({ title: title, content: view, active: false, disabled: false});\n    };\n\n    $scope.removeTab = function (tab) {\n      for (var j = 0; j < tabs.length; j++) {\n        if (tab.title == tabs[j].title) {\n          $scope.tabs.splice(j, 1);\n          break;\n        }\n      }\n    }\n\n    $scope.submit = function ($event) {\n      if ($event.which !== 13) return;\n      if ($scope.tTitle != \"\") {\n        $scope.addTab($scope.tTitle, $scope.tContent);\n      }\n    }\n\n    // **********************************************************\n    // Private Methods\n    // **********************************************************\n\n    function onTabSelected(tab) {\n      $scope.selectedIndex = this.$index;\n\n      $scope.announceSelected(tab);\n    }\n\n    function announceDeselected(tab) {\n      $scope.farewell = $interpolate(\"Goodbye {{title}}!\")(tab);\n    }\n\n    function announceSelected(tab) {\n      $scope.greeting = $interpolate(\"Hello {{title}}!\")(tab);\n    }\n\n  });\n\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo4",
            "name": "Dynamic Tabs (with internal views):",
            "fileName": "script",
            "relativePath": "script.js/src/components/tabs/demos/demo4/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo4/script.js",
            "viewType": "JavaScript",
            "renderedContent": "angular.module('app', ['ngMaterial'])\n  .controller('AppCtrl', function ($scope, $interpolate) {\n    var tabs = [\n      { title: 'Polymer', active: true, disabled: false, content: \"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: false, content: \"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true, content: \"AngularJS practices are the best!\" },\n      { title: 'NodeJS', active: false, disabled: false, content: \"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.tabs = tabs;\n    $scope.predicate = \"title\";\n    $scope.reversed = true;\n    $scope.selectedIndex = 2;\n    $scope.allowDisable = true;\n\n    $scope.onTabSelected = onTabSelected;\n    $scope.announceSelected = announceSelected;\n    $scope.announceDeselected = announceDeselected;\n\n    $scope.addTab = function (title, view) {\n      view = view || title + \" Content View\";\n      tabs.push({ title: title, content: view, active: false, disabled: false});\n    };\n\n    $scope.removeTab = function (tab) {\n      for (var j = 0; j < tabs.length; j++) {\n        if (tab.title == tabs[j].title) {\n          $scope.tabs.splice(j, 1);\n          break;\n        }\n      }\n    }\n\n    $scope.submit = function ($event) {\n      if ($event.which !== 13) return;\n      if ($scope.tTitle != \"\") {\n        $scope.addTab($scope.tTitle, $scope.tContent);\n      }\n    }\n\n    // **********************************************************\n    // Private Methods\n    // **********************************************************\n\n    function onTabSelected(tab) {\n      $scope.selectedIndex = this.$index;\n\n      $scope.announceSelected(tab);\n    }\n\n    function announceDeselected(tab) {\n      $scope.farewell = $interpolate(\"Goodbye {{title}}!\")(tab);\n    }\n\n    function announceSelected(tab) {\n      $scope.greeting = $interpolate(\"Hello {{title}}!\")(tab);\n    }\n\n  });\n\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/tabs/demos/demo4/style.css",
            "content": ".tabs-content .material-view {\n    background-color: blanchedalmond;\n}\n\ndiv.infoBar input {\n    display: inline-block;\n}\n\ndiv.infoBar {\n    margin-left: 20px;\n    height: 75px;\n    font-size: .8em;\n}\n\n\nmaterial-tabs .tabs-content {\n    height: 200px;\n}\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo4",
            "name": "Dynamic Tabs (with internal views):",
            "fileName": "style",
            "relativePath": "style.css/src/components/tabs/demos/demo4/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo4/style.css",
            "viewType": "CSS",
            "renderedContent": ".tabs-content .material-view {\n    background-color: blanchedalmond;\n}\n\ndiv.infoBar input {\n    display: inline-block;\n}\n\ndiv.infoBar {\n    margin-left: 20px;\n    height: 75px;\n    font-size: .8em;\n}\n\n\nmaterial-tabs .tabs-content {\n    height: 200px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/tabs/demos/demo4/index.html",
          "content": "<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"sample\">\n\n    <material-tabs selected=\"selectedIndex\" style=\"background-color: #00bcd6\">\n        <img ng-src=\"/img/angular.png\" style=\"position:absolute; width:30px;height: 30px; padding-top:5px; padding-left: 5px;\">\n\n        <material-tab ng-repeat=\"tab in tabs | orderBy:predicate:reversed\"\n                 on-select=\"onTabSelected(tab)\"\n                 on-deselect=\"announceDeselected(tab)\"\n                 ng-disabled=\"tab.disabled\"\n                 label=\"{{tab.title}}\">\n          {{tab.content}}\n          <material-button class=\"material-theme-red\"\n            ng-click=\"removeTab( tab )\">Remove Tab\n          </material-button>\n        </material-tab>\n\n    </material-tabs>\n\n    <div layout=\"vertical\" layout-padding>\n\n      <material-list class=\"tab-demo-list\" flex>\n        <material-item>\n          <span>Active Tab Index: {{selectedIndex}}</span>\n        </material-item>\n        <material-item>\n          <material-checkbox ng-model=\"tabs[2].disabled\">\n            Disable Tab #2?\n          </material-checkbox>\n        </material-item>\n        <material-item>\n          <material-checkbox ng-model=\"reversed\">\n            Reversed Order? \n          </material-checkbox>\n        </material-item>\n      </material-list>\n\n      <material-divider flex></material-divider>\n      <div class=\"title\" flex>Add Another Tab</div>\n\n      <form ng-submit=\"addTab(tTitle,tContent)\" flex>\n        <div layout=\"horizontal\">\n          <span flex=\"15\">Title:</span>\n          <input type=\"text\" required ng-model=\"tTitle\" placeholder=\"<tab label>\">\n        </div>\n        <div layout=\"horizontal\">\n          <span flex=\"15\">Content:</span>\n          <input type=\"text\" required ng-model=\"tContent\" placeholder=\"<tab content>\">\n        </div>\n        <material-button type=\"submit\" class=\"material-button-colored\">\n           Add New Tab\n        </material-button>\n      </form>\n\n    </div>\n</div>\n",
          "componentId": "material.components.tabs",
          "componentName": "Tabs",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo4",
          "name": "Dynamic Tabs (with internal views):",
          "fileName": "index",
          "relativePath": "index.html/src/components/tabs/demos/demo4/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.tabs/demo/demo4/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/tabs/demos/demo4/script.js",
              "content": "angular.module('app', ['ngMaterial'])\n  .controller('AppCtrl', function ($scope, $interpolate) {\n    var tabs = [\n      { title: 'Polymer', active: true, disabled: false, content: \"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: false, content: \"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true, content: \"AngularJS practices are the best!\" },\n      { title: 'NodeJS', active: false, disabled: false, content: \"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.tabs = tabs;\n    $scope.predicate = \"title\";\n    $scope.reversed = true;\n    $scope.selectedIndex = 2;\n    $scope.allowDisable = true;\n\n    $scope.onTabSelected = onTabSelected;\n    $scope.announceSelected = announceSelected;\n    $scope.announceDeselected = announceDeselected;\n\n    $scope.addTab = function (title, view) {\n      view = view || title + \" Content View\";\n      tabs.push({ title: title, content: view, active: false, disabled: false});\n    };\n\n    $scope.removeTab = function (tab) {\n      for (var j = 0; j < tabs.length; j++) {\n        if (tab.title == tabs[j].title) {\n          $scope.tabs.splice(j, 1);\n          break;\n        }\n      }\n    }\n\n    $scope.submit = function ($event) {\n      if ($event.which !== 13) return;\n      if ($scope.tTitle != \"\") {\n        $scope.addTab($scope.tTitle, $scope.tContent);\n      }\n    }\n\n    // **********************************************************\n    // Private Methods\n    // **********************************************************\n\n    function onTabSelected(tab) {\n      $scope.selectedIndex = this.$index;\n\n      $scope.announceSelected(tab);\n    }\n\n    function announceDeselected(tab) {\n      $scope.farewell = $interpolate(\"Goodbye {{title}}!\")(tab);\n    }\n\n    function announceSelected(tab) {\n      $scope.greeting = $interpolate(\"Hello {{title}}!\")(tab);\n    }\n\n  });\n\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo4",
              "name": "Dynamic Tabs (with internal views):",
              "fileName": "script",
              "relativePath": "script.js/src/components/tabs/demos/demo4/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo4/script.js",
              "viewType": "JavaScript",
              "renderedContent": "angular.module('app', ['ngMaterial'])\n  .controller('AppCtrl', function ($scope, $interpolate) {\n    var tabs = [\n      { title: 'Polymer', active: true, disabled: false, content: \"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: false, content: \"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true, content: \"AngularJS practices are the best!\" },\n      { title: 'NodeJS', active: false, disabled: false, content: \"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.tabs = tabs;\n    $scope.predicate = \"title\";\n    $scope.reversed = true;\n    $scope.selectedIndex = 2;\n    $scope.allowDisable = true;\n\n    $scope.onTabSelected = onTabSelected;\n    $scope.announceSelected = announceSelected;\n    $scope.announceDeselected = announceDeselected;\n\n    $scope.addTab = function (title, view) {\n      view = view || title + \" Content View\";\n      tabs.push({ title: title, content: view, active: false, disabled: false});\n    };\n\n    $scope.removeTab = function (tab) {\n      for (var j = 0; j < tabs.length; j++) {\n        if (tab.title == tabs[j].title) {\n          $scope.tabs.splice(j, 1);\n          break;\n        }\n      }\n    }\n\n    $scope.submit = function ($event) {\n      if ($event.which !== 13) return;\n      if ($scope.tTitle != \"\") {\n        $scope.addTab($scope.tTitle, $scope.tContent);\n      }\n    }\n\n    // **********************************************************\n    // Private Methods\n    // **********************************************************\n\n    function onTabSelected(tab) {\n      $scope.selectedIndex = this.$index;\n\n      $scope.announceSelected(tab);\n    }\n\n    function announceDeselected(tab) {\n      $scope.farewell = $interpolate(\"Goodbye {{title}}!\")(tab);\n    }\n\n    function announceSelected(tab) {\n      $scope.greeting = $interpolate(\"Hello {{title}}!\")(tab);\n    }\n\n  });\n\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/tabs/demos/demo4/style.css",
              "content": ".tabs-content .material-view {\n    background-color: blanchedalmond;\n}\n\ndiv.infoBar input {\n    display: inline-block;\n}\n\ndiv.infoBar {\n    margin-left: 20px;\n    height: 75px;\n    font-size: .8em;\n}\n\n\nmaterial-tabs .tabs-content {\n    height: 200px;\n}\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo4",
              "name": "Dynamic Tabs (with internal views):",
              "fileName": "style",
              "relativePath": "style.css/src/components/tabs/demos/demo4/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo4/style.css",
              "viewType": "CSS",
              "renderedContent": ".tabs-content .material-view {\n    background-color: blanchedalmond;\n}\n\ndiv.infoBar input {\n    display: inline-block;\n}\n\ndiv.infoBar {\n    margin-left: 20px;\n    height: 75px;\n    font-size: .8em;\n}\n\n\nmaterial-tabs .tabs-content {\n    height: 200px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"sample\">\n\n    <material-tabs selected=\"selectedIndex\" style=\"background-color: #00bcd6\">\n        <img ng-src=\"/img/angular.png\" style=\"position:absolute; width:30px;height: 30px; padding-top:5px; padding-left: 5px;\">\n\n        <material-tab ng-repeat=\"tab in tabs | orderBy:predicate:reversed\"\n                 on-select=\"onTabSelected(tab)\"\n                 on-deselect=\"announceDeselected(tab)\"\n                 ng-disabled=\"tab.disabled\"\n                 label=\"{{tab.title}}\">\n          {{tab.content}}\n          <material-button class=\"material-theme-red\"\n            ng-click=\"removeTab( tab )\">Remove Tab\n          </material-button>\n        </material-tab>\n\n    </material-tabs>\n\n    <div layout=\"vertical\" layout-padding>\n\n      <material-list class=\"tab-demo-list\" flex>\n        <material-item>\n          <span>Active Tab Index: {{selectedIndex}}</span>\n        </material-item>\n        <material-item>\n          <material-checkbox ng-model=\"tabs[2].disabled\">\n            Disable Tab #2?\n          </material-checkbox>\n        </material-item>\n        <material-item>\n          <material-checkbox ng-model=\"reversed\">\n            Reversed Order? \n          </material-checkbox>\n        </material-item>\n      </material-list>\n\n      <material-divider flex></material-divider>\n      <div class=\"title\" flex>Add Another Tab</div>\n\n      <form ng-submit=\"addTab(tTitle,tContent)\" flex>\n        <div layout=\"horizontal\">\n          <span flex=\"15\">Title:</span>\n          <input type=\"text\" required ng-model=\"tTitle\" placeholder=\"<tab label>\">\n        </div>\n        <div layout=\"horizontal\">\n          <span flex=\"15\">Content:</span>\n          <input type=\"text\" required ng-model=\"tContent\" placeholder=\"<tab content>\">\n        </div>\n        <material-button type=\"submit\" class=\"material-button-colored\">\n           Add New Tab\n        </material-button>\n      </form>\n\n    </div>\n</div>\n\n</body>\n</html>\n"
        }
      },
      {
        "id": "demo3",
        "name": "Dynamic Tabs (buttons only):",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/tabs/demos/demo3/script.js",
            "content": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.activeIndex = 1;\n    $scope.tabs = [].concat(tabs);\n\n  });\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo3",
            "name": "Dynamic Tabs (buttons only):",
            "fileName": "script",
            "relativePath": "script.js/src/components/tabs/demos/demo3/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo3/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.activeIndex = 1;\n    $scope.tabs = [].concat(tabs);\n\n  });\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/tabs/demos/demo3/style.css",
            "content": ".logo {\n    padding: 10px;\n    height: 36px;\n    width: 100%;\n}\n\n.centered {\n    margin-top: -5px;\n    padding-left: 48%\n}\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo3",
            "name": "Dynamic Tabs (buttons only):",
            "fileName": "style",
            "relativePath": "style.css/src/components/tabs/demos/demo3/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo3/style.css",
            "viewType": "CSS",
            "renderedContent": ".logo {\n    padding: 10px;\n    height: 36px;\n    width: 100%;\n}\n\n.centered {\n    margin-top: -5px;\n    padding-left: 48%\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/tabs/demos/demo3/index.html",
          "content": "<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"sample\">\n\n    <material-tabs selected=\"activeIndex\" style=\"background-color: #4285F4;\">\n        <div class=\"logo\">\n            <div class=\"centered\">\n                <img ng-src=\"/img/angular.png\" style=\"width:30px;height: 30px;\">\n            </div>\n        </div>\n        <material-tab ng-repeat=\"tab in tabs\">\n            {{tab.title}}\n        </material-tab>\n    </material-tabs>\n\n</div>\n",
          "componentId": "material.components.tabs",
          "componentName": "Tabs",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo3",
          "name": "Dynamic Tabs (buttons only):",
          "fileName": "index",
          "relativePath": "index.html/src/components/tabs/demos/demo3/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.tabs/demo/demo3/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/tabs/demos/demo3/script.js",
              "content": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.activeIndex = 1;\n    $scope.tabs = [].concat(tabs);\n\n  });\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo3",
              "name": "Dynamic Tabs (buttons only):",
              "fileName": "script",
              "relativePath": "script.js/src/components/tabs/demos/demo3/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo3/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'] )\n  .controller('AppCtrl', function( $scope ) {\n    var tabs = [\n      { title: 'Polymer', active: true,  disabled: false, content:\"Polymer practices are great!\" },\n      { title: 'Material', active: false, disabled: true , content:\"Material Design practices are better!\" },\n      { title: 'Angular', active: false, disabled: true , content:\"AngularJS practices are the best!\" },\n      { title: 'NodeJS' , active: false, disabled: false, content:\"NodeJS practices are amazing!\" }\n    ];\n\n    $scope.activeIndex = 1;\n    $scope.tabs = [].concat(tabs);\n\n  });\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/tabs/demos/demo3/style.css",
              "content": ".logo {\n    padding: 10px;\n    height: 36px;\n    width: 100%;\n}\n\n.centered {\n    margin-top: -5px;\n    padding-left: 48%\n}\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo3",
              "name": "Dynamic Tabs (buttons only):",
              "fileName": "style",
              "relativePath": "style.css/src/components/tabs/demos/demo3/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo3/style.css",
              "viewType": "CSS",
              "renderedContent": ".logo {\n    padding: 10px;\n    height: 36px;\n    width: 100%;\n}\n\n.centered {\n    margin-top: -5px;\n    padding-left: 48%\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n<div ng-app=\"app\" ng-controller=\"AppCtrl\" class=\"sample\">\n\n    <material-tabs selected=\"activeIndex\" style=\"background-color: #4285F4;\">\n        <div class=\"logo\">\n            <div class=\"centered\">\n                <img ng-src=\"/img/angular.png\" style=\"width:30px;height: 30px;\">\n            </div>\n        </div>\n        <material-tab ng-repeat=\"tab in tabs\">\n            {{tab.title}}\n        </material-tab>\n    </material-tabs>\n\n</div>\n\n</body>\n</html>\n"
        }
      },
      {
        "id": "demo5",
        "name": "Dynamic Tabs (buttons only) with $location & routing: ",
        "docType": "demo",
        "files": [
          {
            "fileType": "html",
            "file": "src/components/tabs/demos/demo5/angular.tmpl.html",
            "content": "<h1>Angular</h1>\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "angular.tmpl.html",
            "docType": "demo",
            "id": "demo5",
            "name": "Dynamic Tabs (buttons only) with $location & routing: ",
            "fileName": "angular.tmpl",
            "relativePath": "angular.tmpl.html/src/components/tabs/demos/demo5/angular.tmpl.html",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo5/angular.tmpl.html",
            "viewType": "Template",
            "renderedContent": "<h1>Angular</h1>\n\n"
          },
          {
            "fileType": "html",
            "file": "src/components/tabs/demos/demo5/material.tmpl.html",
            "content": "<h1>Material</h1>\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "material.tmpl.html",
            "docType": "demo",
            "id": "demo5",
            "name": "Dynamic Tabs (buttons only) with $location & routing: ",
            "fileName": "material.tmpl",
            "relativePath": "material.tmpl.html/src/components/tabs/demos/demo5/material.tmpl.html",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo5/material.tmpl.html",
            "viewType": "Template",
            "renderedContent": "<h1>Material</h1>\n\n"
          },
          {
            "fileType": "html",
            "file": "src/components/tabs/demos/demo5/polymer.tmpl.html",
            "content": "<h1>Polymer</h1>\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "polymer.tmpl.html",
            "docType": "demo",
            "id": "demo5",
            "name": "Dynamic Tabs (buttons only) with $location & routing: ",
            "fileName": "polymer.tmpl",
            "relativePath": "polymer.tmpl.html/src/components/tabs/demos/demo5/polymer.tmpl.html",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo5/polymer.tmpl.html",
            "viewType": "Template",
            "renderedContent": "<h1>Polymer</h1>\n\n"
          },
          {
            "fileType": "js",
            "file": "src/components/tabs/demos/demo5/script.js",
            "content": "\nangular.module('app', ['ngMaterial', 'ngRoute'])\n\n.config(function($routeProvider) {\n  $routeProvider\n    .when('/material', {\n      templateUrl: 'material.tmpl.html',\n      controller: 'MaterialTabCtrl'\n    })\n    .when('/angular', {\n      templateUrl: 'angular.tmpl.html',\n      controller: 'AngularTabCtrl'\n    })\n    .when('/polymer', {\n      templateUrl: 'polymer.tmpl.html',\n      controller: 'PolymerTabCtrl'\n    })\n    .otherwise({\n      redirectTo: '/material'\n    });\n})\n\n.controller('AppCtrl', function($scope, $location) {\n  var tabs = $scope.tabs = [\n    { path: '/material', label: 'Material Design' },\n    { path: '/angular', label: 'Use Angular' },\n    { path: '/polymer', label: 'Use Polymer' },\n  ];\n\n  $scope.selectedTabIndex = 0;\n  $scope.$watch('selectedTabIndex', watchSelectedTab);\n  \n  function watchSelectedTab(index, oldIndex) {\n    console.log('selecting from', oldIndex, 'to', index);\n    $scope.reverse = index < oldIndex;\n    $location.path(tabs[index].path);\n  }\n\n})\n\n.controller('MaterialTabCtrl', function($scope) {\n})\n\n.controller('AngularTabCtrl', function($scope) {\n})\n\n.controller('PolymerTabCtrl', function($scope) {\n});\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo5",
            "name": "Dynamic Tabs (buttons only) with $location & routing: ",
            "fileName": "script",
            "relativePath": "script.js/src/components/tabs/demos/demo5/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo5/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial', 'ngRoute'])\n\n.config(function($routeProvider) {\n  $routeProvider\n    .when('/material', {\n      templateUrl: 'material.tmpl.html',\n      controller: 'MaterialTabCtrl'\n    })\n    .when('/angular', {\n      templateUrl: 'angular.tmpl.html',\n      controller: 'AngularTabCtrl'\n    })\n    .when('/polymer', {\n      templateUrl: 'polymer.tmpl.html',\n      controller: 'PolymerTabCtrl'\n    })\n    .otherwise({\n      redirectTo: '/material'\n    });\n})\n\n.controller('AppCtrl', function($scope, $location) {\n  var tabs = $scope.tabs = [\n    { path: '/material', label: 'Material Design' },\n    { path: '/angular', label: 'Use Angular' },\n    { path: '/polymer', label: 'Use Polymer' },\n  ];\n\n  $scope.selectedTabIndex = 0;\n  $scope.$watch('selectedTabIndex', watchSelectedTab);\n  \n  function watchSelectedTab(index, oldIndex) {\n    console.log('selecting from', oldIndex, 'to', index);\n    $scope.reverse = index < oldIndex;\n    $location.path(tabs[index].path);\n  }\n\n})\n\n.controller('MaterialTabCtrl', function($scope) {\n})\n\n.controller('AngularTabCtrl', function($scope) {\n})\n\n.controller('PolymerTabCtrl', function($scope) {\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/tabs/demos/demo5/style.css",
            "content": ".tabs-view {\n  position: absolute;\n  top: 149px;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  animation-duration: 0.35s;\n  animation-timing-function: ease-in-out;\n  -webkit-animation-duration: 0.35s;\n  -webkit-animation-timing-function: ease-in-out;\n}\n\n.tabs-view.ng-enter {\n  animation-name: slideFromRight;\n  -webkit-animation-name: slideFromRight;\n}\n.tabs-view.reverse.ng-enter {\n  animation-name: slideFromLeft;\n  -webkit-animation-name: slideFromLeft;\n}\n.tabs-view.ng-leave {\n  animation-name: slideToLeft;\n  -webkit-animation-name: slideToLeft;\n}\n.tabs-view.reverse.ng-leave {\n  animation-name: slideToRight;\n  -webkit-animation-name: slideToRight;\n}\n\n@keyframes slideFromRight {\n  0% { transform: translateX(100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideFromLeft {\n  0% { transform: translateX(-100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideToRight {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(100%); }\n}\n@keyframes slideToLeft {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-100%); }\n}\n\n@-webkit-keyframes slideFromRight {\n  0% { -webkit-transform: translateX(100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideFromLeft {\n  0% { -webkit-transform: translateX(-100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideToRight {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(100%); }\n}\n@-webkit-keyframes slideToLeft {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(-100%); }\n}\n\n\nng-view {\n    padding-left: 40px;\n}\n\nng-view.tabs-view {\n    margin-left: 20px;\n    margin-right: 20px;\n    margin-bottom: 20px;\n    top: 60px;\n    height:200px;\n}\n",
            "componentId": "material.components.tabs",
            "componentName": "Tabs",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo5",
            "name": "Dynamic Tabs (buttons only) with $location & routing: ",
            "fileName": "style",
            "relativePath": "style.css/src/components/tabs/demos/demo5/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.tabs/demo/demo5/style.css",
            "viewType": "CSS",
            "renderedContent": ".tabs-view {\n  position: absolute;\n  top: 149px;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  animation-duration: 0.35s;\n  animation-timing-function: ease-in-out;\n  -webkit-animation-duration: 0.35s;\n  -webkit-animation-timing-function: ease-in-out;\n}\n\n.tabs-view.ng-enter {\n  animation-name: slideFromRight;\n  -webkit-animation-name: slideFromRight;\n}\n.tabs-view.reverse.ng-enter {\n  animation-name: slideFromLeft;\n  -webkit-animation-name: slideFromLeft;\n}\n.tabs-view.ng-leave {\n  animation-name: slideToLeft;\n  -webkit-animation-name: slideToLeft;\n}\n.tabs-view.reverse.ng-leave {\n  animation-name: slideToRight;\n  -webkit-animation-name: slideToRight;\n}\n\n@keyframes slideFromRight {\n  0% { transform: translateX(100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideFromLeft {\n  0% { transform: translateX(-100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideToRight {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(100%); }\n}\n@keyframes slideToLeft {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-100%); }\n}\n\n@-webkit-keyframes slideFromRight {\n  0% { -webkit-transform: translateX(100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideFromLeft {\n  0% { -webkit-transform: translateX(-100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideToRight {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(100%); }\n}\n@-webkit-keyframes slideToLeft {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(-100%); }\n}\n\n\nng-view {\n    padding-left: 40px;\n}\n\nng-view.tabs-view {\n    margin-left: 20px;\n    margin-right: 20px;\n    margin-bottom: 20px;\n    top: 60px;\n    height:200px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/tabs/demos/demo5/index.html",
          "content": "<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n\n<div class=\"sample\">\n\n    <div ng-app=\"app\" ng-controller=\"AppCtrl\" >\n\n      <material-tabs selected=\"selectedTabIndex\">\n        <material-tab ng-repeat=\"tab in tabs\"\n                label=\"{{tab.label}}\">\n        </material-tab>\n      </material-tabs>\n\n      <ng-view class=\"tabs-view\" ng-class=\"{reverse: reverse}\"></ng-view>\n\n    </div>\n\n</div>\n",
          "componentId": "material.components.tabs",
          "componentName": "Tabs",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo5",
          "name": "Dynamic Tabs (buttons only) with $location & routing: ",
          "fileName": "index",
          "relativePath": "index.html/src/components/tabs/demos/demo5/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.tabs/demo/demo5/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/tabs/demos/demo5/script.js",
              "content": "\nangular.module('app', ['ngMaterial', 'ngRoute'])\n\n.config(function($routeProvider) {\n  $routeProvider\n    .when('/material', {\n      templateUrl: 'material.tmpl.html',\n      controller: 'MaterialTabCtrl'\n    })\n    .when('/angular', {\n      templateUrl: 'angular.tmpl.html',\n      controller: 'AngularTabCtrl'\n    })\n    .when('/polymer', {\n      templateUrl: 'polymer.tmpl.html',\n      controller: 'PolymerTabCtrl'\n    })\n    .otherwise({\n      redirectTo: '/material'\n    });\n})\n\n.controller('AppCtrl', function($scope, $location) {\n  var tabs = $scope.tabs = [\n    { path: '/material', label: 'Material Design' },\n    { path: '/angular', label: 'Use Angular' },\n    { path: '/polymer', label: 'Use Polymer' },\n  ];\n\n  $scope.selectedTabIndex = 0;\n  $scope.$watch('selectedTabIndex', watchSelectedTab);\n  \n  function watchSelectedTab(index, oldIndex) {\n    console.log('selecting from', oldIndex, 'to', index);\n    $scope.reverse = index < oldIndex;\n    $location.path(tabs[index].path);\n  }\n\n})\n\n.controller('MaterialTabCtrl', function($scope) {\n})\n\n.controller('AngularTabCtrl', function($scope) {\n})\n\n.controller('PolymerTabCtrl', function($scope) {\n});\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo5",
              "name": "Dynamic Tabs (buttons only) with $location & routing: ",
              "fileName": "script",
              "relativePath": "script.js/src/components/tabs/demos/demo5/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo5/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial', 'ngRoute'])\n\n.config(function($routeProvider) {\n  $routeProvider\n    .when('/material', {\n      templateUrl: 'material.tmpl.html',\n      controller: 'MaterialTabCtrl'\n    })\n    .when('/angular', {\n      templateUrl: 'angular.tmpl.html',\n      controller: 'AngularTabCtrl'\n    })\n    .when('/polymer', {\n      templateUrl: 'polymer.tmpl.html',\n      controller: 'PolymerTabCtrl'\n    })\n    .otherwise({\n      redirectTo: '/material'\n    });\n})\n\n.controller('AppCtrl', function($scope, $location) {\n  var tabs = $scope.tabs = [\n    { path: '/material', label: 'Material Design' },\n    { path: '/angular', label: 'Use Angular' },\n    { path: '/polymer', label: 'Use Polymer' },\n  ];\n\n  $scope.selectedTabIndex = 0;\n  $scope.$watch('selectedTabIndex', watchSelectedTab);\n  \n  function watchSelectedTab(index, oldIndex) {\n    console.log('selecting from', oldIndex, 'to', index);\n    $scope.reverse = index < oldIndex;\n    $location.path(tabs[index].path);\n  }\n\n})\n\n.controller('MaterialTabCtrl', function($scope) {\n})\n\n.controller('AngularTabCtrl', function($scope) {\n})\n\n.controller('PolymerTabCtrl', function($scope) {\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/tabs/demos/demo5/style.css",
              "content": ".tabs-view {\n  position: absolute;\n  top: 149px;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  animation-duration: 0.35s;\n  animation-timing-function: ease-in-out;\n  -webkit-animation-duration: 0.35s;\n  -webkit-animation-timing-function: ease-in-out;\n}\n\n.tabs-view.ng-enter {\n  animation-name: slideFromRight;\n  -webkit-animation-name: slideFromRight;\n}\n.tabs-view.reverse.ng-enter {\n  animation-name: slideFromLeft;\n  -webkit-animation-name: slideFromLeft;\n}\n.tabs-view.ng-leave {\n  animation-name: slideToLeft;\n  -webkit-animation-name: slideToLeft;\n}\n.tabs-view.reverse.ng-leave {\n  animation-name: slideToRight;\n  -webkit-animation-name: slideToRight;\n}\n\n@keyframes slideFromRight {\n  0% { transform: translateX(100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideFromLeft {\n  0% { transform: translateX(-100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideToRight {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(100%); }\n}\n@keyframes slideToLeft {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-100%); }\n}\n\n@-webkit-keyframes slideFromRight {\n  0% { -webkit-transform: translateX(100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideFromLeft {\n  0% { -webkit-transform: translateX(-100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideToRight {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(100%); }\n}\n@-webkit-keyframes slideToLeft {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(-100%); }\n}\n\n\nng-view {\n    padding-left: 40px;\n}\n\nng-view.tabs-view {\n    margin-left: 20px;\n    margin-right: 20px;\n    margin-bottom: 20px;\n    top: 60px;\n    height:200px;\n}\n",
              "componentId": "material.components.tabs",
              "componentName": "Tabs",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo5",
              "name": "Dynamic Tabs (buttons only) with $location & routing: ",
              "fileName": "style",
              "relativePath": "style.css/src/components/tabs/demos/demo5/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.tabs/demo/demo5/style.css",
              "viewType": "CSS",
              "renderedContent": ".tabs-view {\n  position: absolute;\n  top: 149px;\n  bottom: 0;\n  right: 0;\n  left: 0;\n  animation-duration: 0.35s;\n  animation-timing-function: ease-in-out;\n  -webkit-animation-duration: 0.35s;\n  -webkit-animation-timing-function: ease-in-out;\n}\n\n.tabs-view.ng-enter {\n  animation-name: slideFromRight;\n  -webkit-animation-name: slideFromRight;\n}\n.tabs-view.reverse.ng-enter {\n  animation-name: slideFromLeft;\n  -webkit-animation-name: slideFromLeft;\n}\n.tabs-view.ng-leave {\n  animation-name: slideToLeft;\n  -webkit-animation-name: slideToLeft;\n}\n.tabs-view.reverse.ng-leave {\n  animation-name: slideToRight;\n  -webkit-animation-name: slideToRight;\n}\n\n@keyframes slideFromRight {\n  0% { transform: translateX(100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideFromLeft {\n  0% { transform: translateX(-100%); }\n  100% { transform: translateX(0); }\n}\n@keyframes slideToRight {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(100%); }\n}\n@keyframes slideToLeft {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-100%); }\n}\n\n@-webkit-keyframes slideFromRight {\n  0% { -webkit-transform: translateX(100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideFromLeft {\n  0% { -webkit-transform: translateX(-100%); }\n  100% { -webkit-transform: translateX(0); }\n}\n@-webkit-keyframes slideToRight {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(100%); }\n}\n@-webkit-keyframes slideToLeft {\n  0% { -webkit-transform: translateX(0); }\n  100% { -webkit-transform: translateX(-100%); }\n}\n\n\nng-view {\n    padding-left: 40px;\n}\n\nng-view.tabs-view {\n    margin-left: 20px;\n    margin-right: 20px;\n    margin-bottom: 20px;\n    top: 60px;\n    height:200px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<link rel=\"stylesheet\" href=\"/css/tab_demos.css\">\n\n<div class=\"sample\">\n\n    <div ng-app=\"app\" ng-controller=\"AppCtrl\" >\n\n      <material-tabs selected=\"selectedTabIndex\">\n        <material-tab ng-repeat=\"tab in tabs\"\n                label=\"{{tab.label}}\">\n        </material-tab>\n      </material-tabs>\n\n      <ng-view class=\"tabs-view\" ng-class=\"{reverse: reverse}\"></ng-view>\n\n    </div>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.tabs/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.toast",
    "name": "Toast",
    "docs": [
      {
        "content": "Toasts are notifications that can be created on any part of the screen using the `$materialToast` service.\n",
        "componentId": "material.components.toast",
        "componentName": "Toast",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/toast/README.md",
        "humanName": "Toast",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/toast/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/toast/README.md#Lundefined",
        "url": "/material.components.toast/readme/overview",
        "outputPath": "generated/material.components.toast/readme/overview/index.html",
        "readmeUrl": "/material.components.toast/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Toasts are notifications that can be created on any part of the screen using the <code>$materialToast</code> service.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "Open a toast notification on any position on the screen, with an optional \nduration.\n\nOnly one toast notification may ever be active at any time. If a new toast is\nshown while a different toast is active, the old toast will be automatically\nhidden.\n\n`$materialToast` takes one argument, options, which is defined below.",
        "content": "@ngdoc service\n@name $materialToast\n@module material.components.toast\n\n@description\nOpen a toast notification on any position on the screen, with an optional \nduration.\n\nOnly one toast notification may ever be active at any time. If a new toast is\nshown while a different toast is active, the old toast will be automatically\nhidden.\n\n`$materialToast` takes one argument, options, which is defined below.\n\n@usage\n<hljs lang=\"html\">\n<div ng-controller=\"MyController\">\n  <material-button ng-click=\"openToast()\">\n    Open a Toast!\n  </material-button>\n</div>\n</hljs>\n<hljs lang=\"js\">\nvar app = angular.module('app', ['ngMaterial']);\napp.controller('MyController', function($scope, $materialToast) {\n  $scope.openToast = function($event) {\n    var hideToast = $materialToast({\n      template: '<material-toast>Hello!</material-toast>',\n      duration: 3000\n    });\n  };\n});\n</hljs>\n\n@returns {function} `hideToast` - A function that hides the toast.\n\n@paramType Options\n@param {string=} templateUrl The url of an html template file that will\nbe used as the content of the toast. Restrictions: the template must\nhave an outer `material-toast` element.\n@param {string=} template Same as templateUrl, except this is an actual\ntemplate string.\n@param {number=} duration How many milliseconds the toast should stay\nactive before automatically closing.  Set to 0 to disable duration. \nDefault: 3000.\n@param {string=} position Where to place the toast. Available: any combination\nof 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.\n@param {string=} controller The controller to associate with this toast.\nThe controller will be injected the local `$hideToast`, which is a function\nused to hide the toast.\n@param {string=} locals An object containing key/value pairs. The keys will\nbe used as names of values to inject into the controller. For example, \n`locals: {three: 3}` would inject `three` into the controller with the value\nof 3.\n@param {object=} resolve Similar to locals, except it takes promises as values\nand the toast will not open until the promises resolve.\n@param {string=} controllerAs An alias to assign the controller to on the scope.",
        "componentId": "material.components.toast",
        "componentName": "Toast",
        "docType": "service",
        "name": "$materialToast",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The url of an html template file that will\nbe used as the content of the toast. Restrictions: the template must\nhave an outer `material-toast` element.",
            "startingLine": 63,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "templateUrl"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Same as templateUrl, except this is an actual\ntemplate string.",
            "startingLine": 66,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "template"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "How many milliseconds the toast should stay\nactive before automatically closing.  Set to 0 to disable duration. \nDefault: 3000.",
            "startingLine": 68,
            "typeExpression": "number=",
            "type": {
              "type": "NameExpression",
              "name": "number",
              "optional": true
            },
            "typeList": [
              "number"
            ],
            "optional": true,
            "name": "duration"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Where to place the toast. Available: any combination\nof 'bottom', 'left', 'top', 'right', 'fit'. Default: 'bottom left'.",
            "startingLine": 71,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "position"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "The controller to associate with this toast.\nThe controller will be injected the local `$hideToast`, which is a function\nused to hide the toast.",
            "startingLine": 73,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "controller"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "An object containing key/value pairs. The keys will\nbe used as names of values to inject into the controller. For example, \n`locals: {three: 3}` would inject `three` into the controller with the value\nof 3.",
            "startingLine": 76,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "locals"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Similar to locals, except it takes promises as values\nand the toast will not open until the promises resolve.",
            "startingLine": 80,
            "typeExpression": "object=",
            "type": {
              "type": "NameExpression",
              "name": "object",
              "optional": true
            },
            "typeList": [
              "object"
            ],
            "optional": true,
            "name": "resolve"
          },
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "An alias to assign the controller to on the scope.",
            "startingLine": 82,
            "typeExpression": "string=",
            "type": {
              "type": "NameExpression",
              "name": "string",
              "optional": true
            },
            "typeList": [
              "string"
            ],
            "optional": true,
            "name": "controllerAs"
          }
        ],
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<div ng-controller=\"MyController\">\n  <material-button ng-click=\"openToast()\">\n    Open a Toast!\n  </material-button>\n</div>\n</hljs>\n<hljs lang=\"js\">\nvar app = angular.module('app', ['ngMaterial']);\napp.controller('MyController', function($scope, $materialToast) {\n  $scope.openToast = function($event) {\n    var hideToast = $materialToast({\n      template: '<material-toast>Hello!</material-toast>',\n      duration: 3000\n    });\n  };\n});\n</hljs>",
        "returns": {
          "tagDef": {
            "name": "returns",
            "aliases": [
              "return"
            ],
            "transforms": [
              null,
              null
            ]
          },
          "tagName": "returns",
          "description": "`hideToast` - A function that hides the toast.",
          "startingLine": 60,
          "typeExpression": "function",
          "type": {
            "type": "FunctionType",
            "params": []
          },
          "typeList": [
            "function"
          ]
        },
        "dependencies": [
          "material.services.compiler"
        ],
        "file": "src/components/toast/toast.js",
        "startingLine": 26,
        "paramType": "Options",
        "humanName": "$materialToast",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/toast/toast.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/toast/toast.js#L26",
        "url": "/material.components.toast/service/$materialToast",
        "outputPath": "generated/material.components.toast/service/$materialToast/index.html",
        "readmeUrl": "/material.components.toast/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n  \n\n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p>Open a toast notification on any position on the screen, with an optional \nduration.</p>\n<p>Only one toast notification may ever be active at any time. If a new toast is\nshown while a different toast is active, the old toast will be automatically\nhidden.</p>\n<p><code>$materialToast</code> takes one argument, options, which is defined below.</p>\n\n</div>\n\n\n<div>\n  \n\n    \n\n  <h3 id=\"Usage\">Usage</h3>\n    \n      <hljs lang=\"html\">\n<div ng-controller=\"MyController\">\n  <material-button ng-click=\"openToast()\">\n    Open a Toast!\n  </material-button>\n</div>\n</hljs>\n<hljs lang=\"js\">\nvar app = angular.module(&#39;app&#39;, [&#39;ngMaterial&#39;]);\napp.controller(&#39;MyController&#39;, function($scope, $materialToast) {\n  $scope.openToast = function($event) {\n    var hideToast = $materialToast({\n      template: &#39;<material-toast>Hello!</material-toast>&#39;,\n      duration: 3000\n    });\n  };\n});\n</hljs>\n    \n\n    \n<section class=\"api-section\">\n  <h3>\n    \n      Options\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      templateUrl\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The url of an html template file that will\nbe used as the content of the toast. Restrictions: the template must\nhave an outer <code>material-toast</code> element.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      template\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Same as templateUrl, except this is an actual\ntemplate string.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      duration\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-number\">number</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-number\">number</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>How many milliseconds the toast should stay\nactive before automatically closing.  Set to 0 to disable duration. \nDefault: 3000.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      position\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Where to place the toast. Available: any combination\nof &#39;bottom&#39;, &#39;left&#39;, &#39;top&#39;, &#39;right&#39;, &#39;fit&#39;. Default: &#39;bottom left&#39;.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      controller\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>The controller to associate with this toast.\nThe controller will be injected the local <code>$hideToast</code>, which is a function\nused to hide the toast.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      locals\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>An object containing key/value pairs. The keys will\nbe used as names of values to inject into the controller. For example, \n<code>locals: {three: 3}</code> would inject <code>three</code> into the controller with the value\nof 3.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      resolve\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-object\">object</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-object\">object</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Similar to locals, except it takes promises as values\nand the toast will not open until the promises resolve.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      controllerAs\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-string\">string</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>An alias to assign the controller to on the scope.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n    \n    <h3>Returns</h3>\n<material-list>\n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      \n<code class=\"api-type label type-hint type-hint-function\">function</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><code>hideToast</code> - A function that hides the toast.</p>\n\n    </div>\n  </material-item>\n</material-list>\n\n  \n  \n  \n\n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.toast",
    "demos": [
      {
        "id": "demo1",
        "name": "Toast Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/toast/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialToast, $animate) {\n  \n  $scope.toastPosition = {\n    bottom: true,\n    top: false,\n    left: true,\n    right: false,\n    fit: false\n  };\n\n  $scope.getToastPosition = function() {\n    return Object.keys($scope.toastPosition)\n      .filter(function(pos) { return $scope.toastPosition[pos]; })\n      .join(' ');\n  };\n\n  $scope.complexToastIt = function() {\n    $materialToast({\n      controller: 'ToastCtrl',\n      templateUrl: 'toast-template.html',\n      duration: 5000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n  $scope.toastIt = function() {\n    $materialToast({\n      template: '<material-toast>Hello, ' + Math.random() + '</material-toast>',\n      duration: 2000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n})\n\n.controller('ToastCtrl', function($scope, $hideToast) {\n  $scope.closeToast = function() {\n    $hideToast();\n  };\n});\n",
            "componentId": "material.components.toast",
            "componentName": "Toast",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Toast Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/toast/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.toast/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialToast, $animate) {\n  \n  $scope.toastPosition = {\n    bottom: true,\n    top: false,\n    left: true,\n    right: false,\n    fit: false\n  };\n\n  $scope.getToastPosition = function() {\n    return Object.keys($scope.toastPosition)\n      .filter(function(pos) { return $scope.toastPosition[pos]; })\n      .join(' ');\n  };\n\n  $scope.complexToastIt = function() {\n    $materialToast({\n      controller: 'ToastCtrl',\n      templateUrl: 'toast-template.html',\n      duration: 5000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n  $scope.toastIt = function() {\n    $materialToast({\n      template: '<material-toast>Hello, ' + Math.random() + '</material-toast>',\n      duration: 2000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n})\n\n.controller('ToastCtrl', function($scope, $hideToast) {\n  $scope.closeToast = function() {\n    $hideToast();\n  };\n});\n\n"
          },
          {
            "fileType": "html",
            "file": "src/components/toast/demo1/toast-template.html",
            "content": "<material-toast>\n  <span flex>Hello there!</span>\n  <material-button ng-click=\"closeToast()\">\n    Close\n  </material-button>\n</material-toast>\n",
            "componentId": "material.components.toast",
            "componentName": "Toast",
            "basePath": "toast-template.html",
            "docType": "demo",
            "id": "demo1",
            "name": "Toast Basic Usage",
            "fileName": "toast-template",
            "relativePath": "toast-template.html/src/components/toast/demo1/toast-template.html",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.toast/demo/demo1/toast-template.html",
            "viewType": "HTML",
            "renderedContent": "<material-toast>\n  <span flex>Hello there!</span>\n  <material-button ng-click=\"closeToast()\">\n    Close\n  </material-button>\n</material-toast>\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/toast/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n  <div class=\"inset\">\n    <material-button ng-click=\"toastIt()\">\n      Simple Toast\n    </material-button>\n    <material-button class=\"material-button-raised\" \n            ng-click=\"complexToastIt()\">\n      Advanced Toast\n    </material-button>\n  </div>\n  <material-card>\n    <div>\n      <b>Toast Position: \"{{getToastPosition()}}\"</b>\n    </div>\n    <material-checkbox ng-repeat=\"(name, isSelected) in toastPosition\"\n      ng-model=\"toastPosition[name]\"> \n      {{name}}\n    </material-checkbox>\n  </material-card>\n</div>\n",
          "componentId": "material.components.toast",
          "componentName": "Toast",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Toast Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/toast/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.toast/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/toast/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialToast, $animate) {\n  \n  $scope.toastPosition = {\n    bottom: true,\n    top: false,\n    left: true,\n    right: false,\n    fit: false\n  };\n\n  $scope.getToastPosition = function() {\n    return Object.keys($scope.toastPosition)\n      .filter(function(pos) { return $scope.toastPosition[pos]; })\n      .join(' ');\n  };\n\n  $scope.complexToastIt = function() {\n    $materialToast({\n      controller: 'ToastCtrl',\n      templateUrl: 'toast-template.html',\n      duration: 5000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n  $scope.toastIt = function() {\n    $materialToast({\n      template: '<material-toast>Hello, ' + Math.random() + '</material-toast>',\n      duration: 2000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n})\n\n.controller('ToastCtrl', function($scope, $hideToast) {\n  $scope.closeToast = function() {\n    $hideToast();\n  };\n});\n",
              "componentId": "material.components.toast",
              "componentName": "Toast",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Toast Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/toast/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.toast/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope, $materialToast, $animate) {\n  \n  $scope.toastPosition = {\n    bottom: true,\n    top: false,\n    left: true,\n    right: false,\n    fit: false\n  };\n\n  $scope.getToastPosition = function() {\n    return Object.keys($scope.toastPosition)\n      .filter(function(pos) { return $scope.toastPosition[pos]; })\n      .join(' ');\n  };\n\n  $scope.complexToastIt = function() {\n    $materialToast({\n      controller: 'ToastCtrl',\n      templateUrl: 'toast-template.html',\n      duration: 5000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n  $scope.toastIt = function() {\n    $materialToast({\n      template: '<material-toast>Hello, ' + Math.random() + '</material-toast>',\n      duration: 2000,\n      position: $scope.getToastPosition()\n    });\n  };\n\n})\n\n.controller('ToastCtrl', function($scope, $hideToast) {\n  $scope.closeToast = function() {\n    $hideToast();\n  };\n});\n\n"
            }
          ],
          "css": [],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n  <div class=\"inset\">\n    <material-button ng-click=\"toastIt()\">\n      Simple Toast\n    </material-button>\n    <material-button class=\"material-button-raised\" \n            ng-click=\"complexToastIt()\">\n      Advanced Toast\n    </material-button>\n  </div>\n  <material-card>\n    <div>\n      <b>Toast Position: \"{{getToastPosition()}}\"</b>\n    </div>\n    <material-checkbox ng-repeat=\"(name, isSelected) in toastPosition\"\n      ng-model=\"toastPosition[name]\"> \n      {{name}}\n    </material-checkbox>\n  </material-card>\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.toast/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.toolbar",
    "name": "Toolbar",
    "docs": [
      {
        "content": "Toolbars, created using the `<material-toolbar>` directive.\n",
        "componentId": "material.components.toolbar",
        "componentName": "Toolbar",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/toolbar/README.md",
        "humanName": "Toolbar",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/toolbar/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/toolbar/README.md#Lundefined",
        "url": "/material.components.toolbar/readme/overview",
        "outputPath": "generated/material.components.toolbar/readme/overview/index.html",
        "readmeUrl": "/material.components.toolbar/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    <p>Toolbars, created using the <code>&lt;material-toolbar&gt;</code> directive.</p>\n\n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      },
      {
        "description": "`material-toolbar` is used to place a toolbar in your app.\n\nToolbars are usually used above a content area to display the title of the\ncurrent page, and show relevant action buttons for that page.\n\nYou can change the height of the toolbar by adding either the\n`material-medium-tall` or `material-tall` class to the toolbar.",
        "content": "@ngdoc directive\n@name materialToolbar\n@restrict E\n@description\n`material-toolbar` is used to place a toolbar in your app.\n\nToolbars are usually used above a content area to display the title of the\ncurrent page, and show relevant action buttons for that page.\n\nYou can change the height of the toolbar by adding either the\n`material-medium-tall` or `material-tall` class to the toolbar.\n\n@usage\n<hljs lang=\"html\">\n<div layout=\"vertical\" layout-fill>\n  <material-toolbar>\n\n    <div class=\"material-toolbar-tools\">\n      <span>My App's Title</span>\n\n      <!-- fill up the space between left and right area -->\n      <span flex></span>\n\n      <material-button>\n        Right Bar Button\n      </material-button>\n    </div>\n\n  </material-toolbar>\n  <material-content>\n    Hello!\n  </material-content>\n</div>\n</hljs>\n\n@param {boolean=} scrollShrink Whether the header should shrink away as \nthe user scrolls down, and reveal itself as the user scrolls up. \n\nNote: for scrollShrink to work, the toolbar must be a sibling of a \n`material-content` element, placed before it. See the scroll shrink demo.",
        "componentId": "material.components.toolbar",
        "componentName": "Toolbar",
        "docType": "directive",
        "name": "materialToolbar",
        "params": [
          {
            "tagDef": {
              "name": "param",
              "multi": true,
              "docProperty": "params",
              "transforms": [
                null,
                null,
                null
              ]
            },
            "tagName": "param",
            "description": "Whether the header should shrink away as \nthe user scrolls down, and reveal itself as the user scrolls up. \n\nNote: for scrollShrink to work, the toolbar must be a sibling of a \n`material-content` element, placed before it. See the scroll shrink demo.",
            "startingLine": 49,
            "typeExpression": "boolean=",
            "type": {
              "type": "NameExpression",
              "name": "boolean",
              "optional": true
            },
            "typeList": [
              "boolean"
            ],
            "optional": true,
            "name": "scrollShrink"
          }
        ],
        "restrict": {
          "element": true,
          "attribute": false,
          "cssClass": false,
          "comment": false
        },
        "element": "ANY",
        "priority": 0,
        "usage": "<hljs lang=\"html\">\n<div layout=\"vertical\" layout-fill>\n  <material-toolbar>\n\n    <div class=\"material-toolbar-tools\">\n      <span>My App's Title</span>\n\n      <!-- fill up the space between left and right area -->\n      <span flex></span>\n\n      <material-button>\n        Right Bar Button\n      </material-button>\n    </div>\n\n  </material-toolbar>\n  <material-content>\n    Hello!\n  </material-content>\n</div>\n</hljs>",
        "dependencies": [
          "material.components.content"
        ],
        "file": "src/components/toolbar/toolbar.js",
        "startingLine": 14,
        "humanName": "material-toolbar",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/toolbar/toolbar.js",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/toolbar/toolbar.js#L14",
        "url": "/material.components.toolbar/directive/materialToolbar",
        "outputPath": "generated/material.components.toolbar/directive/materialToolbar/index.html",
        "readmeUrl": "/material.components.toolbar/readme/overview",
        "renderedContent": "<div class=\"doc-content\">\n\n\n\n<header class=\"api-profile-header\">\n    \n</header>\n\n\n\n<div layout=\"horizontal\" class=\"api-options-bar with-icon\">\n</div>\n\n\n<div class=\"api-profile-description\">\n  <p><code>material-toolbar</code> is used to place a toolbar in your app.</p>\n<p>Toolbars are usually used above a content area to display the title of the\ncurrent page, and show relevant action buttons for that page.</p>\n<p>You can change the height of the toolbar by adding either the\n<code>material-medium-tall</code> or <code>material-tall</code> class to the toolbar.</p>\n\n</div>\n\n\n<div>\n  \n\n  \n\n  \n  <div class=\"usage\">\n    <h3 id=\"Usage\">Usage</h3>\n  \n    <hljs lang=\"html\">\n<div layout=\"vertical\" layout-fill>\n  <material-toolbar>\n\n    <div class=\"material-toolbar-tools\">\n      <span>My App&#39;s Title</span>\n\n      <!-- fill up the space between left and right area -->\n      <span flex></span>\n\n      <material-button>\n        Right Bar Button\n      </material-button>\n    </div>\n\n  </material-toolbar>\n  <material-content>\n    Hello!\n  </material-content>\n</div>\n</hljs>\n  \n  </div>\n  \n<section class=\"api-section\">\n  <h3>\n    \n      Attributes\n    \n  </h3>\n\n<material-list>\n  <material-item>\n    <div class=\"api-params-label api-params-title\" layout layout-align=\"center center\" flex=\"35\" flex-sm=\"20\">\n      Parameter\n    </div>\n    <div class=\"api-params-label api-params-title\" hide block-sm flex-sm=\"15\" layout layout-align=\"center center\">\n      Type\n    </div>\n    <div class=\"api-params-content api-params-title\" flex layout=\"horizontal\" layout-align=\"center center\" flex>\n      Description\n    </div>\n  </material-item>\n  \n  <material-item class=\"api-params-item\">\n    <div class=\"api-params-label\" flex=\"35\" flex-sm=\"20\">\n      scrollShrink\n      \n      <span block hide-sm>\n        \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n      </span>\n      <div><em>(optional)</em></div>\n    </div>\n    <div class=\"api-params-label\" hide block-sm flex-sm=\"15\">\n      \n<code class=\"api-type label type-hint type-hint-boolean\">boolean</code>\n    </div>\n    <div class=\"api-params-content\" flex>\n      <p><p>Whether the header should shrink away as \nthe user scrolls down, and reveal itself as the user scrolls up. </p>\n<p>Note: for scrollShrink to work, the toolbar must be a sibling of a \n<code>material-content</code> element, placed before it. See the scroll shrink demo.</p>\n\n      \n      </p>\n    </div>\n  </material-item>\n  \n</material-list>\n</section>\n  \n\n\n  \n</div>\n\n\n</div>\n"
      }
    ],
    "url": "/material.components.toolbar",
    "demos": [
      {
        "id": "demo1",
        "name": "Toolbar Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/toolbar/demo1/script.js",
            "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n\n.directive('svgIcon', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    template: '<svg viewBox=\"0 0 24 24\" style=\"pointer-events: none;\"><g><g><rect fill=\"none\" width=\"24\" height=\"24\"></rect><path d=\"M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z\"></path></g></g></svg>'\n  }\n});",
            "componentId": "material.components.toolbar",
            "componentName": "Toolbar",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo1",
            "name": "Toolbar Basic Usage",
            "fileName": "script",
            "relativePath": "script.js/src/components/toolbar/demo1/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.toolbar/demo/demo1/script.js",
            "viewType": "JavaScript",
            "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n\n.directive('svgIcon', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    template: '<svg viewBox=\"0 0 24 24\" style=\"pointer-events: none;\"><g><g><rect fill=\"none\" width=\"24\" height=\"24\"></rect><path d=\"M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z\"></path></g></g></svg>'\n  }\n});\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/toolbar/demo1/index.html",
          "content": "\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-content>\n\n    <material-toolbar class=\"material-theme-light\">\n      <h1 class=\"material-toolbar-tools\">\n        <span>Toolbar: light-theme (default)</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-dark\">\n      <h1 class=\"material-toolbar-tools\">\n        <span>Toolbar: dark-theme</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-green material-tall\">\n      <h1 class=\"material-toolbar-tools\">\n        <span>Toolbar: tall</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-yellow material-tall\">\n      <span flex></span>\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-bottom\">\n        <span class=\"material-flex\">Toolbar: tall with actions pin to the bottom</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-orange material-medium-tall\">\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-top\">\n        <material-icon style=\"width: 24px; height: 24px;\">\n          <svg-icon></svg-icon>\n        </material-icon>\n      </h1>\n      <span flex></span>\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-bottom\">\n        <span>Toolbar: medium tall with label aligns to the bottom</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-purple material-tall\">\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-top\">\n        <material-icon style=\"width: 24px; height: 24px;\">\n          <svg-icon></svg-icon>\n        </material-icon>\n      </h1>\n      <h1 class=\"material-toolbar-tools\" layout-arrange=\"center center\">\n        <span>Toolbar: label aligns to the middle</span>\n      </h1>\n      <span flex></span>\n      <h1 class=\"material-toolbar-tools\">\n        <div style=\"font-size: 18px\">Some stuff aligns to the bottom</div>\n      </h1>\n    </material-toolbar>\n\n  </material-content>\n</div>\n",
          "componentId": "material.components.toolbar",
          "componentName": "Toolbar",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Toolbar Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/toolbar/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.toolbar/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/toolbar/demo1/script.js",
              "content": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n\n.directive('svgIcon', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    template: '<svg viewBox=\"0 0 24 24\" style=\"pointer-events: none;\"><g><g><rect fill=\"none\" width=\"24\" height=\"24\"></rect><path d=\"M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z\"></path></g></g></svg>'\n  }\n});",
              "componentId": "material.components.toolbar",
              "componentName": "Toolbar",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo1",
              "name": "Toolbar Basic Usage",
              "fileName": "script",
              "relativePath": "script.js/src/components/toolbar/demo1/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.toolbar/demo/demo1/script.js",
              "viewType": "JavaScript",
              "renderedContent": "\nangular.module('app', ['ngMaterial'])\n\n.controller('AppCtrl', function($scope) {\n\n})\n\n.directive('svgIcon', function() {\n  return {\n    restrict: 'E',\n    replace: true,\n    template: '<svg viewBox=\"0 0 24 24\" style=\"pointer-events: none;\"><g><g><rect fill=\"none\" width=\"24\" height=\"24\"></rect><path d=\"M3,18h18v-2H3V18z M3,13h18v-2H3V13z M3,6v2h18V6H3z\"></path></g></g></svg>'\n  }\n});\n"
            }
          ],
          "css": [],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  \n</head>\n<body>\n\n<div ng-app=\"app\" ng-controller=\"AppCtrl\">\n\n  <material-content>\n\n    <material-toolbar class=\"material-theme-light\">\n      <h1 class=\"material-toolbar-tools\">\n        <span>Toolbar: light-theme (default)</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-dark\">\n      <h1 class=\"material-toolbar-tools\">\n        <span>Toolbar: dark-theme</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-green material-tall\">\n      <h1 class=\"material-toolbar-tools\">\n        <span>Toolbar: tall</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-yellow material-tall\">\n      <span flex></span>\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-bottom\">\n        <span class=\"material-flex\">Toolbar: tall with actions pin to the bottom</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-orange material-medium-tall\">\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-top\">\n        <material-icon style=\"width: 24px; height: 24px;\">\n          <svg-icon></svg-icon>\n        </material-icon>\n      </h1>\n      <span flex></span>\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-bottom\">\n        <span>Toolbar: medium tall with label aligns to the bottom</span>\n      </h1>\n    </material-toolbar>\n\n    <br>\n\n    <material-toolbar class=\"material-theme-purple material-tall\">\n      <h1 class=\"material-toolbar-tools material-toolbar-tools-top\">\n        <material-icon style=\"width: 24px; height: 24px;\">\n          <svg-icon></svg-icon>\n        </material-icon>\n      </h1>\n      <h1 class=\"material-toolbar-tools\" layout-arrange=\"center center\">\n        <span>Toolbar: label aligns to the middle</span>\n      </h1>\n      <span flex></span>\n      <h1 class=\"material-toolbar-tools\">\n        <div style=\"font-size: 18px\">Some stuff aligns to the bottom</div>\n      </h1>\n    </material-toolbar>\n\n  </material-content>\n</div>\n\n</body>\n</html>\n"
        }
      },
      {
        "id": "demo2",
        "name": "Scroll Shrinking Toolbar",
        "docType": "demo",
        "files": [
          {
            "fileType": "js",
            "file": "src/components/toolbar/demo2/script.js",
            "content": "var app = angular.module('myApp', ['ngMaterial']);\n\napp.controller('AppCtrl', function($scope) {\n  var item = {\n    face: '/img/list/60.jpeg',\n    what: 'Brunch this weekend?',\n    who: 'Min Li Chan',\n    notes: \"I'll be in your neighborhood doing errands.\"\n  };\n  $scope.todos = [];\n  for (var i = 0; i < 15; i++) {\n    $scope.todos.push({\n      face: '/img/list/60.jpeg',\n      what: \"Brunch this weekend?\",\n      who: \"Min Li Chan\",\n      notes: \"I'll be in your neighborhood doing errands.\"\n    });\n  }\n});\n",
            "componentId": "material.components.toolbar",
            "componentName": "Toolbar",
            "basePath": "script.js",
            "docType": "demo",
            "id": "demo2",
            "name": "Scroll Shrinking Toolbar",
            "fileName": "script",
            "relativePath": "script.js/src/components/toolbar/demo2/script.js",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.toolbar/demo/demo2/script.js",
            "viewType": "JavaScript",
            "renderedContent": "var app = angular.module('myApp', ['ngMaterial']);\n\napp.controller('AppCtrl', function($scope) {\n  var item = {\n    face: '/img/list/60.jpeg',\n    what: 'Brunch this weekend?',\n    who: 'Min Li Chan',\n    notes: \"I'll be in your neighborhood doing errands.\"\n  };\n  $scope.todos = [];\n  for (var i = 0; i < 15; i++) {\n    $scope.todos.push({\n      face: '/img/list/60.jpeg',\n      what: \"Brunch this weekend?\",\n      who: \"Min Li Chan\",\n      notes: \"I'll be in your neighborhood doing errands.\"\n    });\n  }\n});\n\n"
          },
          {
            "fileType": "css",
            "file": "src/components/toolbar/demo2/style.css",
            "content": ".face {\n  width: 48px;\n  margin: 16px;\n  border-radius: 48px;\n  border: 1px solid #ddd;\n}\n",
            "componentId": "material.components.toolbar",
            "componentName": "Toolbar",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo2",
            "name": "Scroll Shrinking Toolbar",
            "fileName": "style",
            "relativePath": "style.css/src/components/toolbar/demo2/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.toolbar/demo/demo2/style.css",
            "viewType": "CSS",
            "renderedContent": ".face {\n  width: 48px;\n  margin: 16px;\n  border-radius: 48px;\n  border: 1px solid #ddd;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/toolbar/demo2/index.html",
          "content": "<div ng-app=\"myApp\" ng-controller=\"AppCtrl\" layout=\"vertical\" layout-fill>\n\n  <material-toolbar scroll-shrink class=\"material-theme-light\">\n    <div class=\"material-toolbar-tools\">\n      <span>My App Title</span>\n    </div>\n  </material-toolbar>\n\n  <material-content>\n\n    <material-list>\n\n      <material-item ng-repeat=\"item in todos\">\n        <div class=\"material-tile-left\">\n          <img ng-src=\"{{item.face}}\" class=\"face\">\n        </div>\n        <div class=\"material-tile-content\">\n          <h2>{{item.what}}</h2>\n          <h3>{{item.who}}</h3>\n          <p>\n            {{item.notes}}\n          </p>\n        </div>\n      </material-item>\n\n    </material-list>\n\n  </material-content>\n\n</div>\n",
          "componentId": "material.components.toolbar",
          "componentName": "Toolbar",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo2",
          "name": "Scroll Shrinking Toolbar",
          "fileName": "index",
          "relativePath": "index.html/src/components/toolbar/demo2/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.toolbar/demo/demo2/index.html",
          "viewType": "HTML",
          "js": [
            {
              "fileType": "js",
              "file": "src/components/toolbar/demo2/script.js",
              "content": "var app = angular.module('myApp', ['ngMaterial']);\n\napp.controller('AppCtrl', function($scope) {\n  var item = {\n    face: '/img/list/60.jpeg',\n    what: 'Brunch this weekend?',\n    who: 'Min Li Chan',\n    notes: \"I'll be in your neighborhood doing errands.\"\n  };\n  $scope.todos = [];\n  for (var i = 0; i < 15; i++) {\n    $scope.todos.push({\n      face: '/img/list/60.jpeg',\n      what: \"Brunch this weekend?\",\n      who: \"Min Li Chan\",\n      notes: \"I'll be in your neighborhood doing errands.\"\n    });\n  }\n});\n",
              "componentId": "material.components.toolbar",
              "componentName": "Toolbar",
              "basePath": "script.js",
              "docType": "demo",
              "id": "demo2",
              "name": "Scroll Shrinking Toolbar",
              "fileName": "script",
              "relativePath": "script.js/src/components/toolbar/demo2/script.js",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.toolbar/demo/demo2/script.js",
              "viewType": "JavaScript",
              "renderedContent": "var app = angular.module('myApp', ['ngMaterial']);\n\napp.controller('AppCtrl', function($scope) {\n  var item = {\n    face: '/img/list/60.jpeg',\n    what: 'Brunch this weekend?',\n    who: 'Min Li Chan',\n    notes: \"I'll be in your neighborhood doing errands.\"\n  };\n  $scope.todos = [];\n  for (var i = 0; i < 15; i++) {\n    $scope.todos.push({\n      face: '/img/list/60.jpeg',\n      what: \"Brunch this weekend?\",\n      who: \"Min Li Chan\",\n      notes: \"I'll be in your neighborhood doing errands.\"\n    });\n  }\n});\n\n"
            }
          ],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/toolbar/demo2/style.css",
              "content": ".face {\n  width: 48px;\n  margin: 16px;\n  border-radius: 48px;\n  border: 1px solid #ddd;\n}\n",
              "componentId": "material.components.toolbar",
              "componentName": "Toolbar",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo2",
              "name": "Scroll Shrinking Toolbar",
              "fileName": "style",
              "relativePath": "style.css/src/components/toolbar/demo2/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.toolbar/demo/demo2/style.css",
              "viewType": "CSS",
              "renderedContent": ".face {\n  width: 48px;\n  margin: 16px;\n  border-radius: 48px;\n  border: 1px solid #ddd;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  <script src=\"script.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<div ng-app=\"myApp\" ng-controller=\"AppCtrl\" layout=\"vertical\" layout-fill>\n\n  <material-toolbar scroll-shrink class=\"material-theme-light\">\n    <div class=\"material-toolbar-tools\">\n      <span>My App Title</span>\n    </div>\n  </material-toolbar>\n\n  <material-content>\n\n    <material-list>\n\n      <material-item ng-repeat=\"item in todos\">\n        <div class=\"material-tile-left\">\n          <img ng-src=\"{{item.face}}\" class=\"face\">\n        </div>\n        <div class=\"material-tile-content\">\n          <h2>{{item.what}}</h2>\n          <h3>{{item.who}}</h3>\n          <p>\n            {{item.notes}}\n          </p>\n        </div>\n      </material-item>\n\n    </material-list>\n\n  </material-content>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.toolbar/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  },
  {
    "id": "material.components.whiteframe",
    "name": "Whiteframe",
    "docs": [
      {
        "content": "",
        "componentId": "material.components.whiteframe",
        "componentName": "Whiteframe",
        "docType": "readme",
        "name": "overview",
        "file": "src/components/whiteframe/README.md",
        "humanName": "Whiteframe",
        "githubUrl": "https:/github.com/angular/material/tree/master/src/components/whiteframe/README.md",
        "githubEditUrl": "https:/github.com/angular/material/edit/master/src/components/whiteframe/README.md#Lundefined",
        "url": "/material.components.whiteframe/readme/overview",
        "outputPath": "generated/material.components.whiteframe/readme/overview/index.html",
        "readmeUrl": "/material.components.whiteframe/readme/overview",
        "renderedContent": "<div layout=\"vertical\" layout-fill class=\"doc-content\">\n  <div flex>\n    \n  </div>\n  <div flex layout=\"vertical\">\n\n    <section ng-repeat=\"demo in currentComponent.demos\" \n      class=\"demo-container material-whiteframe-z1\"\n      ng-class=\"{'no-source': !demo.$showSource}\">\n\n      <material-toolbar class=\"demo-toolbar\"> \n        <div class=\"material-toolbar-tools\">\n          <span>{{demo.name}}</span>\n          <span flex></span>\n          <material-button ng-click=\"demo.$showSource = !demo.$showSource\"\n            ng-class=\"{active: demo.$showSource}\">\n            Show Demo Source\n          </material-button>\n        </div>\n      </material-toolbar>\n\n      <material-tabs>\n        <material-tab ng-repeat=\"file in demo.$files\"\n                      active=\"file === demo.$selectedFile\"\n                      ng-click=\"demo.$selectedFile = file\"\n                      label=\"{{file.basePath}}\">\n        </material-tab>\n      </material-tabs>\n\n      <material-content scroll-y class=\"demo-source-container\">\n        <div class=\"demo-source-content\">\n          <div ng-repeat=\"file in demo.$files\">\n            <hljs code=\"file.content\"\n              lang=\"{{file.fileType}}\"\n              ng-show=\"file === demo.$selectedFile\" >\n            </hljs>\n          </div>\n        </div>\n      </material-content>\n\n      <div class=\"demo-frame-container\" flex ng-class=\"{below: demo.$showSource}\">\n        <iframe class=\"demo\"\n                name=\"{{demo.id}}\"\n                ng-src=\"{{demo.indexFile.outputPath}}\">\n        </iframe>\n      </div>\n\n    </section>\n  </div>\n\n</div>\n\n"
      }
    ],
    "url": "/material.components.whiteframe",
    "demos": [
      {
        "id": "demo1",
        "name": "Whiteframe Basic Usage",
        "docType": "demo",
        "files": [
          {
            "fileType": "css",
            "file": "src/components/whiteframe/demo1/style.css",
            "content": "material-whiteframe {\n  background: #fff;\n  margin: 20px;\n  padding: 20px;\n}\n",
            "componentId": "material.components.whiteframe",
            "componentName": "Whiteframe",
            "basePath": "style.css",
            "docType": "demo",
            "id": "demo1",
            "name": "Whiteframe Basic Usage",
            "fileName": "style",
            "relativePath": "style.css/src/components/whiteframe/demo1/style.css",
            "template": "demo/template.file",
            "outputPath": "generated/material.components.whiteframe/demo/demo1/style.css",
            "viewType": "CSS",
            "renderedContent": "material-whiteframe {\n  background: #fff;\n  margin: 20px;\n  padding: 20px;\n}\n\n"
          }
        ],
        "indexFile": {
          "fileType": "html",
          "file": "src/components/whiteframe/demo1/index.html",
          "content": "<div layout=\"vertical\" layout-fill>\n\n  <material-whiteframe class=\"material-whiteframe-z1\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z1</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z2\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z2</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z3\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z3</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z4\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z4</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z5\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z5</span>\n  </material-whiteframe>\n\n</div>\n",
          "componentId": "material.components.whiteframe",
          "componentName": "Whiteframe",
          "basePath": "index.html",
          "docType": "demo",
          "id": "demo1",
          "name": "Whiteframe Basic Usage",
          "fileName": "index",
          "relativePath": "index.html/src/components/whiteframe/demo1/index.html",
          "template": "demo/template.index.html",
          "outputPath": "generated/material.components.whiteframe/demo/demo1/index.html",
          "viewType": "HTML",
          "js": [],
          "css": [
            {
              "fileType": "css",
              "file": "src/components/whiteframe/demo1/style.css",
              "content": "material-whiteframe {\n  background: #fff;\n  margin: 20px;\n  padding: 20px;\n}\n",
              "componentId": "material.components.whiteframe",
              "componentName": "Whiteframe",
              "basePath": "style.css",
              "docType": "demo",
              "id": "demo1",
              "name": "Whiteframe Basic Usage",
              "fileName": "style",
              "relativePath": "style.css/src/components/whiteframe/demo1/style.css",
              "template": "demo/template.file",
              "outputPath": "generated/material.components.whiteframe/demo/demo1/style.css",
              "viewType": "CSS",
              "renderedContent": "material-whiteframe {\n  background: #fff;\n  margin: 20px;\n  padding: 20px;\n}\n\n"
            }
          ],
          "renderedContent": "<!doctype html>\n<head>\n  <meta name=\"viewport\" content=\"initial-scale=1, maximum-scale=1\" />\n  <link rel=\"stylesheet\" href=\"/demo.css\">\n  <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-animate.min.js\"></script>\n  <script src=\"//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-beta.14/angular-route.min.js\"></script>\n  <script src=\"/docs.js\"></script>\n  \n  <link rel=\"stylesheet\" href=\"style.css\">\n  \n</head>\n<body>\n<div layout=\"vertical\" layout-fill>\n\n  <material-whiteframe class=\"material-whiteframe-z1\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z1</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z2\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z2</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z3\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z3</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z4\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z4</span>\n  </material-whiteframe>\n\n  <material-whiteframe class=\"material-whiteframe-z5\" layout layout-align=\"center center\">\n    <span>.material-whiteframe-z5</span>\n  </material-whiteframe>\n\n</div>\n\n</body>\n</html>\n"
        }
      }
    ],
    "template": "component.template.html",
    "outputPath": "generated/material.components.whiteframe/index.html",
    "renderedContent": "{{currentComponent.name}}\n"
  }
])

DocsApp

.directive('hljs', ['$compile', function($compile) {
  return {
    restrict: 'E',
    compile: function(element, attr) {
      var code;
      //No attribute? code is the content
      if (!attr.code) {
        code = element.html();
        element.empty();
      }

      return function(scope, element, attr) {
        var contentParent = angular.element('<pre><code class="highlight" ng-non-bindable></code></pre>');
        var codeElement = contentParent.find('code');

        // Attribute? code is the evaluation
        if (attr.code) {
          code = scope.$eval(attr.code);
        }
        var highlightedCode = hljs.highlight(attr.language || attr.lang, code.trim());
        highlightedCode.value = highlightedCode.value.replace(/=<span class="hljs-value">""<\/span>/gi, '');
        codeElement.append(highlightedCode.value).addClass('highlight');

        element.append(contentParent);
      };
    }
  };
}])

.directive('codeView', function() {
  return {
    restrict: 'C',
    link: function(scope, element) {
      var code = element.eq(0).clone();
      code.children().removeAttr('class');

      var highlightedCode = hljs.highlight('html', code[0].innerHTML);

      highlightedCode.value = highlightedCode.value.replace(/=<span class="hljs-value">""<\/span>/gi, '');

      element.prepend('<pre><code>' + highlightedCode.value + '</code></pre>');
      element.find('code').addClass('highlight');
    }
  };
})

.directive('iframeCodeView', function() {
  return {
    restrict: 'E',
    link: function(scope, element) {
      var iFrame = element[0].firstElementChild;
      if(iFrame && iFrame.src) {
        var links = angular.element(
          '<p><a class="material-button material-button-raised material-button-colored" href="' + iFrame.src + '" target="_blank">Full View</a> \
           <a class="material-button material-button-raised material-button-colored" href="view-source:' + iFrame.src + '" target="_blank">View Source</a></p>'
        );
        element.append(links);
      }
    }
  };
});

var hljs=new function(){function j(v){return v.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function t(v){return v.nodeName.toLowerCase()}function h(w,x){var v=w&&w.exec(x);return v&&v.index==0}function r(w){var v=(w.className+" "+(w.parentNode?w.parentNode.className:"")).split(/\s+/);v=v.map(function(x){return x.replace(/^lang(uage)?-/,"")});return v.filter(function(x){return i(x)||x=="no-highlight"})[0]}function o(x,y){var v={};for(var w in x){v[w]=x[w]}if(y){for(var w in y){v[w]=y[w]}}return v}function u(x){var v=[];(function w(y,z){for(var A=y.firstChild;A;A=A.nextSibling){if(A.nodeType==3){z+=A.nodeValue.length}else{if(t(A)=="br"){z+=1}else{if(A.nodeType==1){v.push({event:"start",offset:z,node:A});z=w(A,z);v.push({event:"stop",offset:z,node:A})}}}}return z})(x,0);return v}function q(w,y,C){var x=0;var F="";var z=[];function B(){if(!w.length||!y.length){return w.length?w:y}if(w[0].offset!=y[0].offset){return(w[0].offset<y[0].offset)?w:y}return y[0].event=="start"?w:y}function A(H){function G(I){return" "+I.nodeName+'="'+j(I.value)+'"'}F+="<"+t(H)+Array.prototype.map.call(H.attributes,G).join("")+">"}function E(G){F+="</"+t(G)+">"}function v(G){(G.event=="start"?A:E)(G.node)}while(w.length||y.length){var D=B();F+=j(C.substr(x,D[0].offset-x));x=D[0].offset;if(D==w){z.reverse().forEach(E);do{v(D.splice(0,1)[0]);D=B()}while(D==w&&D.length&&D[0].offset==x);z.reverse().forEach(A)}else{if(D[0].event=="start"){z.push(D[0].node)}else{z.pop()}v(D.splice(0,1)[0])}}return F+j(C.substr(x))}function m(y){function v(z){return(z&&z.source)||z}function w(A,z){return RegExp(v(A),"m"+(y.cI?"i":"")+(z?"g":""))}function x(D,C){if(D.compiled){return}D.compiled=true;D.k=D.k||D.bK;if(D.k){var z={};var E=function(G,F){if(y.cI){F=F.toLowerCase()}F.split(" ").forEach(function(H){var I=H.split("|");z[I[0]]=[G,I[1]?Number(I[1]):1]})};if(typeof D.k=="string"){E("keyword",D.k)}else{Object.keys(D.k).forEach(function(F){E(F,D.k[F])})}D.k=z}D.lR=w(D.l||/\b[A-Za-z0-9_]+\b/,true);if(C){if(D.bK){D.b="\\b("+D.bK.split(" ").join("|")+")\\b"}if(!D.b){D.b=/\B|\b/}D.bR=w(D.b);if(!D.e&&!D.eW){D.e=/\B|\b/}if(D.e){D.eR=w(D.e)}D.tE=v(D.e)||"";if(D.eW&&C.tE){D.tE+=(D.e?"|":"")+C.tE}}if(D.i){D.iR=w(D.i)}if(D.r===undefined){D.r=1}if(!D.c){D.c=[]}var B=[];D.c.forEach(function(F){if(F.v){F.v.forEach(function(G){B.push(o(F,G))})}else{B.push(F=="self"?D:F)}});D.c=B;D.c.forEach(function(F){x(F,D)});if(D.starts){x(D.starts,C)}var A=D.c.map(function(F){return F.bK?"\\.?("+F.b+")\\.?":F.b}).concat([D.tE,D.i]).map(v).filter(Boolean);D.t=A.length?w(A.join("|"),true):{exec:function(F){return null}};D.continuation={}}x(y)}function c(S,L,J,R){function v(U,V){for(var T=0;T<V.c.length;T++){if(h(V.c[T].bR,U)){return V.c[T]}}}function z(U,T){if(h(U.eR,T)){return U}if(U.eW){return z(U.parent,T)}}function A(T,U){return !J&&h(U.iR,T)}function E(V,T){var U=M.cI?T[0].toLowerCase():T[0];return V.k.hasOwnProperty(U)&&V.k[U]}function w(Z,X,W,V){var T=V?"":b.classPrefix,U='<span class="'+T,Y=W?"":"</span>";U+=Z+'">';return U+X+Y}function N(){if(!I.k){return j(C)}var T="";var W=0;I.lR.lastIndex=0;var U=I.lR.exec(C);while(U){T+=j(C.substr(W,U.index-W));var V=E(I,U);if(V){H+=V[1];T+=w(V[0],j(U[0]))}else{T+=j(U[0])}W=I.lR.lastIndex;U=I.lR.exec(C)}return T+j(C.substr(W))}function F(){if(I.sL&&!f[I.sL]){return j(C)}var T=I.sL?c(I.sL,C,true,I.continuation.top):e(C);if(I.r>0){H+=T.r}if(I.subLanguageMode=="continuous"){I.continuation.top=T.top}return w(T.language,T.value,false,true)}function Q(){return I.sL!==undefined?F():N()}function P(V,U){var T=V.cN?w(V.cN,"",true):"";if(V.rB){D+=T;C=""}else{if(V.eB){D+=j(U)+T;C=""}else{D+=T;C=U}}I=Object.create(V,{parent:{value:I}})}function G(T,X){C+=T;if(X===undefined){D+=Q();return 0}var V=v(X,I);if(V){D+=Q();P(V,X);return V.rB?0:X.length}var W=z(I,X);if(W){var U=I;if(!(U.rE||U.eE)){C+=X}D+=Q();do{if(I.cN){D+="</span>"}H+=I.r;I=I.parent}while(I!=W.parent);if(U.eE){D+=j(X)}C="";if(W.starts){P(W.starts,"")}return U.rE?0:X.length}if(A(X,I)){throw new Error('Illegal lexeme "'+X+'" for mode "'+(I.cN||"<unnamed>")+'"')}C+=X;return X.length||1}var M=i(S);if(!M){throw new Error('Unknown language: "'+S+'"')}m(M);var I=R||M;var D="";for(var K=I;K!=M;K=K.parent){if(K.cN){D+=w(K.cN,D,true)}}var C="";var H=0;try{var B,y,x=0;while(true){I.t.lastIndex=x;B=I.t.exec(L);if(!B){break}y=G(L.substr(x,B.index-x),B[0]);x=B.index+y}G(L.substr(x));for(var K=I;K.parent;K=K.parent){if(K.cN){D+="</span>"}}return{r:H,value:D,language:S,top:I}}catch(O){if(O.message.indexOf("Illegal")!=-1){return{r:0,value:j(L)}}else{throw O}}}function e(y,x){x=x||b.languages||Object.keys(f);var v={r:0,value:j(y)};var w=v;x.forEach(function(z){if(!i(z)){return}var A=c(z,y,false);A.language=z;if(A.r>w.r){w=A}if(A.r>v.r){w=v;v=A}});if(w.language){v.second_best=w}return v}function g(v){if(b.tabReplace){v=v.replace(/^((<[^>]+>|\t)+)/gm,function(w,z,y,x){return z.replace(/\t/g,b.tabReplace)})}if(b.useBR){v=v.replace(/\n/g,"<br>")}return v}function p(z){var y=b.useBR?z.innerHTML.replace(/\n/g,"").replace(/<br>|<br [^>]*>/g,"\n").replace(/<[^>]*>/g,""):z.textContent;var A=r(z);if(A=="no-highlight"){return}var v=A?c(A,y,true):e(y);var w=u(z);if(w.length){var x=document.createElementNS("http://www.w3.org/1999/xhtml","pre");x.innerHTML=v.value;v.value=q(w,u(x),y)}v.value=g(v.value);z.innerHTML=v.value;z.className+=" hljs "+(!A&&v.language||"");z.result={language:v.language,re:v.r};if(v.second_best){z.second_best={language:v.second_best.language,re:v.second_best.r}}}var b={classPrefix:"hljs-",tabReplace:null,useBR:false,languages:undefined};function s(v){b=o(b,v)}function l(){if(l.called){return}l.called=true;var v=document.querySelectorAll("pre code");Array.prototype.forEach.call(v,p)}function a(){addEventListener("DOMContentLoaded",l,false);addEventListener("load",l,false)}var f={};var n={};function d(v,x){var w=f[v]=x(this);if(w.aliases){w.aliases.forEach(function(y){n[y]=v})}}function k(){return Object.keys(f)}function i(v){return f[v]||f[n[v]]}this.highlight=c;this.highlightAuto=e;this.fixMarkup=g;this.highlightBlock=p;this.configure=s;this.initHighlighting=l;this.initHighlightingOnLoad=a;this.registerLanguage=d;this.listLanguages=k;this.getLanguage=i;this.inherit=o;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/};this.CLCM={cN:"comment",b:"//",e:"$",c:[this.PWM]};this.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[this.PWM]};this.HCM={cN:"comment",b:"#",e:"$",c:[this.PWM]};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM={cN:"number",b:this.BNR,r:0};this.CSSNM={cN:"number",b:this.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0};this.RM={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}}();hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBCM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBCM,a.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:true,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});hljs.registerLanguage("css",function(a){var b="[a-zA-Z-][a-zA-Z0-9_-]*";var c={cN:"function",b:b+"\\(",rB:true,eE:true,e:"\\("};return{cI:true,i:"[=/|']",c:[a.CBCM,{cN:"id",b:"\\#[A-Za-z0-9_-]+"},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"pseudo",b:":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:true,eE:true,r:0,c:[c,a.ASM,a.QSM,a.CSSNM]}]},{cN:"tag",b:b,r:0},{cN:"rules",b:"{",e:"}",i:"[^\\s]",r:0,c:[a.CBCM,{cN:"rule",b:"[^\\s]",rB:true,e:";",eW:true,c:[{cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:true,i:"[^\\s]",starts:{cN:"value",eW:true,eE:true,c:[c,a.CSSNM,a.QSM,a.ASM,a.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]}]}]}});hljs.registerLanguage("xml",function(a){var c="[A-Za-z0-9\\._:-]+";var d={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php",subLanguageMode:"continuous"};var b={eW:true,i:/</,r:0,c:[d,{cN:"attribute",b:c,r:0},{b:"=",r:0,c:[{cN:"value",v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:true,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},{cN:"comment",b:"<!--",e:"-->",r:10},{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[b],starts:{e:"</style>",rE:true,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[b],starts:{e:"<\/script>",rE:true,sL:"javascript"}},{b:"<%",e:"%>",sL:"vbscript"},d,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:"[^ /><]+",r:0},b]}]}});