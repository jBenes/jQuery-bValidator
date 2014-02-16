/*
url: https://github.com/jBenes/bSlider

TODO:
callbacks - focus, focus out, on error, on valid
custom classes
test checkbox and select rules
add element, which will be shown for valid rows
add valid element for direct dom

DOCS:
show html examples

IMPLEMENT?
custom cleant, valid and invalid functions
options - disable error and valid action

DONE:
DOM choices - row or name based

REJECTED:
generate error messages
setting rules by classes
setting rules for inputs in options
*/

(function($) {

	$.bValidator = {

		defaults: {},

		validations: {},

		transformations: {},

		//settings: {},

		/**
		 * Bings input and form actions, initialises input values, stores settings into form node
		 *
		 * @param form element
		 * @param json settings
		 * @return void
		 */
		init: function(form, settings) {
			var plugin = this;
			// clear plugin bindings and data in order not to have double bindings
			plugin.destruct(form);
			// store settings to form node
			form.data('bValidator', settings);
			// choose elements which should be validated
			var inputs = $('input[data-bvString], input[data-bvStrict], textarea', form);
			inputs.each(function (){
				var input = $(this);
				// bind focus in function
				input.on('focusin.bValidator', function() {
					var settings = $(this).parents('form').data('bValidator');
					plugin.focus($(this), settings);
				});

				// choose event for binding validation action - change for checkboxes and selects. Other inputs focusout
				var method = 'focusout';
				if(input.is('select, input[type="checkbox"], input[type="radio"]')) {
					method = 'change';
				}
				// bind validation event
				input.on(method+'.bValidator', function() {
					plugin.validate($(this));
				});

				if(settings.onKeyUpValidate) {
					input.on('keyup.bValidator', function() {
						plugin.validate($(this));
					});
				}

				// initialize elements - apply transformations, pendings
				plugin.initInput(input);
			});

			//plugin.settings: $.extend({}, defaults, options);

			// bind before submit validations 
			form.on('submit.bValidator', function(e) {
				// obtain settings from form node
				var settings = $(this).data('bValidator');
				// assume that form is valid
				var bValid = true;
				// choose elements which should be validated
				var inputs = $('input[data-bvString], input[data-bvStrict], textarea', $(this));
				// validate all inputs
				inputs.each(function() {
					// if input is invalid, remember it for breaking submitting form later
					if(!plugin.validate($(this))) bValid = false;
				});
				// if form is invalid
				if(!bValid) {
					// call submitFail callback
					settings.onSubmitFail.call( this, e );
					// and forbit submitting form
					e.preventDefault();
				/// if form is valid
				} else {
					// for each input apply focus action -> pendigs are stripped
					inputs.each(function() {
						plugin.focus($(this), settings);
					});
					// and call beforeSubmit callback
					settings.beforeSubmit.call( this, this, e );
				}
			});

		},

		/**
		 * Parses input value, gets input config based on attributes
		 *
		 * @param input element
		 * @return input config
		 */
		getConfig: function(elem) {
			var val = elem.val();
			conf = {};
			// switch value - erase inputs with this value. Fill value of empty inputs on focus out 
			conf['switchVal'] = (elem.attr('data-bvSwitch') == undefined ? '' : elem.attr('data-bvSwitch'));
			// prepended value
			conf['prepend'] = (elem.attr('data-bvPrepend') == undefined ? '' : elem.attr('data-bvPrepend'));
			// key string
			conf['string'] = (elem.attr('data-bvString') == undefined ? '.*' : elem.attr('data-bvString'));
			// appended value
			conf['append'] = (elem.attr('data-bvAppend') == undefined ? '' : elem.attr('data-bvAppend'));
			// string transformation
			conf['transform'] = (elem.attr('data-bvTransform') == undefined ? '' : elem.attr('data-bvTransform'));
			// pattern for regexp
			var pattern = '^.*('+conf['append']+')$';
			var re = new RegExp(pattern, 'i');
			var mand = '?';
			if(val.match(re) != null && val.match(re)[1] != '') mand = '';
			var pattern = '^('+conf['prepend']+')?'+'('+conf['string']+')('+conf['append']+')'+mand+'$';
			var re = new RegExp(pattern, 'i');
			// new string value
			conf['newString'] = val.match(re)[2];

			if(conf['switchVal'] == conf['newString']) conf['newString'] = '';
			// string which fill for empty inputs
			conf['empty'] = (elem.attr('data-bvEmpty') == undefined ? '' : elem.attr('data-bvEmpty'));
			// rules for real validation
			conf['strict'] = (elem.attr('data-bvStrict') == undefined ? '' : elem.attr('data-bvStrict'));

			return conf;
		},

		/**
		 * Initialise input value - applies transformations, switchval, default val, pendings
		 *
		 * @param input element
		 * @return input config
		 */
		initInput: function(elem) {
			// get input clean value, input config 
			conf = this.getConfig(elem);
			// fix prepend escape chars
			conf['prepend'] = conf['prepend'].replace(/\\|\?/g,'');
			// fix append escape chars
			conf['append'] = conf['append'].replace(/\\|\?/g,'');
			// if element value is empty
			if(!elem.val() || elem.val() == conf['empty'] || conf['newString'] == '') { 
				// and if both switchval and empty val are empty, add pendings
				if(conf['empty'] == '' && conf['switchVal'] == '') elem.val(conf['prepend']+conf['append']);
				// else if switchval is empty, apply Empty value
				else if(conf['switchVal'] == '') elem.val(conf['empty']);
				// otherwise add switchval value
				else elem.val(conf['switchVal']);
				//elem.addClass('grey');
			}
			// if value is not empty
			else {
				// apply transformation
				if(conf['transform']) conf['newString'] = this.transform(conf['newString'], conf['transform']);
				// and set value with pendings
				elem.val(conf['prepend']+conf['newString']+conf['append']);
				//elem.removeClass('grey');
			}
			return conf;
		},

		focus: function(elem, settings) {
			conf = this.getConfig(elem);

			if(elem.val() == conf['switchVal']) elem.val('');
			else elem.val($.trim(conf['newString']));
			//elem.removeClass('grey');
			// hide error after focusing element
			if(settings.onFocusHideError) {
 				this.clean(elem, settings);
 			}
		},

		isValid: function(value, rule, elem) {

			if(typeof value === 'undefined') {
				var conf = this.initInput(elem);
				var value = conf['newString'];
			}

			if(typeof rule === 'undefined') {
				var conf = this.initInput(elem);
				var rule = conf['strict'];
			}


			var plugin = this;

			var result = false;

			var ruleEscaped = rule.replace(/({{((?!}}).)*}})/g, '{{NOPARSE}}');

			var ruleReplacements = rule.match(/({{((?!}}).)*}})/g);

			var rulesOr = ruleEscaped.split('|');

			//rulesAnd.each();

			$.each(rulesOr, function(indexOr, ruleOr) {

				var rulesAnd = ruleOr.split('&');
				
				var resultAnd = true;

				$.each(rulesAnd, function(indexAnd, ruleAnd) {
					
					var args = ruleAnd.split(':');

					for (var i = 0; i < args.length; i++) {
						if(args[i].match(/\{\{NOPARSE\}\}/) !== null) {
							var replacement = ruleReplacements.shift();
							args[i] = args[i].replace('{{NOPARSE}}', replacement.slice(2, -2));
						}
					};

					if(!plugin.validations[args[0]].func(value, args, elem)) {
						resultAnd = false;
						return;
					}

				});

				if(resultAnd == true) {
					result = true;
					return;
				}
				
			});

			return result;

		},

		validate: function(elem) {
			var settings = elem.parents('form').data('bValidator');
			this.clean(elem, settings);
			conf = this.initInput(elem);

			if(this.isValid(conf['newString'], conf['strict'], elem)) return this.valid(elem, settings);
			else return this.invalid(elem, settings);
		},

		validation: function() {
			this.validations[arguments[0]] = {
				func: arguments[1],
			};
			  
			return this;
		},

		transform: function(value, method) {
			return this.transformations[method].func(value);
		},

		transformation: function() {
			this.transformations[arguments[0]] = {
				func: arguments[1],
			};
			  
			return this;
		},

		clean: function(elem, settings) {
			if(settings.domType == 'direct') {
				elem.removeClass('error').removeClass('valid');
				elem.parents('form').find('.error-'+elem.attr('name')).removeClass('error').removeClass('valid');
				elem.parents('form').find('label[for="'+elem.attr('name')+'"]').removeClass('error').removeClass('valid');
			} else {
				elem.parents('.row').removeClass('error').removeClass('valid');
			}
		},

		valid: function(elem, settings) {
			if(settings.domType == 'direct') {
				elem.addClass('valid');
				elem.parents('form').find('.error-'+elem.attr('name')).addClass('valid');
				elem.parents('form').find('label[for="'+elem.attr('name')+'"]').addClass('valid');
			} else {
				elem.parents('.row').addClass('valid');
				elem.parents('.row').find('.error-message').addClass('hidden');
			}

			return true;
		},

		invalid: function(elem, settings) {
			if(settings.domType == 'direct') {
				elem.addClass('error');
				elem.parents('form').find('.error-'+elem.attr('name')).addClass('error');
				elem.parents('form').find('label[for="'+elem.attr('name')+'"]').addClass('error');
			} else {
				elem.parents('.row').addClass('error');
				elem.parents('.row').find('.error-message').removeClass('hidden');
			}

			return false;
		},

		destruct: function(form) {
			form.unbind('.bValidator');

			var inputs = $('input[data-bvString], input[data-bvStrict], textarea', form);
			inputs.unbind('.bValidator');

			form.removeData('bValidator');
		}

	}

	$.fn.bValidator = function(options, args) {

		if(typeof options == 'string' && options == 'isValid') {
			var valid = true;
			this.each(function() {
				if(typeof args === 'undefined') {
					args = Array();
				}
				if(!$.bValidator.isValid(undefined, args[0], $(this))) {
					valid =  false;
					return;
				}
			});
			return valid;
		}

		var settings = $.extend({
			onFocusHideError: false, // TODO: little overhead, lookup for settings after each validation
			onKeyUpValidate: false,
			domType: 'row', // other options: 'direct'
			beforeSubmit: function() {},
			onSubmitFail: function() {}
		}, options );

		return this.each(function() {
			if(typeof options == 'string') {
				switch(options) {
					case 'validate':
						return $.bValidator.validate($(this));
						break;
					case 'destruct':
						return $.bValidator.destruct($(this));
						break;
					}
			} else {
				$this = $(this);
				//if($this.is('form')) $.bValidator.init($this, settings);
				//else $.bValidator.init($this.find('form'), settings);

				if(!$this.is('form')) $this = $this.find('form');

				return $this.each(function() {
					$.bValidator.init($(this), settings);
				});
			}
			//if (undefined == $(this).data('bValidator')) {
				//var plugin = new $.bValidator.init();
				//$(this).data('bValidator', plugin);
			//}
		});

	}

})(jQuery);

