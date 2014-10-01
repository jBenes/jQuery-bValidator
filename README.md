bValidator
==========

jQuery form validator

## Handling form ##

### Init form: ###

	$('form').bValidator();

### Default options ###

```JavaScript
errorClass: 		'error',
errorMessageClass:	'error-message',
validClass: 		'valid',
rowClass: 			'row',
onFocusHideError: 	false			// Hide error after focusing input
onKeyUpValidate: 	false 			// If true, add extra on key up validation
domType:			'row'			// another option: 'direct'. Explained below
onValid: 			function(form, element) {} // Function triggered after succesfully validated element
onInvalid:       	function(form, element) {} // Function triggered after unsuccesfully validated element
beforeSubmit: 		function(form, event) {}	// Function triggered before submitting valid form
onSubmitFail: 		function(form, event) {}	// Function triggered after trying to submit invalid form
```

### Init form with all options: ###

```JavaScript
$('form').bValidator({
	errorClass: 		'alert',
	errorMessageClass:	'alert-message',
	validClass: 		'success',
	rowClass: 			'form-controll',
	onFocusHideError: false, // no reason to allow in combination with onKeyUpValidate = true
	onKeyUpValidate: true,
	domType: 'direct',
	onValid: function(form, element) {
		console.log('Input with name ' + element.attr('name') + ' is valid');
	},
	onInvalid: function(form, element) {
		console.log('Input with name ' + element.attr('name') + ' is invalid');
	},
	onSubmitFail: function(form, event) {
		console.log('Some inputs are not valid');
	},
	beforeSubmit: function(form, event) {
		console.log('Validation success');
	}
});
```

### Remove validations: ###

	$('form').bValidator('destruct');

## HTML structure ##

You can choose html structure from two types (by **domType** option). In both cases, validation rules and other behavior are set by html data attributes.

### Row structure ###

```html
<form>
	<div class="row"> // this element can be span or any other
		<input type="text" data-bvStrict="rule">
		<span class="error-message">Input is not valid</span>
	</div>
	<div class="row">
		<input type="text" data-bvStrict="rule">
		<span class="error-message">Input is not valid</span>
	</div>
</form>
```

If input is invalid, validator adds **error** class to a .row element.
If input is valid, validator adds **valid** class to a .row element.
You can name classes for error/valid messages by your desire, but remember to give it 'display: none' property and change it via rows .error/.valid classes.
HTML structure doesn't have to be flat, you can wrap inputs and messages into another elements.

### Direct structure ###

```html
<form>
	<label for="input1">First input</label>
	<input type="text" name="input1" data-bvStrict="rule">
	<span class="error-message error-input1">First Input is not valid</span>

	<label for="input2">Second input</label>
	<input type="text" name="input2" data-bvStrict="rule">
	<span class="error-message error-input2">Second Input is not valid</span>
</form>
```

If input is invalid, validator adds **error** class to an input, input labels and error message associated by its name.
If input is valid, validator adds **valid** class to an input, input labels and error message associated by its name.
HTML structure doesn't have to be flat, you can wrap inputs, labels and messages into another elements.
Validator searches for labels and error messages only inside form element.

## Working with inputs ##

### Setting validation rules ###

You can set custom validation rule by adding **data-bvStrict** attribute to the input.

Validate input as email

	data-bvStrict="email"

Validate input as czech phone number (9 digits)

	data-bvStrict="phone"

Validate input as number

	data-bvStrict="number"

Number > 1

	data-bvStrict="number:1"

Number < 10

	data-bvStrict="number::10"

Number between 1 and 10

	data-bvStrict="number:1:10"

Input can't be empty

	data-bvStrict="notEmpty"

Input has to be empty

	data-bvStrict="empty"

Input has to be string

	data-bvStrict="string"

Validate input as a date in format dd.mm.yyyy

	data-bvStrict="date-d.m.yy"

Always invalid input

	data-bvStrict="false"

Always valid input

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

Input has to be phone or ( string and number ). **& has higher priority than |**

	data-bvStrict="phone|string&number"

You can combine rules as you want

	data-bvStrict="if:type:{{reg:^2$}}:email|if:type:{{reg:^4$}}:phone|same:password&reg:{{^[\d]{2,3}$}}"


### Other input attributes: ###

Add prefix to a value. It's removed before submitting form and after focusing input.

	data-bvPrepend="\+420 "

Add suffix to a value. It's removed before submitting form and after focusing input.

	data-bvAppend=" kW"

Placeholder. It's removed before submitting form and after focusing input.

	data-bvSwitch="Fill name"

Sets value to "@", if input is empty. It's removed before submitting form and after focusing input.

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

