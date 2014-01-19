/*
TODO:
otestovat
ukladat paramy do pameti uzlu??
pridat callbacky
checknout pravidla pro selecty a radia

custom classy
zmena DOMu
dogenerovani hlasek
error hlasky

definovani pravidel pro inputz pomoci trid
predani nastaveni inputu pomoci configu

fix focusout + change
parser reg rename
*/

(function($) {

	$.bValidator = {

		defaults: {
		},

		validations: {},

		transformations: {},

		//settings: {},

		init: function(form, settings) {
			var plugin = this;
			plugin.destruct(form);
			
			form.data('bValidator', settings);

			var inputs = $('input[data-bvString], input[data-bvStrict], textarea', form);
			inputs.each(function (){
				$(this).on('focusin.bValidator', function() {
					plugin.focus($(this));
				});

				$(this).on('focusout.bValidator', function() {
					plugin.validate($(this));
				});

				$(this).on('change.bValidator', function() {
					plugin.validate($(this));
				});
				
				plugin.initInput($(this));
			});

			//plugin.settings: $.extend({}, defaults, options);

			form.on('submit.bValidator', function(e) {
				var settings = $(this).data('bValidator');
				var bValid = true;
				var inputs = $('input[data-bvString], input[data-bvStrict], textarea', $(this));

				inputs.each(function() {
					if(!plugin.validate($(this))) bValid = false;
				});

				if(!bValid) {
					settings.onSubmitFail.call( this, e );
					e.preventDefault();
				} else {
					inputs.each(function() {
						plugin.focus($(this));
					});
					//console.log(settings);
					settings.beforeSubmit.call( this, this, e );
				}
			});

		},

		getConfig: function(elem) {
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
			var pattern = '('+conf['prepend']+')?'+'('+conf['string']+')('+conf['append']+')?'+'';
			var re = new RegExp(pattern, 'i');
			// new string value
			conf['newString'] = elem.val().match(re)[2];
			// string which fill for empty inputs
			conf['empty'] = (elem.attr('data-bvEmpty') == undefined ? '' : elem.attr('data-bvEmpty'));
			// rules for real validation
			conf['strict'] = (elem.attr('data-bvStrict') == undefined ? '' : elem.attr('data-bvStrict'));

			return conf;
		},

		initInput: function(elem) {
			conf = this.getConfig(elem);

			conf['prepend'] = conf['prepend'].replace(/\\|\?/g,'');
			conf['append'] = conf['append'].replace(/\\|\?/g,'');
			if(!elem.val() || elem.val() == conf['empty'] || conf['newString'] == '') { 
				if(conf['empty'] == '' && conf['switchVal'] == '') elem.val(conf['prepend']+conf['append']);
				else if(conf['switchVal'] == '') elem.val(conf['empty']);
				else elem.val(conf['switchVal']);
				//elem.addClass('grey');
			}
			else {
				if(conf['transform']) conf['newString'] = this.transform(conf['newString'], conf['transform']);
				elem.val(conf['prepend']+conf['newString']+conf['append']);
				//elem.removeClass('grey');
			}
			return conf;
		},

		focus: function(elem) {
			conf = this.getConfig(elem);

			if(elem.val() == conf['switchVal']) elem.val('');
			else elem.val($.trim(conf['newString']));
			//elem.removeClass('grey');
			//this.clean(elem);
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

					/*console.log(args);
					console.log(value);
					console.log(rule);
					console.log(elem);*/


					/*if(typeof this.validations[rule] === 'undefined') {
						if(value.match(rule) == null) {
							resultAnd = false;
							return;
						}
					} else {*/
						//console.log(args);

						if(!plugin.validations[args[0]].func(value, args, elem)) {
							resultAnd = false;
							return;
						}
					//}

				});

				if(resultAnd == true) {
					result = true;
					return;
				} 



				/*var args = ruleOr.split(':');

				if(plugin.validations[args[0]].func(value, args)) {
					result = true;
					return;
				}
				console.log(args);*/
				//console.log(val);

				//console.log(rulesAnd);
				
			});

			//console.log(rulesAnd);


			return result;

			/*if(rule.indexOf("\\|") != -1) {
				if(typeof this.validations[rule] === 'undefined') {
					return (value.match(rule) != null);
				}
				return this.validations[rule].func(value);	
			} else {
				var args = rule.split('|');
				if(typeof this.validations[args[0]] === 'undefined') {
					return (value.match(rule) != null);
				}
				return this.validations[args[0]].func(value, args);
			}*/
		},

		validate: function(elem) {
			this.clean(elem);
			conf = this.initInput(elem);

			if(this.isValid(conf['newString'], conf['strict'], elem)) return this.valid(elem);
			else return this.invalid(elem);
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

		clean: function(elem) {
			elem.removeClass('error').removeClass('valid');
			elem.parents('.row').find('.bverror-'+elem.attr('name')).removeClass('error').removeClass('valid');
			elem.parents('.row').find('label[for="'+elem.attr('name')+'"]').removeClass('error').removeClass('valid');
			//elem.parents('.row').removeClass('error').removeClass('valid');
		},

		valid: function(elem) {
			elem.addClass('valid');
			elem.parents('.row').find('.bverror-'+elem.attr('name')).addClass('valid');
			elem.parents('.row').find('label[for="'+elem.attr('name')+'"]').addClass('valid');

			//elem.parents('.row').addClass('valid');
			//elem.parents('.row').find('.error-message').addClass('hidden');
			return true;
		},

		invalid: function(elem) {
			elem.addClass('error');
			elem.parents('.row').find('.bverror-'+elem.attr('name')).addClass('error');
			elem.parents('.row').find('label[for="'+elem.attr('name')+'"]').addClass('error');

			//elem.parents('.row').addClass('error');
			//elem.parents('.row').find('.error-message').removeClass('hidden');
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