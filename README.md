jQuery-bValidator
=================

jQuery form validator

## Installation ##

Install via bower

```
bower install --save jquery-bvalidator
```

Link library

```html
<script src="bower_components/jquery-bvalidator/bvalidator.jquery.min.js"></script>
```

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
onFocusIn: 			function(form, element) {}	// Triggered after focusing element
onFocusOut: 		function(form, element) {}	// Triggered after focusing out of element
onKeyUp: 			function(form, element) {}	// Callback after pressing key when is input focused, only for onKeyUpValidate=true
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
	},
	onFocusIn: function(form, element) {
		console.log('Input focused in');
	},
	onFocusOut: function(form, element) {
		console.log('Input focused out');
	},
	onKeyUp: function(form, element) {
		console.log('Key pressed over input');
	}
});
```

### Remove validations: ###

```JavaScript
$('form').bValidator('destruct');
```

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

```html
data-bvStrict="email"
```

Validate input as czech phone number (9 digits)

```html
data-bvStrict="phone"
```

Validate input as number

```html
data-bvStrict="number"
```

Number > 1

```html
data-bvStrict="number:1"
```

Number < 10

```html
data-bvStrict="number::10"
```

Number between 1 and 10

```html
data-bvStrict="number:1:10"
```

Input can't be empty

```html
data-bvStrict="notEmpty"
```

Input has to be empty

```html
data-bvStrict="empty"
```

Input has to be string

```html
data-bvStrict="string"
```

Validate input as a date (wildcards allowed in format string: d, dd, m, mm, yy, yyyy. E.g. `d/m/yy`, `d. m. yyyy`, `dd-mm-yyyy`, `yy, m, d`)

```html
data-bvStrict="date:format"
```

Always invalid input

```html
data-bvStrict="false"
```

Always valid input

```html
data-bvStrict="true"
```

Checkbox has to be checked

```html
data-bvStrict="checked"
```

Validate input by regular expression

```html
data-bvStrict="reg:^[\d]{2,3}$"
```

If regular expression contains **|** or **&**, it has to be inside double brackets **{{** **}}**

```html
data-bvStrict="reg:{{^him|her$}}"
```

### Connected rules ###

Input has to have same value as input with name **password**

```html
data-bvStrict="same:password"
```

### Conditions ###

If input with name **service** is valid by rule **checked**, rule validates input by rule **email**
If **service** is not valid, rule returns **true**

```html
data-bvStrict="if:service:checked:email"
```

Adding regular expression rule. Whole rule has to be inside double brackets **{{** **}}**, not just it's parameter

```html
data-bvStrict="if:service:checked:{{reg:^him|her$}}"

data-bvStrict="if:type:{{reg:^4$}}:email"
```

If input with name **service** has value **4**, rule validates input by rule **email**
If **service** is not valid, rule returns **true**

```html
data-bvStrict="ifv:service:4:email"
```

This does the same as

```html
data-bvStrict="if:service:{{reg:^4$}}:email"
```

### Combinating rules ###

Input has to be phone or email

```html
data-bvStrict="phone|email"
```

Input has to be empty or valid email

```html
data-bvStrict="empty|email"
```

Input has to be both string and number

```html
data-bvStrict="string&number"
```

Input has to be phone or ( string and number ). **& has higher priority than |**

```html
data-bvStrict="phone|string&number"
```

You can combine rules as you want

```html
data-bvStrict="if:type:{{reg:^2$}}:email|if:type:{{reg:^4$}}:phone|same:password&reg:{{^[\d]{2,3}$}}"
```


### Other input attributes: ###

Add prefix to a value. It's removed before submitting form and after focusing input.

```html
data-bvPrepend="\+420 "
```

Add suffix to a value. It's removed before submitting form and after focusing input.

```html
data-bvAppend=" kW"
```

Placeholder. It's removed before submitting form and after focusing input.

```html
data-bvSwitch="Fill name"
```

Sets value to "@", if input is empty. It's removed before submitting form and after focusing input.

```html
data-bvEmpty="@"
```

Erasing spaces from value

```html
data-bvTransform="noSpaces"
```


### Manually validate inputs: ###

```Javascript
$('inputs').bValidator('validate');
```


### Check if inputs are valid ###

Returns false if at least one is invalid, otherwise true. This method does not display errors.

```Javascript
$('inputs').bValidator('isValid');
```

Validate with different rule

```Javascript
$('inputs').bValidator('isValid', Array('email'));
```

## Custom rules ##

```Javascript
jQuery.bValidator.validation('rule_name', function(value, args, elem) {
	return true/false;
});
```

## Custom transformer ##

```Javascript
jQuery.bValidator.transformation('transformation_name', function(value) {
	return new_value;
});
```

