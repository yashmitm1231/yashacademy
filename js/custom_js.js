jQuery(function() {

  jQuery.fn.equalHeights = function() {
    var max_height = 0;
    jQuery(this).each(function() {
        if (jQuery(this).outerHeight() > max_height) {
            max_height = jQuery(this).outerHeight()+0.4;
        }
    });
    if (Number.prototype.pxToEm) {
        max_height = max_height.pxToEm();
    }
    jQuery(this).css('min-height', max_height);
    return this;
  };
  jQuery('.date').datepicker();
  jQuery('body').find('.info-tiles').each(function() {
      jQuery(this).children('li').equalHeights();
  });
  jQuery('body').on('mouseenter', '[data-tooltip-content], [data-tooltip-target]', function() {
      var scroll_offset = scrollOffset(jQuery(this)),
          window_height = jQuery(window).height(),
          window_width = jQuery(window).width(),
          direction_of_tooltip = (window_width > window_height) ? 'left-or-right' : 'top-or-bottom';
      if (jQuery(this).data('bs.popover') === undefined) {
          jQuery(this).popover({
              container : 'body',
              html : 'true',
              trigger: 'manual',
              title: jQuery(this).data('tooltip-title') || 'Information',
              content: jQuery(jQuery(this).data('tooltip-target')).html() || jQuery(this).data('tooltip-content')
          });
      }

      jQuery(this).popover('show');
      if (direction_of_tooltip === 'left-or-right') {
          var half_tooltip_height = jQuery(this).data('bs.popover').$tip.height() / 2;
          if (scroll_offset.top < half_tooltip_height || (window_height - scroll_offset.top) < half_tooltip_height) {
              direction_of_tooltip = 'top-or-bottom';
          }
      } else {
          var half_tooltip_width = jQuery(this).data('bs.popover').$tip.width() / 2;
          if (scroll_offset.left < half_tooltip_width || (window_width - scroll_offset.left) < half_tooltip_width) {
              direction_of_tooltip = 'left-or-right';
          }
      }

      if (direction_of_tooltip === 'left-or-right') {
          if (scroll_offset.left > (window_width / 2)) {
              jQuery(this).data('bs.popover').options.placement = 'left'
          } else {
              jQuery(this).data('bs.popover').options.placement = 'right'
          }
      } else {
          if (scroll_offset.top > (window_height / 2)) {
              jQuery(this).data('bs.popover').options.placement = 'top'
          } else {
              jQuery(this).data('bs.popover').options.placement = 'bottom'
          }
      }
      jQuery(this).popover('show');
  });
  jQuery('body').on('mouseleave', '[data-tooltip-content], [data-tooltip-target]', function() {
      if (jQuery(this).data('bs.popover') !== undefined) {
          jQuery(this).popover('hide');
      }
  });
  jQuery('body').on('change click', '[data-toggle-display]', function(e) {
    var effect = jQuery(this).data('toggle-effect');
    if (jQuery(this).is(':checkbox, :radio:checked')) {
        toggleDisplay(jQuery(this).data('toggle-display'), jQuery(this).is(':checked'), effect);
    } else {
        e.preventDefault();
        jQuery(jQuery(this).data('toggle-display')).each(function() {
            toggleDisplay(jQuery(this), !jQuery(this).is(':visible'), effect);
        });
    }
  });

  jQuery('body').on('change click', '[data-toggle-hide]', function(e) {
      var effect = jQuery(this).data('toggle-effect');
      if (jQuery(this).is(':checkbox, :radio:checked')) {
          toggleDisplay(jQuery(this).data('toggle-hide'), !jQuery(this).is(':checked'), effect);
      } else {
          e.preventDefault();
          jQuery(jQuery(this).data('toggle-hide')).each(function() {
              toggleDisplay(jQuery(this), !jQuery(this).is(':visible'), effect);
          });
      }
  });
  jQuery('body').on('change click', '[data-toggle-attribute]', function(e) {
    var attributes = jQuery(this).data('toggle-attribute').split(' '),
        target = jQuery(jQuery(this).data('toggle-attribute-target')),
        value = jQuery(this).data('toggle-attribute-value');
    if (jQuery(this).is(':checkbox')) {
    toggleAttributes(target, attributes, value, jQuery(this).is(':checked'));
    } else {
    toggleAttributes(target, attributes, value, (target.attr(attributes[0]) === undefined));
    }
  });
  jQuery('body').on('click', '.delete-item', function(e) {
      jQuery(this).closest('tr').remove();
  });
  jQuery(jQuery('body')).find('.table-fixed').each(function() {
      var height = jQuery(this).outerHeight(),
          fixed_height = jQuery(this).data('fixed-height');
      if(height > fixed_height) {
          jQuery(this).fixedHeaderTable({height: fixed_height});
          jQuery(this).parent().css({'overflow-y':'auto'});
      }
  });
  
  default_modal_options = {
      replace: true
  }
  jQuery('body').on('click', '[data-dialog-href]', function(e) {
    var href = jQuery(this).data('dialog-href');
        id = jQuery(this).data('id'),
        title = jQuery(this).attr('title'),
        ajax_loader = jQuery('<i/>').addClass('dialog-ajax-loader fa fa-spinner fa-4x fa-spin'),
        modal_header = jQuery('<div/>').addClass('modal-header well well-sm'),
        modal_title = jQuery('<h4/>').addClass('modal-title text-center').html(title),
        modal_dismiss = jQuery('<button/>').addClass('close').attr('data-dismiss', 'modal').html('&times;'),
        modal_body = jQuery('<div/>').addClass('modal-body'),
        data_dialog_width = (jQuery(this).data('dialog-width')) ? jQuery(this).data('dialog-width') : "default";;

    window.modal = jQuery('<div/>').addClass('modal '+data_dialog_width).attr('id', id);
    window.data_dialog_width = data_dialog_width;
    jQuery(window.modal).append(modal_header);
    jQuery(modal_header).append(modal_dismiss);
    jQuery(modal_header).append(modal_title);
    jQuery(modal_body).insertAfter(modal_header);
    //jQuery(modal_body).append(ajax_loader);

    e.preventDefault();

    if (href !== undefined) {
        if (href.charAt(0) === '#' || href.charAt(0) === '.') {
            jQuery(modal_body).append(jQuery(href).html());
            if (title === undefined) {
                modal_title.html(jQuery(href).find('.modal-title:first').text());
            }
            modal_body.find('.modal-title:first').hide();
            jQuery(window.modal).modal(default_modal_options);
        } else {
            jQuery.ajax({
              url: href,
              dataTypeString: "html",
              beforeSend: function() {
                  jQuery(window.modal).modal(default_modal_options);
              },
              complete: function(xhr, status) {
                  jQuery(window.modal).modal('hide');
                  var response_without_scripts = jQuery(xhr.responseText).not('script'),
                      response_scripts = jQuery(xhr.responseText).filter('script'),
                      response_html = jQuery('<div/>').html(response_without_scripts);
                  if (title === undefined) {
                      modal_title.html(response_html.find('.modal-title:first').text());
                  }
                  jQuery(modal_body).html(response_html.html());
                  modal_body.find('.modal-title:first').hide();
                  jQuery(response_scripts).appendTo(window.modal);
                  jQuery(window.modal).modal(default_modal_options);
              }
            });
        }
    }
});
});
function scrollOffset(elt) {
  var valueT = 0,
      valueL = 0,
      element = jQuery(elt).get(0);
  if (element !== undefined) {
      do {
          valueT += element.offsetTop || 0;
          valueL += element.offsetLeft || 0;
          // Safari fix
          if (element.offsetParent == document.body && jQuery(element).css('position') == 'absolute') {
              break;
          }
      } while (element = element.offsetParent);

      element = jQuery(elt).get(0);
      do {
          if (!window.opera || element.tagName == 'BODY') {
              valueT -= element.scrollTop || 0;
              valueL -= element.scrollLeft || 0;
          }
      } while (element = element.parentNode);

      return {
          left: valueL,
          top: valueT
      };
  }
}
function toggleAttributes(target, attributes, value, toggle) {
  if (toggle) {
      for(var i=0; i<attributes.length; i++) {
          if(value !== undefined) {
              target.attr(attributes[i], value);
          } else {
              target.attr(attributes[i], attributes[i]);
          }
      }
  } else {
      for(var i=0; i<attributes.length; i++) {
          target.removeAttr(attributes[i]);
      }
  }
}
function toggleDisplay(target, state, effect) {
  if (jQuery(target) !== undefined) {
      if (state === true) {
          if (effect === 'slide') {
              jQuery(target).slideDown().removeClass('hide');
          } else if (effect === 'fade') {
              jQuery(target).fadeIn().removeClass('hide');
          } else {
              jQuery(target).show().removeClass('hide');
          }
      } else {
          if (effect === 'slide') {
              jQuery(target).slideUp();
          } else if (effect === 'fade') {
              jQuery(target).fadeOut();
          } else {
              jQuery(target).hide();
          }
      }
  }
}