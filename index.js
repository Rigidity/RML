const {Plugin} = require('zyne');

module.exports = new Plugin()
	.on('start', ctx => {
		ctx._cheerio = ctx.id();
		ctx._pretty = ctx.id();
		ctx.write(`const ${ctx._cheerio} = require('cheerio');`);
		ctx.write(`const ${ctx._pretty} = require('pretty');`);
		ctx._root = ctx.id();
		ctx.write(`const ${ctx._root} = ${ctx._cheerio}.load(\`
			<!DOCTYPE HTML>
			<html>
				<head>
				</head>
				<body>
				</body>
			</html>
		\`);`);
		ctx._body = ctx.id();
		ctx._head = ctx.id();
		ctx.write(`const ${ctx._body} = ${ctx._root}('body');`);
		ctx.write(`const ${ctx._head} = ${ctx._root}('head');`);
		ctx._elements = [ctx._body];
		ctx._element = () => ctx._elements[ctx._elements.length - 1];
		ctx._variables = ctx.id();
		ctx._variable = name => ctx._variables + '_' + name.replace(/\-/g, '$');
		ctx._templates = ctx.id();
		ctx._template = name => ctx._templates + '_' + name.replace(/\-/g, '$');
	})
	.on('element', (ctx, name, code) => {
		const child = ctx.id();
		ctx.write(`const ${child} = ${ctx._root}('<${name}></${name}>');`);
		ctx.write(`${ctx._element()}.append(${child});`);
		ctx._elements.push(child);
		ctx.write(code());
		ctx._elements.pop();
	})
	.on('attribute', (ctx, name, item) => {
		ctx.write(`${ctx._element()}.css('${name}', ${item});`);
	})
	.on('property', (ctx, name, item) => {
		ctx.write(`${ctx._element()}.attr('${name}', ${item});`);
	})
	.on('assignment', (ctx, name, item) => {
		ctx.write(`let ${ctx._variable(name)} = ${item};`);
	})
	.on('variable', (ctx, name, indices) => {
		return `${ctx._variable(name)}${indices.map(index => `[${index}]`).join('')}`;
	})
	.on('define', (ctx, name, params, blocks, code) => {
		const targetId = ctx.id();
		const argsId = ctx.id();
		const blocksId = ctx.id();
		ctx.write(`function ${ctx._template(name)}(${targetId}, ${argsId}, ${blocksId}) {`);
		for (let i = 0; i < params.length; i++) {
			const param = params[i];
			ctx.write(`let ${ctx._variable(param)} = ${argsId}[${i}];`);
		}
		for (let j = 0; j < blocks.length; j++) {
			const block = blocks[j];
			ctx.write(`let ${ctx._template(block)} = ${blocksId}[${j}];`);
		}
		ctx._elements.push(targetId);
		ctx.write(code());
		ctx._elements.pop();
		ctx.write('}');
	})
	.on('call', (ctx, name, args, blocks) => {
		const targetId = ctx.id();
		const templates = [];
		ctx._elements.push(targetId);
		blocks.forEach(block => {
			const templateId = ctx.id();
			ctx.write(`function ${templateId}(${targetId}) {`);
			ctx.write(block());
			ctx.write('}');
			templates.push(templateId);
		});
		ctx._elements.pop();
		ctx.write(`${ctx._template(name)}(${ctx._element()}, [${args.join(', ')}], [${templates.join(', ')}]);`);
	})
	.on('list', (ctx, items, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + [${items.join(', ')}]);`);
		else return '[' + items.join(', ') + ']';
	})
	.on('code', (ctx, text, block) => {
		return text;
	})
	.on('string', (ctx, text, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + ${text});`);
		else return text;
	})
	.on('identifier', (ctx, text, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + '${text}');`);
		else return `'${text}'`;
	})
	.on('number', (ctx, text, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + ${text});`);
		else return text;
	})
	.on('color', (ctx, text, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + ${text});`);
		else return text;
	})
	.on('boolean', (ctx, text, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + ${text});`);
		else return text;
	})
	.on('regex', (ctx, text, block) => {
		if (block) ctx.write(`${ctx._element()}.html(${ctx._element()}.html() + ${text});`);
		else return text;
	})
	.on('stop', ctx => {
		ctx.write(`${ctx._pretty}(${ctx._root}.html())`);
	})
;