/*
 * Copyright (C) 2016 Stefano D'Angelo <zanga.mail@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

module.exports = function (Marca)
{
	Marca.encodeText = function (string) {
		return string.replace(/\\/g, "\\\\")
			     .replace(/\{/g, "\\{")
			     .replace(/\}/g, "\\}");
	};

	Marca.decodeText = function (string) {
		return string.replace(/\\\\/g, "\\")
			     .replace(/\\{/g, "{")
			     .replace(/\\}/g, "}");
	};

	Marca.encodeAttribute = function (string) {
		return string.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	};

	Marca.decodeAttribute = function (string) {
		return string.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
	};

	Marca.subParse = function (string) {
		var nodes = [];

		while (string != "") {
			var textRe = /^(?:[^\{\}\\]|\\\{|\\\}|\\\\)+/;
			var text = textRe.exec(string);
			if (text) {
				nodes.push(this.decodeText(text[0]));
				string = string.substring(text[0].length);
				continue;
			}

			if (string.charAt(0) == "}")
				break;

			var elemBeginRe =
				/^\{\s*([\w\-]+)\s*((?:[\w\-]+="(?:(?:[^"\\]|\\"|\\\\)*)"\s*)*):/;
			var elemBegin = elemBeginRe.exec(string);
			if (!elemBegin)
				throw "syntax error";

			var p = this.subParse(string.substring(
							elemBegin[0].length));
			if (p.string.charAt(0) != "}")
				throw "syntax error";

			var elem = { id: elemBegin[1], attributes: {},
				     children: p.nodes };
			var attrRe = /([\w\-]+)="((?:[^"\\]|\\"|\\\\)*)"\s*/g;
			var attr;
			while ((attr = attrRe.exec(elemBegin[2])) != null)
				elem.attributes[attr[1]] =
					this.decodeAttribute(attr[2]);
			nodes.push(elem);

			string = p.string.substring(1);
		}

		return { string: string, nodes: nodes };
	};

	Marca.parse = function (string) {
		var p = this.subParse(string);
		if (p.string != "")
			throw "syntax error";
		return { id: "", attributes: {}, children: p.nodes };
	};
};
