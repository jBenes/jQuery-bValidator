bValidator
==========

jQuery form validator

## Handling form ##

### Init form: ###
	
	$('form').bValidator();


### Init form with submit callbacks: ###
	
	$('form').bValidator({
	    onSubmitFail: function(form, e) {
	        console.log('Some inputs are not valid');
	    },
	    beforeSubmit: function(form, e) {
	        console.log('Validation success');
	    }
	});

### Remove validations: ###

	$('form').bValidator('destruct');

## Working with inputs ##

### Setting validation rules ###

You can set custom validation rule by adding **data-bvStrict** attribute to the input.

Validate input as email

	data-bvStrict="email"

Validate input as phone

	data-bvStrict="phone"
	
Validate input as czech number

	data-bvStrict="number"
	
Number > 1

	data-bvStrict="number:1"
	
Number < 10

	data-bvStrict="number::10"
	
Number between 1 and 10

	data-bvStrict="number:1:10"
	
Input has to be empty

	data-bvStrict="empty"
	
Input has to be string string

	data-bvStrict="string"
	
Validate input as date dd.mm.yyyy

	data-bvStrict="date-d.m.yy"
	
Allways return false

	data-bvStrict="false"
	
Allways return true

	data-bvStrict="true"
	
Checkbox has to be checked

	data-bvStrict="checked"
	
Validate input by regular expression

	data-bvStrict="reg:^[\d]{2,3}$"
	
If regular expression contains **|** or **&**, it has to be inside double brackets **{{** **}}** 

	data-bvStrict="reg:{{^him|her$}}"

### Connected rules ###

Input has to have same value as input with name **password**

	data-bvStrict="same:password"

### Conditions ###

If input with name **service** is valid by rule **checked**, rule validates input by rule **email**
If **service** is not valid, rule returns **true**

	data-bvStrict="if:service:checked:email"

Adding regular expression rule. Whole rule has to be inside double brackets **{{** **}}**, not just it's parameter

	data-bvStrict="if:service:checked:{{reg:^him|her$}}"

	data-bvStrict="if:type:{{reg:^4$}}:email"

If input with name **service** has value **4**, rule validates input by rule **email**
If **service** is not valid, rule returns **true**
	
	data-bvStrict="ifv:service:4:email"

This does the same as
	
	data-bvStrict="if:service:{{reg:^4$}}:email"

### Combinating rules ###

Input has to be phone or email
	
	data-bvStrict="phone|email"

Input has to be empty or valid email
	
	data-bvStrict="empty|email"

Input has to be both string and number
	
	data-bvStrict="string&number"

Input has to be phone or ( string and number ). **& has bigger priority than |**
	
	data-bvStrict="phone|string&number"

You can combine rules as you want

	data-bvStrict="if:type:{{reg:^2$}}:email|if:type:{{reg:^4$}}:phone|same:password&reg:{{^[\d]{2,3}$}}"


### Other input attributes: ###

Add prefix to value. It's removed before submitting form
	
	data-bvPrepend="\+420 "

Add prefix to value. It's removed before submitting form

	data-bvAppend=" kW"

Placeholder

	data-bvSwitch="Fill name"

Sets value to "@", if input is empty

	data-bvEmpty="@"

Erasing spaces from value

	data-bvTransform="noSpaces"


### Manually validate inputs: ###

	$('inputs').bValidator('validate');


### Check if inputs are valid ###

Returns false if at least one is invalid, otherwise true. This method does not display errors.

	$('inputs').bValidator('isValid');

Validate with different rule

	$('inputs').bValidator('isValid', Array('email'));

## Custom rules ##

	jQuery.bValidator.validation('rule_name', function(value, args, elem) {
	    return true/false;
	});

## Custom transformer ##

	jQuery.bValidator.transformation('transformation_name', function(value) {
		return new_value;
	});