jQuery.bValidator
.validation('number', function(value, args) {
	valid = (value.match(/^[0-9]+$/) != null);
	if(!valid) return false;
	if(typeof args[1] != 'undefined') {
		intVal = parseInt(value);
		if(args[1] != '') {
			if(intVal < args[1]) return false;
		}
		if(typeof args[2] != 'undefined') {
			if(args[2] != '') {
				if(intVal > args[2]) return false;
			}
		}
	}
	return true;
})
.validation('empty', function(value) {
	return (value == ''); 
})
.validation('if', function(value, args, elem) {
	// arg[0] = rule name -> if
	// arg[1] = name of other input
	// arg[2] = name of other input rule
	// arg[3] = name of current input rule
	var input = elem.parents('form').find('[name="'+args[1]+'"]');
	if(input.bValidator('isValid', Array(args[2]))) {
		return (elem.bValidator('isValid', Array(args[3])));
	} else return true;

})
.validation('ifv', function(value, args, elem) {
	// arg[0] = rule name -> ifv
	// arg[1] = name of other input
	// arg[2] = value of other input rule
	// arg[3] = name of current input rule
	if(elem.parents('form').find('[name="'+args[1]+'"]').val() == args[2]) {
		return (elem.bValidator('isValid', Array(args[3])));
	} else return true;

})
.validation('same', function(value, args) {
	return (value == $('form [name="'+args[1]+'"]').val()); 
})
.validation('reg', function(value, args) {
	return (value.match(args[1]) != null);
})
.validation('string', function(value) { 
	return (value.match(/^.+$/) != null);
})
.validation('email', function(value) { 
	return (value.match(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/) != null && value.length != 0);
})
.validation('zip', function(value) { 
	return (value.match(/^[0-9]{5}$/) != null);
})
.validation('city', function(value) { 
	return (value.match(/^.{2,}$/) != null);
})
.validation('date-d.m.yy', function(value) {
	return (value.match(/^[0123]?[0-9]\.[01]?[0-9]\.[12][09][0-9][0-9]$/) != null);
})
.validation('nin', function(value) { 
	return (value.match(/^[0-9]{6}\/[0-9]{3,4}$/) != null);
})
.validation('false', function(value) { 
	return false;
})
.validation('true', function(value) { 
	return true;
})
.validation('checked', function(value, args, elem) {
	return $(elem).prop('checked');
})
.validation('phone', function(value) {
	var same = 0;
	var inc = 0;
	var i;
  
	var pnumber = value;

	if(!pnumber.match(/^[0-9]{9}$/)) {
		return false;
	}
  
	for(i = 4;i < 9;i++) {
	if(i != 3 && pnumber.charAt(i) == pnumber.charAt(i - 1)) {
		same++;
	}
	if(parseInt(pnumber.charAt(i)) == (parseInt(pnumber.charAt(i - 1)) + 1) || (pnumber.charAt(i) == '0' && pnumber.charAt(i - 1) == '9')) {
		inc++;
	}
	}
	if(same >= 4 || inc >= 5) {
	return false;
	}
	return true;
})
.transformation('noSpaces', function(value) {
	return value.replace(/ /g,'');
});