# RML Plugin
This is a plugin for Zyne that generates HTML with a simple template system. You can create your own templates, call them, and define elements with properties and CSS attributes all in the same language. And since it uses Zyne, you can also use advanced features like inserting JavaScript code on the generator at compile time, which allows for database access and more, all inline. This will be implemented as a view engine in a later version, but for now you can use it to convert Zyne source files to HTML files.

## Example Usage

```css
// Clear margin and padding
margin: 0px;
padding: 0px;

// Box template definition
box {content} -> div => {
	display: inline-block;
	margin: 0px;
	padding: 0px;
	content;
}

// Bar template definition
bar {content} -> box {
	display: block;
	text-align: center;
	content;
}

// Font definition and defaults
$font = sans-serif;
font-family: $font;
font-size: 16px;
font($size) -> {
	font-family: $font;
	font-size: $size;
}

// Website navbar
bar {
	background: #11111;
	height: 44px;
	padding-top: 8px;
	padding-bottom: 8px;
	a => {
		href = '/';
		color: white;
		font(32px);
	}
}
```

## Zyne Implementations

These are the implementations of the Zyne language for this plugin.
* `"strings"` Strings as arguments aren't converted, and stay as simple JavaScript strings. If they are used at block level, they are treated as HTML content. The same is true for every other basic literal type, except they aren't really used.  
* `property = item` Properties are used as HTML element properties such as `href`.  
* `attribute: item` Attributes are used as inline CSS attributes in the `style` property, such as `color`. 
* `element => {content}` Elements are converted to HTML elements as you would expect. The contents are applied to this element and it gets appended to the parent element.  
* There are currently no implemented directives, but more will be coming soon.