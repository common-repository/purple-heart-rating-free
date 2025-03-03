jQuery( document ).ready( function () {

	var is_ajax_request = false, rated_on_this_page = false, ajax_loader_image_obj = jQuery( '.wpbph-ajax-loader' );

	/* Show the popover window */
	jQuery( '.wpbph-button-more' ).popover();

	/* Make it pretty */
	function wpbph_pretty() {
		jQuery( '.wpbph-frontend' ).each( function () {
			var width = jQuery( this ).parent().width();
			if ( width < 600 ) {
				jQuery( this ).find( '.wpbph-info, .wpbph-rating' ).css( 'width', '100%' );
			} else {
				jQuery( this ).find( '.wpbph-info, .wpbph-rating' ).css( 'width', '290px' );
			}
		} );
	}

	wpbph_pretty();

	jQuery( window ).resize( function () {
		wpbph_pretty();
	} );

	/* prevent the buttons to do anything */
	jQuery( '.wpbph-frontend button' ).click( function ( event ) {
		event.preventDefault();
	} );

	/* Checks if a variable is a function */
	function is_function( function_to_check ) {
		var getType = {};
		return function_to_check && getType.toString.call( function_to_check ) === '[object Function]';
	}

	/* show the animation */
	jQuery( '.wpbph-button-ok, .wpbph-button-bad, .wpbph-table-big-heart i, .wpbph-heart-small' ).click( function ( event ) {

		if ( is_ajax_request || rated_on_this_page ) {
			return false;
		}

		var button_pressed = jQuery( this ).attr( 'class' );

		var post_id = jQuery( this ).parent().parent().data( 'post_id' );

		var thisObj = jQuery( this );

		/* if the small icon was pressed, get the post_id */
		if ( thisObj.hasClass( 'wpbph-heart-small' ) ) {
			post_id = thisObj.parent().parent().parent().data( 'post_id' );
		}

		ajax_loader_image_obj = thisObj.closest( '.wpbph-rating' ).find( '.wpbph-ajax-loader' );

		jQuery.post( WPBAjaxRating.ajaxurl, {
			'action':         'wpbph_ajax_rate',
			'post_id':        post_id,
			'button_pressed': button_pressed,
			'beforeSend':     function () {
				ajax_loader_image_obj.show().css( 'display', 'inline-block' );
				is_ajax_request = true;
			},
			'complete':       function () {
				ajax_loader_image_obj.fadeOut( 1000 );
				is_ajax_request = false;
			}
		}, function ( response ) {
			if ( 1 == response.error ) {
				alert( response.message );
			} else {
				wpbph_run_up( thisObj.parent().parent().parent().find( '.wpbph-value-inner' ), 0, response.rating_ok, function () {
					window.setTimeout( function () {
						jQuery( '.wpbph-modal' ).modal( 'show' );
					}, 1100 );
				} );
				window.setTimeout( function () {
					wpbph_run_up( thisObj.parent().parent().parent().find( '.wpbph-bad-value-inner' ), 0, response.rating_bad );
				}, 400 );
				rated_on_this_page = true;
				jQuery( '.wpbph-button-ok, .wpbph-button-bad' ).css( 'cursor', 'default' );
			}

		}, 'json' );

	} );

	/* do the percentage animation */
	function wpbph_run_up( e, from, to, after_func ) {

		var stop = false;

		to   = parseInt( to );
		from = parseInt( from );

		e.text( from );

		/* Stop if we start at zero and want to go to zero */
		if ( 0 == to ) {
			if ( is_function( after_func ) ) {
				after_func();
			}
			return;
		}

		if ( to < from ) {
			from = from - 1;
			if ( from < to ) {
				stop = true;
			}
		}
		else {
			from = from + 1;
			if ( from > to ) {
				stop = true;
			}
		}


		if ( true == stop ) {
			e.css( 'opacity', 0.1 );
			e.animate( { 'opacity': 1 }, 1000 );
			if ( is_function( after_func ) ) {
				after_func();
			}
			return;
		}

		window.setTimeout( function () {
			wpbph_run_up( e, from, to, after_func );
		}, 10 );
	}

	/* Refresh the ratings on page load so that it gets the latest ratings
	 * This is because when caching is ON it doesn't show the latest ratings
	 */
	function refresh_ratings() {
		jQuery.post( WPBAjaxRating.ajaxurl, {
			'action':  'wpbph_ajax_refresh_post_ratings',
			'post_id': WPBAjaxRating.current_post_id
		}, function ( response ) {
			if ( 1 == response.error ) {
				/* Do not show an error message here */
				/* alert( response.message ); */
			} else {

				/* Update the top ratings */
				wpbph_run_up( jQuery( '.wpbph-value-inner' ), 0, response.rating_ok );
				window.setTimeout( function () {
					wpbph_run_up( jQuery( '.wpbph-bad-value-inner' ), 0, response.rating_bad );
				}, 500 );

			}

		}, 'json' );
	}

	/* Get the new ratings */
	refresh_ratings();

} );
/* =========================================================
 * bootstrap-modal.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#modals
 * =========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


!function ( $ ) {

	"use strict"; // jshint ;_;


	/* MODAL CLASS DEFINITION
	 * ====================== */

	var Modal = function ( element, options ) {
		this.options  = options
		this.$element = $( element )
			.delegate( '[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy( this.hide, this ) )
		this.options.remote && this.$element.find( '.modal-body' ).load( this.options.remote )
	}

	Modal.prototype = {

		constructor: Modal

		, toggle: function () {
			return this[ !this.isShown ? 'show' : 'hide' ]()
		}

		, show: function () {
			var that = this
				, e  = $.Event( 'show' )

			this.$element.trigger( e )

			if ( this.isShown || e.isDefaultPrevented() ) {
				return
			}

			this.isShown = true

			this.escape()

			this.backdrop( function () {
				var transition = $.support.transition && that.$element.hasClass( 'fade' )

				if ( !that.$element.parent().length ) {
					that.$element.appendTo( document.body ) //don't move modals dom position
				}

				that.$element.show()

				if ( transition ) {
					that.$element[ 0 ].offsetWidth // force reflow
				}

				that.$element
					.addClass( 'in' )
					.attr( 'aria-hidden', false )

				that.enforceFocus()

				transition ?
					that.$element.one( $.support.transition.end, function () {
						that.$element.focus().trigger( 'shown' )
					} ) :
					that.$element.focus().trigger( 'shown' )

			} )
		}

		, hide: function ( e ) {
			e && e.preventDefault()

			var that = this

			e = $.Event( 'hide' )

			this.$element.trigger( e )

			if ( !this.isShown || e.isDefaultPrevented() ) {
				return
			}

			this.isShown = false

			this.escape()

			$( document ).off( 'focusin.modal' )

			this.$element
				.removeClass( 'in' )
				.attr( 'aria-hidden', true )

			$.support.transition && this.$element.hasClass( 'fade' ) ?
				this.hideWithTransition() :
				this.hideModal()
		}

		, enforceFocus: function () {
			var that = this
			$( document ).on( 'focusin.modal', function ( e ) {
				if ( that.$element[ 0 ] !== e.target && !that.$element.has( e.target ).length ) {
					that.$element.focus()
				}
			} )
		}

		, escape: function () {
			var that = this
			if ( this.isShown && this.options.keyboard ) {
				this.$element.on( 'keyup.dismiss.modal', function ( e ) {
					e.which == 27 && that.hide()
				} )
			} else if ( !this.isShown ) {
				this.$element.off( 'keyup.dismiss.modal' )
			}
		}

		, hideWithTransition: function () {
			var that      = this
				, timeout = setTimeout( function () {
				that.$element.off( $.support.transition.end )
				that.hideModal()
			}, 500 )

			this.$element.one( $.support.transition.end, function () {
				clearTimeout( timeout )
				that.hideModal()
			} )
		}

		, hideModal: function () {
			var that = this
			this.$element.hide()
			this.backdrop( function () {
				that.removeBackdrop()
				that.$element.trigger( 'hidden' )
			} )
		}

		, removeBackdrop: function () {
			this.$backdrop && this.$backdrop.remove()
			this.$backdrop = null
		}

		, backdrop: function ( callback ) {
			var that      = this
				, animate = this.$element.hasClass( 'fade' ) ? 'fade' : ''

			if ( this.isShown && this.options.backdrop ) {
				var doAnimate = $.support.transition && animate

				this.$backdrop = $( '<div class="modal-backdrop ' + animate + '" />' )
					.appendTo( document.body )

				this.$backdrop.click(
					this.options.backdrop == 'static' ?
						$.proxy( this.$element[ 0 ].focus, this.$element[ 0 ] )
						: $.proxy( this.hide, this )
				)

				if ( doAnimate ) {
					this.$backdrop[ 0 ].offsetWidth
				} // force reflow

				this.$backdrop.addClass( 'in' )

				if ( !callback ) {
					return
				}

				doAnimate ?
					this.$backdrop.one( $.support.transition.end, callback ) :
					callback()

			} else if ( !this.isShown && this.$backdrop ) {
				this.$backdrop.removeClass( 'in' )

				$.support.transition && this.$element.hasClass( 'fade' ) ?
					this.$backdrop.one( $.support.transition.end, callback ) :
					callback()

			} else if ( callback ) {
				callback()
			}
		}
	}


	/* MODAL PLUGIN DEFINITION
	 * ======================= */

	var old = $.fn.modal

	$.fn.modal = function ( option ) {
		return this.each( function () {
			var $this     = $( this )
				, data    = $this.data( 'modal' )
				, options = $.extend( {}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option )
			if ( !data ) {
				$this.data( 'modal', (data = new Modal( this, options )) )
			}
			if ( typeof option == 'string' ) {
				data[ option ]()
			} else if ( options.show ) {
				data.show()
			}
		} )
	}

	$.fn.modal.defaults = {
		backdrop:   true
		, keyboard: true
		, show:     true
	}

	$.fn.modal.Constructor = Modal


	/* MODAL NO CONFLICT
	 * ================= */

	$.fn.modal.noConflict = function () {
		$.fn.modal = old
		return this
	}


	/* MODAL DATA-API
	 * ============== */

	$( document ).on( 'click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
		var $this     = $( this )
			, href    = $this.attr( 'href' )
			, $target = $( $this.attr( 'data-target' ) || (href && href.replace( /.*(?=#[^\s]+$)/, '' )) ) //strip for ie7
			,
			option    = $target.data( 'modal' ) ? 'toggle' : $.extend( { remote: !/#/.test( href ) && href }, $target.data(), $this.data() )

		e.preventDefault()

		$target
			.modal( option )
			.one( 'hide', function () {
				$this.focus()
			} )
	} )

}( window.jQuery );

/* ===========================================================
 * bootstrap-tooltip.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ( $ ) {

	"use strict"; // jshint ;_;


	/* TOOLTIP PUBLIC CLASS DEFINITION
	 * =============================== */

	var Tooltip = function ( element, options ) {
		this.init( 'tooltip', element, options )
	}

	Tooltip.prototype = {

		constructor: Tooltip

		, init: function ( type, element, options ) {
			var eventIn
				, eventOut
				, triggers
				, trigger
				, i

			this.type     = type
			this.$element = $( element )
			this.options  = this.getOptions( options )
			this.enabled  = true

			triggers = this.options.trigger.split( ' ' )

			for ( i = triggers.length; i--; ) {
				trigger = triggers[ i ]
				if ( trigger == 'click' ) {
					this.$element.on( 'click.' + this.type, this.options.selector, $.proxy( this.toggle, this ) )
				} else if ( trigger != 'manual' ) {
					eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
					eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'
					this.$element.on( eventIn + '.' + this.type, this.options.selector, $.proxy( this.enter, this ) )
					this.$element.on( eventOut + '.' + this.type, this.options.selector, $.proxy( this.leave, this ) )
				}
			}

			this.options.selector ?
				(this._options = $.extend( {}, this.options, { trigger: 'manual', selector: '' } )) :
				this.fixTitle()
		}

		, getOptions: function ( options ) {
			options = $.extend( {}, $.fn[ this.type ].defaults, this.$element.data(), options )

			if ( options.delay && typeof options.delay == 'number' ) {
				options.delay = {
					show:   options.delay
					, hide: options.delay
				}
			}

			return options
		}

		, enter: function ( e ) {
			var defaults  = $.fn[ this.type ].defaults
				, options = {}
				, self

			this._options && $.each( this._options, function ( key, value ) {
				if ( defaults[ key ] != value ) {
					options[ key ] = value
				}
			}, this )

			self = $( e.currentTarget )[ this.type ]( options ).data( this.type )

			if ( !self.options.delay || !self.options.delay.show ) {
				return self.show()
			}

			clearTimeout( this.timeout )
			self.hoverState = 'in'
			this.timeout    = setTimeout( function () {
				if ( self.hoverState == 'in' ) {
					self.show()
				}
			}, self.options.delay.show )
		}

		, leave: function ( e ) {
			var self = $( e.currentTarget )[ this.type ]( this._options ).data( this.type )

			if ( this.timeout ) {
				clearTimeout( this.timeout )
			}
			if ( !self.options.delay || !self.options.delay.hide ) {
				return self.hide()
			}

			self.hoverState = 'out'
			this.timeout    = setTimeout( function () {
				if ( self.hoverState == 'out' ) {
					self.hide()
				}
			}, self.options.delay.hide )
		}

		, show: function () {
			var $tip
				, pos
				, actualWidth
				, actualHeight
				, placement
				, tp
				, e = $.Event( 'show' )

			if ( this.hasContent() && this.enabled ) {
				this.$element.trigger( e )
				if ( e.isDefaultPrevented() ) {
					return
				}
				$tip = this.tip()
				this.setContent()

				if ( this.options.animation ) {
					$tip.addClass( 'fade' )
				}

				placement = typeof this.options.placement == 'function' ?
					this.options.placement.call( this, $tip[ 0 ], this.$element[ 0 ] ) :
					this.options.placement

				$tip
					.detach()
					.css( { top: 0, left: 0, display: 'block' } )

				this.options.container ? $tip.appendTo( this.options.container ) : $tip.insertAfter( this.$element )

				pos = this.getPosition()

				actualWidth  = $tip[ 0 ].offsetWidth
				actualHeight = $tip[ 0 ].offsetHeight

				switch ( placement ) {
					case 'bottom':
						tp = { top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 }
						break
					case 'top':
						tp = { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 }
						break
					case 'left':
						tp = { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth }
						break
					case 'right':
						tp = { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }
						break
				}

				this.applyPlacement( tp, placement )
				this.$element.trigger( 'shown' )
			}
		}

		, applyPlacement: function ( offset, placement ) {
			var $tip     = this.tip()
				, width  = $tip[ 0 ].offsetWidth
				, height = $tip[ 0 ].offsetHeight
				, actualWidth
				, actualHeight
				, delta
				, replace

			$tip
				.offset( offset )
				.addClass( placement )
				.addClass( 'in' )

			actualWidth  = $tip[ 0 ].offsetWidth
			actualHeight = $tip[ 0 ].offsetHeight

			if ( placement == 'top' && actualHeight != height ) {
				offset.top = offset.top + height - actualHeight
				replace    = true
			}

			if ( placement == 'bottom' || placement == 'top' ) {
				delta = 0

				if ( offset.left < 0 ) {
					delta       = offset.left * -2
					offset.left = 0
					$tip.offset( offset )
					actualWidth  = $tip[ 0 ].offsetWidth
					actualHeight = $tip[ 0 ].offsetHeight
				}

				this.replaceArrow( delta - width + actualWidth, actualWidth, 'left' )
			} else {
				this.replaceArrow( actualHeight - height, actualHeight, 'top' )
			}

			if ( replace ) {
				$tip.offset( offset )
			}
		}

		, replaceArrow: function ( delta, dimension, position ) {
			this
				.arrow()
				.css( position, delta ? (50 * (1 - delta / dimension) + "%") : '' )
		}

		, setContent: function () {
			var $tip    = this.tip()
				, title = this.getTitle()

			$tip.find( '.tooltip-inner' )[ this.options.html ? 'html' : 'text' ]( title )
			$tip.removeClass( 'fade in top bottom left right' )
		}

		, hide: function () {
			var that   = this
				, $tip = this.tip()
				, e    = $.Event( 'hide' )

			this.$element.trigger( e )
			if ( e.isDefaultPrevented() ) {
				return
			}

			$tip.removeClass( 'in' )

			function removeWithAnimation() {
				var timeout = setTimeout( function () {
					$tip.off( $.support.transition.end ).detach()
				}, 500 )

				$tip.one( $.support.transition.end, function () {
					clearTimeout( timeout )
					$tip.detach()
				} )
			}

			$.support.transition && this.$tip.hasClass( 'fade' ) ?
				removeWithAnimation() :
				$tip.detach()

			this.$element.trigger( 'hidden' )

			return this
		}

		, fixTitle: function () {
			var $e = this.$element
			if ( $e.attr( 'title' ) || typeof($e.attr( 'data-original-title' )) != 'string' ) {
				$e.attr( 'data-original-title', $e.attr( 'title' ) || '' ).attr( 'title', '' )
			}
		}

		, hasContent: function () {
			return this.getTitle()
		}

		, getPosition: function () {
			var el = this.$element[ 0 ]
			return $.extend( {}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
				width:    el.offsetWidth
				, height: el.offsetHeight
			}, this.$element.offset() )
		}

		, getTitle: function () {
			var title
				, $e = this.$element
				, o  = this.options

			title = $e.attr( 'data-original-title' )
				|| (typeof o.title == 'function' ? o.title.call( $e[ 0 ] ) : o.title)

			return title
		}

		, tip: function () {
			return this.$tip = this.$tip || $( this.options.template )
		}

		, arrow: function () {
			return this.$arrow = this.$arrow || this.tip().find( ".tooltip-arrow" )
		}

		, validate: function () {
			if ( !this.$element[ 0 ].parentNode ) {
				this.hide()
				this.$element = null
				this.options  = null
			}
		}

		, enable: function () {
			this.enabled = true
		}

		, disable: function () {
			this.enabled = false
		}

		, toggleEnabled: function () {
			this.enabled = !this.enabled
		}

		, toggle: function ( e ) {
			var self = e ? $( e.currentTarget )[ this.type ]( this._options ).data( this.type ) : this
			self.tip().hasClass( 'in' ) ? self.hide() : self.show()
		}

		, destroy: function () {
			this.hide().$element.off( '.' + this.type ).removeData( this.type )
		}

	}


	/* TOOLTIP PLUGIN DEFINITION
	 * ========================= */

	var old = $.fn.tooltip

	$.fn.tooltip = function ( option ) {
		return this.each( function () {
			var $this     = $( this )
				, data    = $this.data( 'tooltip' )
				, options = typeof option == 'object' && option
			if ( !data ) {
				$this.data( 'tooltip', (data = new Tooltip( this, options )) )
			}
			if ( typeof option == 'string' ) {
				data[ option ]()
			}
		} )
	}

	$.fn.tooltip.Constructor = Tooltip

	$.fn.tooltip.defaults = {
		animation:   true
		, placement: 'top'
		, selector:  false
		, template:  '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
		, trigger:   'hover focus'
		, title:     ''
		, delay:     0
		, html:      false
		, container: false
	}


	/* TOOLTIP NO CONFLICT
	 * =================== */

	$.fn.tooltip.noConflict = function () {
		$.fn.tooltip = old
		return this
	}

}( window.jQuery );

/* ===========================================================
 * bootstrap-popover.js v2.3.1
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ( $ ) {

	"use strict"; // jshint ;_;


	/* POPOVER PUBLIC CLASS DEFINITION
	 * =============================== */

	var Popover = function ( element, options ) {
		this.init( 'popover', element, options )
	}


	/* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
	 ========================================== */

	Popover.prototype = $.extend( {}, $.fn.tooltip.Constructor.prototype, {

		constructor: Popover

		, setContent: function () {
			var $tip      = this.tip()
				, title   = this.getTitle()
				, content = this.getContent()

			$tip.find( '.popover-title' )[ this.options.html ? 'html' : 'text' ]( title )
			$tip.find( '.popover-content' )[ this.options.html ? 'html' : 'text' ]( content )

			$tip.removeClass( 'fade top bottom left right in' )
		}

		, hasContent: function () {
			return this.getTitle() || this.getContent()
		}

		, getContent: function () {
			var content
				, $e = this.$element
				, o  = this.options

			content = (typeof o.content == 'function' ? o.content.call( $e[ 0 ] ) : o.content)
				|| $e.attr( 'data-content' )

			return content
		}

		, tip: function () {
			if ( !this.$tip ) {
				this.$tip = $( this.options.template )
			}
			return this.$tip
		}

		, destroy: function () {
			this.hide().$element.off( '.' + this.type ).removeData( this.type )
		}

	} )


	/* POPOVER PLUGIN DEFINITION
	 * ======================= */

	var old = $.fn.popover

	$.fn.popover = function ( option ) {
		return this.each( function () {
			var $this     = $( this )
				, data    = $this.data( 'popover' )
				, options = typeof option == 'object' && option
			if ( !data ) {
				$this.data( 'popover', (data = new Popover( this, options )) )
			}
			if ( typeof option == 'string' ) {
				data[ option ]()
			}
		} )
	}

	$.fn.popover.Constructor = Popover

	$.fn.popover.defaults = $.extend( {}, $.fn.tooltip.defaults, {
		placement: 'right'
		,
		trigger:   'click'
		,
		content:   ''
		,
		template:  '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
	} )


	/* POPOVER NO CONFLICT
	 * =================== */

	$.fn.popover.noConflict = function () {
		$.fn.popover = old
		return this
	}

}( window.jQuery );
